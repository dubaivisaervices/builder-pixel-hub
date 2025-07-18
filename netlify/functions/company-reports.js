const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

let supabase = null;
if (
  supabaseUrl !== "https://placeholder-url.supabase.co" &&
  supabaseKey !== "placeholder-key"
) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Mock reports data (matching Fly.io structure)
const mockReportsDatabase = {
  "ChIJBVX2jx9DXz4RX2vu4AWa-sg": [
    // Paradise Migration Services (sample reports)
    {
      id: "report_1",
      companyId: "ChIJBVX2jx9DXz4RX2vu4AWa-sg",
      companyName: "Paradise Migration Services",
      issueType: "poor_service",
      description:
        "Long waiting times and unprofessional staff. Documents were delayed without proper communication. They promised 5 working days but took 3 weeks.",
      incidentDate: "2024-01-15",
      amountLost: "AED 1,500",
      createdAt: "2024-01-20T10:30:00Z",
      approvedAt: "2024-01-21T14:20:00Z",
      votes: {
        helpful: 12,
        notHelpful: 2,
      },
      reporterName: "Ahmed K.",
    },
    {
      id: "report_2",
      companyId: "ChIJBVX2jx9DXz4RX2vu4AWa-sg",
      companyName: "Paradise Migration Services",
      issueType: "hidden_fees",
      description:
        "They quoted AED 1,500 but charged an additional AED 800 for 'processing fees' that were not mentioned initially. Very misleading pricing.",
      incidentDate: "2024-01-10",
      amountLost: "AED 800",
      createdAt: "2024-01-18T16:45:00Z",
      approvedAt: "2024-01-19T09:15:00Z",
      votes: {
        helpful: 8,
        notHelpful: 1,
      },
      reporterName: "Sarah M.",
    },
  ],
  // Add sample reports for Cross Border Visa Services (for demo)
  ChIJcrossborservices123: [
    {
      id: "report_cross_1",
      companyId: "ChIJcrossborservices123",
      companyName: "Cross Border Visa Services",
      issueType: "poor_service",
      description:
        "I had issues with delayed visa processing. The company promised 7-day processing but it took over 3 weeks. Multiple follow-ups were required and communication was poor.",
      incidentDate: "2024-01-15",
      amountLost: "AED 2,500",
      createdAt: "2024-01-20T10:30:00Z",
      approvedAt: "2024-01-21T14:20:00Z",
      votes: {
        helpful: 12,
        notHelpful: 3,
      },
      reporterName: "Ahmed K.",
    },
  ],
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight" }),
    };
  }

  // Only handle GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Extract company ID from path - handle both direct path and query string
    let companyId = null;

    // Try to get from path parameters first
    if (event.pathParameters && event.pathParameters.companyId) {
      companyId = event.pathParameters.companyId;
    } else {
      // Fallback to parsing the path
      const pathParts = event.path.split("/");
      companyId = pathParts[pathParts.length - 1];
    }

    console.log(`🔍 Path: ${event.path}, Extracted companyId: ${companyId}`);

    if (!companyId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Company ID is required" }),
      };
    }

    console.log(`🔍 Fetching reports for company: ${companyId}`);

    let reports = [];

    // Try to get reports from Supabase first
    if (supabase) {
      try {
        const { data: supabaseReports, error } = await supabase
          .from("company_reports")
          .select("*")
          .eq("company_id", companyId)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && supabaseReports && supabaseReports.length > 0) {
          reports = supabaseReports.map((report) => ({
            id: report.id,
            issueType: report.report_type || "general",
            description: report.description,
            incidentDate: report.created_at?.split("T")[0],
            amountLost: `AED ${report.amount_lost || "Not specified"}`,
            createdAt: report.created_at,
            approvedAt: report.updated_at,
            votes: {
              helpful: report.helpful_votes || 0,
              notHelpful: report.not_helpful_votes || 0,
            },
            reporterName:
              report.reporter_name?.charAt(0) +
              "*".repeat(report.reporter_name?.length - 1 || 0),
          }));

          console.log(
            `✅ Found ${reports.length} reports in Supabase for ${companyId}`,
          );
        }
      } catch (supabaseError) {
        console.log(
          "Supabase error, falling back to mock data:",
          supabaseError.message,
        );
      }
    }

    // Fallback to mock data if no Supabase reports found
    if (reports.length === 0) {
      const mockReports = mockReportsDatabase[companyId] || [];
      reports = mockReports.map((report) => ({
        id: report.id,
        issueType: report.issueType,
        description: report.description,
        incidentDate: report.incidentDate,
        amountLost: report.amountLost,
        createdAt: report.createdAt,
        approvedAt: report.approvedAt,
        votes: report.votes,
        reporterName:
          report.reporterName.charAt(0) +
          "*".repeat(report.reporterName.length - 1),
      }));

      console.log(
        `📭 Using mock data: ${reports.length} reports for ${companyId}`,
      );
    }

    const response = {
      success: true,
      companyId: companyId,
      totalReports: reports.length,
      reports: reports,
      source: reports.length > 0 && supabase ? "database" : "mock_data",
      message: `${reports.length} approved reports loaded`,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error fetching company reports:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to get company reports",
        details: error.message,
        success: false,
        companyId: "",
        totalReports: 0,
        reports: [],
      }),
    };
  }
};
