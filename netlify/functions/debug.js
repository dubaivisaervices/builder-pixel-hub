exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      message: "Netlify Functions are working!",
      timestamp: new Date().toISOString(),
      environment: "netlify",
      debug: {
        path: event.path,
        httpMethod: event.httpMethod,
        headers: event.headers,
        pathParameters: event.pathParameters,
        queryStringParameters: event.queryStringParameters,
      },
      availableEndpoints: [
        "/.netlify/functions/debug - This debug endpoint",
        "/.netlify/functions/get-reviews - Reviews API",
        "/.netlify/functions/get-reports - Reports API",
        "/.netlify/functions/simple-test - Simple test",
      ],
      instructions: [
        "Visit your-site.netlify.app/api/debug to test this",
        "Visit your-site.netlify.app/api/business-reviews/test-id for reviews",
        "Visit your-site.netlify.app/api/reports/company/test-id for reports",
      ],
    }),
  };
};
