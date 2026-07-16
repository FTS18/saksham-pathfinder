import { VercelRequest, VercelResponse } from "@vercel/node";
import { Handler } from "@netlify/functions";

export function netlifyToVercel(netlifyHandler: Handler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // 1. Map req headers
    const headers: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      headers[key] = Array.isArray(value) ? value.join(", ") : value;
    }

    // 2. Map query parameters
    const queryStringParameters: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(req.query)) {
      queryStringParameters[key] = Array.isArray(value) ? value.join(", ") : value;
    }

    // 3. Stringify body if it was pre-parsed by Vercel
    const bodyStr = typeof req.body === "string" 
      ? req.body 
      : (req.body ? JSON.stringify(req.body) : "");

    // 4. Map to Netlify HandlerEvent
    const event = {
      httpMethod: req.method || "GET",
      path: req.url || "",
      headers,
      body: bodyStr,
      queryStringParameters,
      multiValueHeaders: {},
      multiValueQueryStringParameters: {},
      isBase64Encoded: false,
    };

    try {
      // 5. Call original Netlify handler
      const result = await netlifyHandler(event, {} as any);
      
      if (!result) {
        res.status(500).json({ error: "Internal Server Error (No result from handler)" });
        return;
      }

      // 6. Set response headers
      if (result.headers) {
        for (const [key, value] of Object.entries(result.headers)) {
          res.setHeader(key, String(value));
        }
      }

      // 7. Send status and body
      res.status(result.statusCode).send(result.body);
    } catch (error) {
      console.error("Error in wrapped Vercel handler:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
