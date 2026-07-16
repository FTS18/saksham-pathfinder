import admin from 'firebase-admin';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import axios from 'axios';

// Load env vars if running locally (.env)
dotenv.config();

// 1. Initialize Firebase Admin
let db;
try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  
  if (serviceAccount.private_key) {
    // Fix escaped newlines when loaded from dotenv strings
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true }); // Prevent crashes from undefined values
  console.log('Firebase Admin initialized successfully.');
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

// ---------------------------------------------------------
// UTILS: Retry logic & Data Validation
// ---------------------------------------------------------

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Fetch failed for ${url}, retrying in ${backoff}ms...`);
      await delay(backoff);
      backoff *= 2; // exponential backoff
    }
  }
}

function validateAndSanitizeJob(job) {
  // Prevent Firestore crashes from undefined/null critical fields
  if (!job.id || !job.title || !job.company) {
    console.warn(`Skipping invalid job missing core fields:`, job.title || 'Unknown');
    return null;
  }
  
  return {
    id: String(job.id).replace(/\//g, '-'), // Firestore doesn't like slashes in IDs
    source: job.source || 'Unknown',
    title: job.title || 'Untitled Role',
    company: job.company || 'Unknown Company',
    location: job.location || 'Not Specified',
    stipend: job.stipend || 'Unpaid / Not Disclosed',
    duration: job.duration || 'Not specified',
    apply_link: job.apply_link || null,
    sector_tags: (Array.isArray(job.sector_tags) ? job.sector_tags : []).filter(Boolean),
    required_skills: (Array.isArray(job.required_skills) ? job.required_skills : []).filter(Boolean),
    description: job.description || 'No description provided.',
    work_mode: job.work_mode || 'On-site',
    posted_at: job.posted_at || new Date().toISOString(),
    is_active: true
  };
}

// ---------------------------------------------------------
// SCRAPERS
// ---------------------------------------------------------

async function scrapeInternshala() {
  console.log('Scraping Internshala...');
  try {
    const response = await fetchWithRetry('https://internshala.com/internships/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const internships = [];
    
    $('.individual_internship').each((i, element) => {
      if (i >= 20) return; // limit to 20 for batch safety
      
      const title = $(element).find('.job-internship-name').text().trim();
      const company = $(element).find('.company-name').text().trim();
      const location = $(element).find('.locations').text().trim().replace(/[\n\t]/g, '');
      const stipend = $(element).find('.stipend').text().trim();
      const link = $(element).attr('data-href') || $(element).find('.job-internship-name a').attr('href');
      
      internships.push(validateAndSanitizeJob({
        id: `internshala-${company.toLowerCase().replace(/[^a-z0-9]/g, '')}-${i}`,
        source: 'Internshala',
        title,
        company,
        location,
        stipend,
        duration: $(element).find('.item_body:contains("Months")').text().trim(),
        apply_link: link ? `https://internshala.com${link}` : null,
        sector_tags: ["Internship"],
        description: `Live internship listing from Internshala. Company: ${company}`,
        work_mode: (location || '').toLowerCase().includes('work from home') ? 'Remote' : 'On-site',
      }));
    });
    
    const validJobs = internships.filter(j => j !== null);
    console.log(` Internshala: Found ${validJobs.length} valid jobs`);
    return validJobs;
  } catch (error) {
    console.error(' Internshala Scraping failed completely:', error.message);
    throw error; // Let Promise.allSettled catch it
  }
}

