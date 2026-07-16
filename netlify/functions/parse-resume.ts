import { Handler } from '@netlify/functions';
import Busboy from 'busboy';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const parseMultipartForm = (event: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: {
        ...event.headers,
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    });

    let fileBuffer: Buffer | null = null;

    busboy.on('file', (name, file, info) => {
      const chunks: Buffer[] = [];
      file.on('data', (data) => {
        chunks.push(data);
      });
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on('finish', () => {
      if (fileBuffer) {
        resolve(fileBuffer);
      } else {
        reject(new Error('No file uploaded'));
      }
    });

    busboy.on('error', (err) => {
      reject(err);
    });

    // Netlify functions body is base64 encoded if binary
    busboy.write(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
    busboy.end();
  });
};

export const handler: Handler = async (event) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const fileBuffer = await parseMultipartForm(event);
    
    // Parse PDF Text
    const data = await pdfParse(fileBuffer);
    const rawText = data.text;

    if (!rawText || rawText.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Could not extract text from PDF.' })
      };
    }

    // Use Gemini to structure the data
    const prompt = `
      Extract the following information from the resume text provided below.
      Format the output strictly as a JSON object with the following schema:
      {
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "linkedin": "LinkedIn profile username/slug if any",
        "github": "GitHub username/slug if any",
        "skills": ["Skill 1", "Skill 2"],
        "experience": ["Company Name - Role - Duration - Description snippet"],
        "education": ["University - Degree - Duration"]
      }

      Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
      
      Resume Text:
      ${rawText.substring(0, 15000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonString = response.text().trim();

    // Clean up potential markdown formatting
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace('```json', '').replace('```', '').trim();
    } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```/g, '').trim();
    }

    let parsedData = {};
    try {
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse Gemini JSON output', jsonString);
      throw new Error('AI returned invalid format');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...parsedData,
        rawText
      })
    };
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
