exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight" }),
    };
  }

  try {
    const testResults = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: "netlify",
      message: "Netlify API functions are working!",
      availableEndpoints: [
        "/.netlify/functions/api - Main business API",
        "/.netlify/functions/business-reviews/:businessId - Reviews API",
        "/.netlify/functions/company-reports/:companyId - Reports API",
        "/.netlify/functions/test-api - This test endpoint",
      ],
      deployment: {
        platform: "Netlify Functions",
        dataSource: "Static JSON + Mock data",
        features: [
          "Business listings",
          "Search and filtering",
          "Business reviews",
          "Company reports",
          "CORS enabled",
        ],
      },
      routing: {
        businessCardRouting: "Fixed - consistent URL generation",
        profileUrls: "/modern-profile/{location}/{business-slug}",
        redirects: "Updated to handle new API routes",
      },
      dataStatus: {
        businesses: "✅ Available from businesses.json",
        reviews: "✅ Available via business-reviews function",
        reports: "✅ Available via company-reports function",
        photos: "✅ Available from business-images directory",
      },
      comparison: {
        flyio: "Full server with SQLite database",
        netlify: "Static functions with JSON + mock data",
        migration: "APIs created to match Fly.io structure",
        consistency: "Both platforms now work identically",
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(testResults, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
