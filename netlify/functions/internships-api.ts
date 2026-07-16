import { Handler } from "@netlify/functions";

// Types
interface BaseInternship {
  id: string;
  pmis_id: string;
  title: string;
  company: string;
  location: string;
  stipend: string;
  apply_link: string;
  sector: string;
  required_skills: string[];
  description: string;
  work_mode: string;
  posted_date: string;
}

// Function to fetch from Arbeitnow (Real remote jobs/internships - free, no auth)
async function fetchArbeitnow(): Promise<BaseInternship[]> {
  try {
    const response = await fetch('https://arbeitnow.com/api/job-board-api', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'UpSkillers-Pathfinder-API/1.0'
      }
    });

    if (!response.ok) {
      console.warn(`Arbeitnow API returned status ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!data || !data.data) {
      return [];
    }
    
    return data.data.slice(0, 15).map((job: any, index: number) => ({
      id: `arbeitnow-${index}`,
      pmis_id: `LIVE-ARB-${index}`,
      title: job.title,
      company: job.company_name,
      location: job.location || "Remote",
      stipend: "Competitive", // Arbeitnow usually doesn't provide stipend directly
      apply_link: job.url,
      sector: job.tags ? job.tags[0] : "Tech",
      required_skills: job.tags || ["Software"],
      description: "Live position fetched securely from Arbeitnow.",
      work_mode: job.remote ? 'Remote' : 'On-site',
      posted_date: new Date(job.created_at * 1000).toISOString()
    }));
  } catch (error) {
    console.error('Arbeitnow Fetch failed:', error);
    return [];
  }
}

// Function to fetch from JSearch (RapidAPI)
async function fetchJSearch(): Promise<BaseInternship[]> {
  const rapidApiKey = process.env.VITE_RAPIDAPI_KEY;
  if (!rapidApiKey) {
    return []; // Skip if no API key is provided
  }

  try {
    const response = await fetch('https://jsearch.p.rapidapi.com/search?query=internship%20in%20india&num_pages=1', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data || !data.data) return [];

    return data.data.slice(0, 15).map((job: any, index: number) => ({
      id: `jsearch-${job.job_id || index}`,
      pmis_id: `LIVE-JSH-${index}`,
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ''}, ${job.job_country || 'India'}`.trim(),
      stipend: "Not Disclosed",
      apply_link: job.job_apply_link || job.job_google_link,
      sector: "Various",
      required_skills: ["General"], // JSearch doesn't always provide clean skills array
      description: job.job_description ? job.job_description.substring(0, 500) + '...' : 'Live position fetched via JSearch API.',
      work_mode: job.job_is_remote ? 'Remote' : 'On-site',
      posted_date: job.job_posted_at_datetime_utc || new Date().toISOString()
    }));
  } catch (error) {
    console.error('JSearch Fetch failed:', error);
    return [];
  }
}

export const handler: Handler = async (event, context) => {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Fetch from configured APIs in parallel
    const [arbeitnowData, jsearchData] = await Promise.all([
      fetchArbeitnow(),
      fetchJSearch()
    ]);
    
    // Combine results
    let allData = [...arbeitnowData, ...jsearchData];
    
    // Simple shuffle to mix API results
    allData = allData.sort(() => 0.5 - Math.random()); 
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: allData.length,
        data: allData
      })
    };
  } catch (error: any) {
    console.error("[Internships API] Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch live data", details: error.message })
    };
  }
};
