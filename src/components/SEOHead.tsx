import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const SEOHead = ({
  title = 'Saksham AI - Intelligent Internship Platform',
  description = 'AI-powered internship discovery and career guidance platform. Find your perfect internship match with smart recommendations.',
  keywords = 'internships, jobs, AI, career guidance, students, recruitment, India',
  image = '/og-image.jpg',
  url = window.location.href,
  type = 'website',
  author = 'Team HexaCoders',
  publishedTime,
  modifiedTime
}: SEOHeadProps) => {
  const fullTitle = title.includes('Saksham AI') ? title : `${title} | Saksham AI`;
  const fullImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Saksham AI" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en-IN" />
    </Helmet>
  );
};