async function fetchArbeitnow() {
  console.log('Fetching Arbeitnow API...');
  try {
    const response = await fetchWithRetry('https://arbeitnow.com/api/job-board-api', {
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    if (!data || !data.data) return [];
    
    const jobs = data.data.slice(0, 20).map((job) => validateAndSanitizeJob({
      id: `arbeitnow-${job.slug}`,
      source: 'Arbeitnow',
      title: job.title,
      company: job.company_name,
      location: job.location || "Remote",
      stipend: "Competitive",
      apply_link: job.url,
      sector_tags: job.tags ? [job.tags[0]] : ["Remote"],
      required_skills: job.tags || [],
      description: job.description || "Live position fetched from Arbeitnow.",
      work_mode: job.remote ? 'Remote' : 'On-site',
      posted_at: new Date(job.created_at * 1000).toISOString(),
    }));
    
    const validJobs = jobs.filter(j => j !== null);
    console.log(` Arbeitnow: Fetched ${validJobs.length} valid jobs`);
    return validJobs;
  } catch (error) {
    console.error(' Arbeitnow Fetch failed completely:', error.message);
    throw error;
  }
}

// Optional JSearch Implementation (requires API key)
async function fetchJSearch() {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.log('️ Skipping JSearch: RAPIDAPI_KEY not provided in .env');
    return [];
  }

  console.log('Fetching JSearch API...');
  try {
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: { query: 'internship OR software engineer in India', page: '1', num_pages: '1' },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const data = response.data.data;
    
    if (!data) return [];

    const jobs = data.map((job, index) => validateAndSanitizeJob({
      id: `jsearch-${job.job_id || index}`,
      source: 'JSearch (Google Jobs)',
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ''}, ${job.job_country || ''}`,
      stipend: job.job_min_salary ? `$${job.job_min_salary}/yr` : "Not Disclosed",
      apply_link: job.job_apply_link,
      work_mode: job.job_is_remote ? 'Remote' : 'On-site',
      description: job.job_description || "No description provided.",
      posted_at: job.job_posted_at_datetime_utc || new Date().toISOString()
    }));

    const validJobs = jobs.filter(j => j !== null);
    console.log(` JSearch: Fetched ${validJobs.length} valid jobs`);
    return validJobs;
  } catch (error) {
    console.error(' JSearch Fetch failed completely:', error.message);
    throw error;
  }
}

// ---------------------------------------------------------
// ADZUNA IMPLEMENTATION
// ---------------------------------------------------------
async function fetchAdzuna() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  
  if (!appId || !appKey) {
    console.log('️ Skipping Adzuna: ADZUNA_APP_ID or ADZUNA_APP_KEY not provided in .env');
    return [];
  }

  console.log('Fetching Adzuna API...');
  try {
    // Search for software/internships in India (in)
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=internship%20or%20software`;
    
    const response = await fetchWithRetry(url, { headers: { 'Accept': 'application/json' } });
    const data = await response.json();
    
    if (!data || !data.results) return [];

    const jobs = data.results.map((job) => validateAndSanitizeJob({
      id: `adzuna-${job.id}`,
      source: 'Adzuna',
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || 'India',
      stipend: job.salary_min ? `₹${job.salary_min} - ₹${job.salary_max}` : "Not Disclosed",
      apply_link: job.redirect_url,
      work_mode: job.title.toLowerCase().includes('remote') || job.description.toLowerCase().includes('remote') ? 'Remote' : 'On-site',
      description: job.description || "No description provided.",
      posted_at: job.created || new Date().toISOString()
    }));

    const validJobs = jobs.filter(j => j !== null);
    console.log(` Adzuna: Fetched ${validJobs.length} valid jobs`);
    return validJobs;
  } catch (error) {
    console.error(' Adzuna Fetch failed completely:', error.message);
    throw error;
  }
}

// ---------------------------------------------------------
// MAIN SYNC RUNNER
// ---------------------------------------------------------

async function runSync() {
  try {
    console.log(' Starting Bulletproof Job Sync Pipeline...');
    
    // Use allSettled so if one scraper fails, the others still proceed
    const results = await Promise.allSettled([
      scrapeInternshala(),
      fetchArbeitnow(),
      fetchJSearch(),
      fetchAdzuna()
    ]);
    
    // Combine all successful results
    const allJobs = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allJobs.push(...result.value);
      }
    });
    
    if (allJobs.length === 0) {
      console.log('️ No jobs found from any source to sync. Exiting.');
      process.exit(0);
    }
    
    console.log(` Syncing ${allJobs.length} total robust jobs to Firestore...`);
    
    // Write in batches of 500 (Firestore limit)
    const batch = db.batch();
    const internshipsRef = db.collection('live_internships');
    
    allJobs.forEach(job => {
      const docRef = internshipsRef.doc(job.id);
      batch.set(docRef, job, { merge: true });
    });
    
    await batch.commit();
    console.log(' Successfully committed robust batch to Firestore!');
    process.exit(0);
    
  } catch (error) {
    console.error(' CRITICAL PIPELINE FAILURE:', error);
    process.exit(1);
  }
}

runSync();
