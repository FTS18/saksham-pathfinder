// Job API integration for fetching real internship data

interface JobApiResponse {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  url: string;
  posted_date: string;
}

// Adzuna API integration
export const fetchAdzunaJobs = async (query: string = "internship", location: string = "india") => {
  const APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
  const APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;
  
  if (!APP_ID || !APP_KEY) {
    console.warn('Adzuna API credentials not configured');
    return [];
  }

  try {
    const allowedHosts = ['api.adzuna.com'];
    const baseUrl = 'https://api.adzuna.com';
    
    const response = await fetch(
      `${baseUrl}/v1/api/jobs/in/search/1?app_id=${encodeURIComponent(APP_ID)}&app_key=${encodeURIComponent(APP_KEY)}&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}&results_per_page=50`
    );
    
    const data = await response.json();
    
    return data.results?.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary: job.salary_min ? `₹${job.salary_min.toLocaleString()}` : 'Not disclosed',
      description: job.description,
      url: job.redirect_url,
      posted_date: job.created
    })) || [];
  } catch (error) {
    console.warn('Adzuna API unavailable');
    return [];
  }
};

// JSearch API (RapidAPI) integration
export const fetchJSearchJobs = async (query: string = "internship in india") => {
  const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
  
  if (!API_KEY) {
    console.warn('RapidAPI key not found');
    return [];
  }

  try {
    const allowedHosts = ['jsearch.p.rapidapi.com'];
    const host = 'jsearch.p.rapidapi.com';
    
    if (!allowedHosts.includes(host)) {
      throw new Error('Invalid API host');
    }
    
    const url = `https://${host}/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=in&date_posted=all`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': host
      }
    });
    
    const data = await response.json();
    
    return data.data?.map((job: any) => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ''}, ${job.job_country || 'India'}`.replace(', ,', ',').trim(),
      salary: job.job_salary || 'Not disclosed',
      description: job.job_description?.substring(0, 200) + '...' || 'No description available',
      url: job.job_apply_link || job.job_google_link || '#',
      posted_date: job.job_posted_at_datetime_utc
    })) || [];
  } catch (error) {
    console.warn('JSearch API unavailable');
    return [];
  }
};

// Combine multiple APIs for better coverage
export const fetchAllInternships = async () => {
  try {
    // Focus on JSearch API since we have working credentials
    const jsearchJobs = await fetchJSearchJobs();
    return jsearchJobs;
  } catch (error) {
    console.warn('External API services unavailable');
    return [];
  }
};