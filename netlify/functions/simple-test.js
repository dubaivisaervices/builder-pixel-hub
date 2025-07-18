exports.handler = async (event, context) => {
  console.log("🔍 Simple test function called");
  console.log("🔍 Event:", JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      message: "Netlify function working!",
      timestamp: new Date().toISOString(),
      path: event.path,
      method: event.httpMethod,
      headers: event.headers,
      environment: "netlify-functions",
    }),
  };
};
