import { Handler } from "@netlify/functions";

// This function is called by URL rewrite to inject dynamic OG tags
// Accessed at: /internship/:id or similar
// Netlify will rewrite requests to this function, which returns HTML with OG tags

const handler: Handler = async (event, context) => {
  try {
    // Get the internship ID from query params or path
    const internshipId =
      event.queryStringParameters?.id || event.path?.split("/").pop();

    if (!internshipId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Internship ID not provided" }),
      };
    }

    // Fetch internship data from Firestore via a REST API call
    // You'll need to create a cloud function or use Firestore's REST API
    let internship: any = null;

    try {
      // Option 1: Call your own backend API that queries Firestore
      const response = await fetch(
        `${process.env.FIRESTORE_API_URL}/internships/${internshipId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FIRESTORE_API_KEY}`,
          },
        }
      );

      if (response.ok) {
        internship = await response.json();
      }
    } catch (err) {
      console.error("Failed to fetch internship data:", err);
      // Continue with defaults if API fails
    }

    // Generate OG tags
    const title = internship?.title || "Internship Opportunity";
    const company = internship?.company || "Saksham AI";
    const description =
      internship?.description?.substring(0, 160) ||
      `Explore this ${
        internship?.sector || "exciting"
      } internship opportunity on Saksham AI. Perfect for students looking to gain real-world experience.`;
    const location =
      typeof internship?.location === "string"
        ? internship.location
        : internship?.location?.city || "India";
    const stipend = internship?.stipend || "Competitive";
    const image =
      internship?.logo || "https://hexaforces.netlify.app/og-default.png";

    // Full preview text for social sharing
    const previewText = `${title} at ${company} | ${location} | ${stipend}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(title)} - ${escapeHtml(company)} | Saksham AI</title>
    <meta name="title" content="${escapeHtml(title)} - ${escapeHtml(
      company
    )} | Saksham AI">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="internship, ${escapeHtml(
      company
    )}, ${escapeHtml(location)}, ${internship?.sector || "opportunity"}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://hexaforces.netlify.app/internship/${internshipId}">
    <meta property="og:title" content="${escapeHtml(title)} - ${escapeHtml(
      company
    )}">
    <meta property="og:description" content="${escapeHtml(previewText)}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Saksham AI">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://hexaforces.netlify.app/internship/${internshipId}">
    <meta property="twitter:title" content="${escapeHtml(title)} - ${escapeHtml(
      company
    )}">
    <meta property="twitter:description" content="${escapeHtml(previewText)}">
    <meta property="twitter:image" content="${image}">
    
    <!-- LinkedIn -->
    <meta property="linkedin:title" content="${escapeHtml(
      title
    )} - ${escapeHtml(company)}">
    <meta property="linkedin:description" content="${escapeHtml(description)}">
    <meta property="linkedin:image" content="${image}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://hexaforces.netlify.app/internship/${internshipId}">
    
    <!-- Redirect to actual app -->
    <meta http-equiv="refresh" content="0;url=https://hexaforces.netlify.app/">
    <script>
        window.location.href = 'https://hexaforces.netlify.app/';
    </script>
</head>
<body>
    <p>Redirecting to Saksham AI...</p>
</body>
</html>
    `;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
      body: html,
    };
  } catch (error) {
    console.error("Error generating OG tags:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate preview" }),
    };
  }
};

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export { handler };
