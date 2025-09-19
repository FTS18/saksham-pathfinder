import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEOHead = ({ 
  title = 'Saksham AI - AI-Powered Internship Recommendations',
  description = 'Find perfect internships with AI-powered recommendations. Saksham AI matches students with internships based on skills, location, and preferences.',
  keywords = 'internship, AI, recommendations, students, jobs, career, machine learning',
  image = '/og-image.png',
  url = window.location.href
}: SEOHeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Team HexaCoders" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};