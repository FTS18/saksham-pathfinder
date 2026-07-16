import { VercelRequest, VercelResponse } from "@vercel/node";
import Busboy from "busboy";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function parseMultipartForm(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers as any });
    let fileBuffer: Buffer | null = null;

    busboy.on("file", (_name, file) => {
      const chunks: Buffer[] = [];
      file.on("data", (data: Buffer) => chunks.push(data));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on("finish", () => {
      if (fileBuffer) resolve(fileBuffer);
      else reject(new Error("No file uploaded"));
    });

    busboy.on("error", reject);
    req.pipe(busboy);
  });
}

export const config = {
  api: {
    bodyParser: false, // Required for multipart/form-data
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const fileBuffer = await parseMultipartForm(req);
    const data = await pdfParse(fileBuffer);
    const rawText = data.text;

    if (!rawText?.trim()) {
      return res
        .status(400)
        .json({ error: "Could not extract text from PDF." });
    }

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

      Return ONLY valid JSON. Do not include markdown formatting.

      Resume Text:
      ${rawText.substring(0, 15000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonString = response.text().trim();

    // Strip markdown code fences if present
    jsonString = jsonString
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedData = {};
    try {
      parsedData = JSON.parse(jsonString);
    } catch {
      throw new Error("AI returned invalid format");
    }

    return res.status(200).json({ ...parsedData, rawText });
  } catch (error: any) {
    console.error("[Parse Resume] Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
