exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const databaseUrl = process.env.NEON_DATABASE_URL;

    // Return diagnostic info about the connection string
    const response = {
      hasUrl: !!databaseUrl,
      urlLength: databaseUrl ? databaseUrl.length : 0,
      startsWithPostgres: databaseUrl
        ? databaseUrl.startsWith("postgresql://")
        : false,
      endsWithSsl: databaseUrl
        ? databaseUrl.endsWith("?sslmode=require")
        : false,
      urlPreview: databaseUrl
        ? `${databaseUrl.substring(0, 20)}...${databaseUrl.substring(databaseUrl.length - 20)}`
        : "Not set",
      error: null,
    };

    // Try to parse the URL
    if (databaseUrl) {
      try {
        const url = new URL(databaseUrl);
        response.hostname = url.hostname;
        response.database = url.pathname.substring(1);
        response.username = url.username;
        response.hasPassword = !!url.password;
      } catch (parseError) {
        response.error = `URL parse error: ${parseError.message}`;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        hasUrl: !!process.env.NEON_DATABASE_URL,
      }),
    };
  }
};
