/**
 * Dynamic OG Tag Injector
 * Injects meta tags dynamically for social media sharing
 * Works for internship pages and comparison pages
 */

export interface OGTagConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  keywords?: string[];
}

/**
 * Inject OG tags into the document head
 * Call this on component mount for pages you want to be shareable
 */
export const injectOGTags = (config: OGTagConfig) => {
  // Remove existing OG tags to avoid duplicates
  removeExistingOGTags();

  const {
    title,
    description,
    image = "https://hexaforces.netlify.app/og-default.png",
    url = window.location.href,
    type = "website",
    keywords = [],
  } = config;

  // Create meta tags
  const metaTags = [
    // Primary Meta Tags
    { name: "title", content: title },
    { name: "description", content: description },
    keywords.length > 0
      ? { name: "keywords", content: keywords.join(", ") }
      : null,

    // Open Graph / Facebook
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:site_name", content: "Saksham AI" },

    // Twitter
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:url", content: url },
    { property: "twitter:title", content: title },
    { property: "twitter:description", content: description },
    { property: "twitter:image", content: image },

    // LinkedIn
    { property: "linkedin:title", content: title },
    { property: "linkedin:description", content: description },
    { property: "linkedin:image", content: image },
  ].filter((tag) => tag !== null);

  // Add canonical URL
  let canonical = document.querySelector(
    "link[rel='canonical']"
  ) as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link") as HTMLLinkElement;
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  // Inject all meta tags
  metaTags.forEach((tag) => {
    const meta = document.createElement("meta");

    if ("property" in tag) {
      meta.setAttribute("property", tag.property!);
      meta.content = tag.content;
    } else if ("name" in tag) {
      meta.setAttribute("name", tag.name!);
      meta.content = tag.content;
    }

    document.head.appendChild(meta);
  });

  // Update document title
  document.title = title;
};

/**
 * Remove all existing OG tags to avoid duplicates
 */
export const removeExistingOGTags = () => {
  // Remove meta tags with property or name starting with og:, twitter:, linkedin:
  const selectors = [
    'meta[property^="og:"]',
    'meta[property^="twitter:"]',
    'meta[property^="linkedin:"]',
    'meta[name="title"]',
    'meta[name="description"]',
    'meta[name="keywords"]',
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((tag) => {
      tag.remove();
    });
  });
};

/**
 * Generate OG tags for an internship
 */
export const generateInternshipOGTags = (internship: any) => {
  const title = `${internship.title} at ${internship.company}`;
  const location =
    typeof internship.location === "string"
      ? internship.location
      : internship.location?.city || "India";
  const description = `${internship.title} • ${location} • ${internship.stipend} • Saksham AI`;
  const url = `https://hexaforces.netlify.app/internship/${internship.id}`;

  return {
    title,
    description,
    image: internship.logo || "https://hexaforces.netlify.app/og-default.png",
    url,
    keywords: [
      internship.title,
      internship.company,
      location,
      internship.sector || "internship",
      "opportunity",
    ],
  };
};

/**
 * Generate OG tags for a comparison
 */
export const generateComparisonOGTags = (
  internships: any[],
  customTitle?: string
) => {
  const count = internships.length;
  const companies = internships
    .map((i) => i.company)
    .slice(0, 2)
    .join(" vs ");
  const title = customTitle || `Compare ${companies} Internships`;
  const description = `Compare ${count} internship opportunity${
    count > 1 ? "ies" : ""
  } on Saksham AI`;
  const ids = internships.map((i) => i.id).join(",");
  const url = `https://hexaforces.netlify.app/shared-comparison?ids=${ids}`;

  return {
    title,
    description,
    image: "https://hexaforces.netlify.app/og-comparison.png",
    url,
    keywords: [
      "comparison",
      "internship",
      "opportunity",
      ...internships.map((i) => i.company),
    ],
  };
};
