// Real API integrations for live data
export class APIIntegrations {
  
  // LinkedIn Jobs API (requires partnership)
  async getLinkedInJobs() {
    const token = import.meta.env.VITE_LINKEDIN_TOKEN;
    if (!token) {
      console.warn('LinkedIn token not configured');
      return [];
    }
    
    const allowedHosts = ['api.linkedin.com'];
    const url = 'https://api.linkedin.com/v2/jobSearch';
    const urlObj = new URL(url);
    
    if (!allowedHosts.includes(urlObj.hostname)) {
      throw new Error('Invalid API host');
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    return response.json();
  }

  // Indeed API
  async getIndeedJobs() {
    const publisherId = import.meta.env.VITE_INDEED_PUBLISHER_ID;
    if (!publisherId) {
      console.warn('Indeed publisher ID not configured');
      return [];
    }
    
    const allowedHosts = ['api.indeed.com'];
    const url = `https://api.indeed.com/ads/apisearch?publisher=${encodeURIComponent(publisherId)}&q=internship&l=india&format=json`;
    const urlObj = new URL(url);
    
    if (!allowedHosts.includes(urlObj.hostname)) {
      throw new Error('Invalid API host');
    }
    
    const response = await fetch(url);
    return response.json();
  }

  // Naukri.com API (if available)
  async getNaukriJobs() {
    // Custom scraping or API if available
    const response = await fetch('/api/naukri-scrape');
    return response.json();
  }

  // Government job portals
  async getGovernmentJobs() {
    const sources = [
      'https://www.sarkariresult.com/internship/',
      'https://employment.gov.in/hi'
    ];
    
    const jobs = [];
    for (const url of sources) {
      try {
        const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        jobs.push(...data);
      } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error);
      }
    }
    
    return jobs;
  }

  // Company career pages
  async getCompanyJobs() {
    const companies = [
      { name: 'TCS', url: 'https://www.tcs.com/careers/india' },
      { name: 'Infosys', url: 'https://www.infosys.com/careers/' },
      { name: 'Wipro', url: 'https://careers.wipro.com/' },
      { name: 'Reliance', url: 'https://www.ril.com/careers' }
    ];

    const allJobs = [];
    for (const company of companies) {
      try {
        const response = await fetch(`/api/company-scrape?url=${encodeURIComponent(company.url)}&company=${company.name}`);
        const jobs = await response.json();
        allJobs.push(...jobs);
      } catch (error) {
        console.error(`Failed to fetch ${company.name} jobs:`, error);
      }
    }

    return allJobs;
  }

  // Combine all sources
  async getAllJobs() {
    const [linkedin, indeed, naukri, govt, company] = await Promise.allSettled([
      this.getLinkedInJobs(),
      this.getIndeedJobs(), 
      this.getNaukriJobs(),
      this.getGovernmentJobs(),
      this.getCompanyJobs()
    ]);

    const allJobs = [];
    
    if (linkedin.status === 'fulfilled') allJobs.push(...linkedin.value);
    if (indeed.status === 'fulfilled') allJobs.push(...indeed.value);
    if (naukri.status === 'fulfilled') allJobs.push(...naukri.value);
    if (govt.status === 'fulfilled') allJobs.push(...govt.value);
    if (company.status === 'fulfilled') allJobs.push(...company.value);

    return allJobs;
  }
}