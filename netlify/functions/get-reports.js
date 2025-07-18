// Simplified company reports function for Netlify
exports.handler = async (event, context) => {
  console.log("🔍 Get reports function called");
  console.log("🔍 Path:", event.path);
  console.log("🔍 Method:", event.httpMethod);

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Only handle GET
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Extract company ID from path
    let companyId = "unknown";

    if (event.pathParameters && event.pathParameters.companyId) {
      companyId = event.pathParameters.companyId;
    } else {
      const pathMatch = event.path.match(/\/([^\/]+)$/);
      if (pathMatch) {
        companyId = pathMatch[1];
      }
    }

    console.log("🔍 Company ID:", companyId);

    // Sample reports data
    const sampleReports = {
      "ChIJBVX2jx9DXz4RX2vu4AWa-sg": [
        {
          id: "netlify_report_1",
          issueType: "poor_service",
          description:
            "Long waiting times and unprofessional staff. Documents were delayed without proper communication.",
          incidentDate: "2024-01-15",
          amountLost: "AED 1,500",
          createdAt: "2024-01-20T10:30:00Z",
          approvedAt: "2024-01-21T14:20:00Z",
          votes: { helpful: 12, notHelpful: 2 },
          reporterName: "A**** K.",
        },
      ],
    };

    const reports = sampleReports[companyId] || [];

    const response = {
      success: true,
      companyId: companyId,
      totalReports: reports.length,
      reports: reports,
      source: "netlify_function",
      message: `${reports.length} reports loaded from Netlify function`,
      debug: {
        path: event.path,
        pathParameters: event.pathParameters,
        extractedCompanyId: companyId,
      },
    };

    console.log("✅ Returning reports:", response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("❌ Error in get-reports function:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch reports",
        details: error.message,
        success: false,
        reports: [],
      }),
    };
  }
};
