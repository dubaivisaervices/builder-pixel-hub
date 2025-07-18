import { RequestHandler } from "express";
import fetch from "node-fetch";

export const testNetlifyCredentials: RequestHandler = async (req, res) => {
  try {
    const { NETLIFY_ACCESS_TOKEN, NETLIFY_SITE_ID } = process.env;

    console.log("🔍 Testing Netlify credentials...");

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      credentials: {
        hasAccessToken: !!NETLIFY_ACCESS_TOKEN,
        accessTokenLength: NETLIFY_ACCESS_TOKEN?.length || 0,
        accessTokenPreview: NETLIFY_ACCESS_TOKEN
          ? `${NETLIFY_ACCESS_TOKEN.slice(0, 10)}...`
          : "Not set",
        hasSiteId: !!NETLIFY_SITE_ID,
        siteId: NETLIFY_SITE_ID || "Not set",
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
      },
      message:
        NETLIFY_ACCESS_TOKEN && NETLIFY_SITE_ID
          ? "✅ Netlify credentials are configured"
          : "❌ Netlify credentials are missing",
    };

    if (!NETLIFY_ACCESS_TOKEN || !NETLIFY_SITE_ID) {
      result.success = false;
      return res.status(400).json(result);
    }

    // Test Netlify API connection
    try {
      const testResponse = await fetch(
        `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}`,
        {
          headers: {
            Authorization: `Bearer ${NETLIFY_ACCESS_TOKEN}`,
          },
        },
      );

      if (testResponse.ok) {
        const siteData = await testResponse.json();
        result.message = "✅ Netlify API connection successful";
        result.siteInfo = {
          name: siteData.name,
          url: siteData.url,
          state: siteData.state,
        };
      } else {
        result.success = false;
        result.message = `❌ Netlify API error: ${testResponse.status} ${testResponse.statusText}`;
      }
    } catch (apiError) {
      result.success = false;
      result.message = `❌ Netlify API connection failed: ${apiError.message}`;
    }

    res.json(result);
  } catch (error) {
    console.error("❌ Error testing Netlify credentials:", error);
    res.status(500).json({
      success: false,
      error: "Failed to test Netlify credentials",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
};
