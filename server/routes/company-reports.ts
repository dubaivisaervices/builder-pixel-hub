import { RequestHandler } from "express";
import { businessService } from "../database/businessService";

interface CompanyReport {
  id: string;
  companyId: string;
  companyName: string;
  reportType: string;
  issueType: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
  amountLost?: string;
  incidentDate: string;
  status: "pending" | "approved" | "rejected";
  adminApproved: boolean;
  createdAt: string;
  approvedAt?: string;
  votes: {
    helpful: number;
    notHelpful: number;
  };
}

// Mock reports database (in real app, this would be a proper database)
let reportsDatabase: CompanyReport[] = [
  {
    id: "report_1",
    companyId: "ChIJBVX2jx9DXz4RX2vu4AWa-sg", // Paradise Migration Services
    companyName: "Paradise Migration Services",
    reportType: "scam",
    issueType: "poor_service",
    description:
      "Long waiting times and unprofessional staff. Documents were delayed without proper communication. They promised 5 working days but took 3 weeks.",
    reporterName: "Ahmed K.",
    reporterEmail: "ahmed.k@email.com",
    incidentDate: "2024-01-15",
    status: "approved",
    adminApproved: true,
    createdAt: "2024-01-20T10:30:00Z",
    approvedAt: "2024-01-21T14:20:00Z",
    votes: {
      helpful: 12,
      notHelpful: 2,
    },
  },
  {
    id: "report_2",
    companyId: "ChIJBVX2jx9DXz4RX2vu4AWa-sg",
    companyName: "Paradise Migration Services",
    reportType: "scam",
    issueType: "hidden_fees",
    description:
      "They quoted AED 1,500 but charged an additional AED 800 for 'processing fees' that were not mentioned initially. Very misleading pricing.",
    reporterName: "Sarah M.",
    reporterEmail: "sarah.m@email.com",
    amountLost: "AED 800",
    incidentDate: "2024-01-10",
    status: "approved",
    adminApproved: true,
    createdAt: "2024-01-18T16:45:00Z",
    approvedAt: "2024-01-19T09:15:00Z",
    votes: {
      helpful: 8,
      notHelpful: 1,
    },
  },
];

/**
 * Check if company exists in database
 */
export const checkCompanyExists: RequestHandler = async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({
        error: "Company name is required",
      });
    }

    console.log(`🔍 Checking if company exists: ${companyName}`);

    // Search for company in business database
    const businesses = await businessService.getAllBusinesses();
    const foundCompany = businesses.find(
      (business) =>
        business.name.toLowerCase().includes(companyName.toLowerCase()) ||
        companyName.toLowerCase().includes(business.name.toLowerCase()),
    );

    if (foundCompany) {
      console.log(`✅ Company found: ${foundCompany.name}`);
      return res.json({
        exists: true,
        company: {
          id: foundCompany.id,
          name: foundCompany.name,
          address: foundCompany.address,
          category: foundCompany.category,
        },
      });
    } else {
      console.log(`❌ Company not found: ${companyName}`);
      return res.json({
        exists: false,
        message: "Company not found in our database",
        suggestion: "You can add this company for admin review",
      });
    }
  } catch (error) {
    console.error("❌ Error checking company:", error);
    res.status(500).json({
      error: "Failed to check company",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Submit new company for admin approval
 */
export const submitNewCompany: RequestHandler = async (req, res) => {
  try {
    const {
      companyName,
      companyLocation,
      companyWebsite,
      companyEmail,
      companyPhone,
      reporterName,
      reporterEmail,
    } = req.body;

    if (!companyName || !companyLocation || !reporterName || !reporterEmail) {
      return res.status(400).json({
        error: "Required fields missing",
        required: [
          "companyName",
          "companyLocation",
          "reporterName",
          "reporterEmail",
        ],
      });
    }

    console.log(`📝 New company submission: ${companyName}`);

    // In real app, save to pending companies table
    const submissionId = `company_${Date.now()}`;

    // Simulate saving to database
    console.log(`✅ Company submission saved with ID: ${submissionId}`);

    res.json({
      success: true,
      submissionId,
      message: "Company submitted for admin review",
      estimatedApproval: "24-48 hours",
      nextSteps: [
        "Our admin team will verify the company information",
        "You will receive an email confirmation once approved",
        "You can then submit your report for this company",
      ],
    });
  } catch (error) {
    console.error("❌ Error submitting company:", error);
    res.status(500).json({
      error: "Failed to submit company",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Submit report for a company
 */
export const submitReport: RequestHandler = async (req, res) => {
  try {
    const {
      companyId,
      companyName,
      reportType,
      issueType,
      description,
      reporterName,
      reporterEmail,
      amountLost,
      incidentDate,
    } = req.body;

    if (
      !companyId ||
      !companyName ||
      !issueType ||
      !description ||
      !reporterName ||
      !reporterEmail
    ) {
      return res.status(400).json({
        error: "Required fields missing",
      });
    }

    const reportId = `report_${Date.now()}`;
    const newReport: CompanyReport = {
      id: reportId,
      companyId,
      companyName,
      reportType: reportType || "scam",
      issueType,
      description,
      reporterName,
      reporterEmail,
      amountLost,
      incidentDate,
      status: "pending",
      adminApproved: false,
      createdAt: new Date().toISOString(),
      votes: {
        helpful: 0,
        notHelpful: 0,
      },
    };

    // Add to reports database
    reportsDatabase.push(newReport);

    console.log(`✅ Report submitted: ${reportId} for company: ${companyName}`);

    res.json({
      success: true,
      reportId,
      message: "Report submitted successfully",
      status: "pending_admin_approval",
      estimatedReview: "24-48 hours",
    });
  } catch (error) {
    console.error("❌ Error submitting report:", error);
    res.status(500).json({
      error: "Failed to submit report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get approved reports for a company
 */
export const getCompanyReports: RequestHandler = async (req, res) => {
  try {
    // Ensure JSON content type
    res.setHeader("Content-Type", "application/json");

    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        error: "Company ID is required",
      });
    }

    // Get only approved reports for this company
    const companyReports = reportsDatabase.filter(
      (report) =>
        report.companyId === companyId && report.adminApproved === true,
    );

    console.log(
      `📊 Retrieved ${companyReports.length} approved reports for company: ${companyId}`,
    );

    res.json({
      success: true,
      companyId,
      totalReports: companyReports.length,
      reports: companyReports.map((report) => ({
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
          "*".repeat(report.reporterName.length - 1), // Anonymize
      })),
    });
  } catch (error) {
    console.error("❌ Error getting company reports:", error);
    res.status(500).json({
      error: "Failed to get company reports",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Vote on a report (helpful/not helpful)
 */
export const voteOnReport: RequestHandler = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { voteType } = req.body; // "helpful" or "notHelpful"

    if (
      !reportId ||
      !voteType ||
      !["helpful", "notHelpful"].includes(voteType)
    ) {
      return res.status(400).json({
        error: "Invalid vote parameters",
      });
    }

    const reportIndex = reportsDatabase.findIndex(
      (report) => report.id === reportId,
    );

    if (reportIndex === -1) {
      return res.status(404).json({
        error: "Report not found",
      });
    }

    // Update vote count
    if (voteType === "helpful") {
      reportsDatabase[reportIndex].votes.helpful += 1;
    } else {
      reportsDatabase[reportIndex].votes.notHelpful += 1;
    }

    console.log(`👍 Vote recorded: ${voteType} for report: ${reportId}`);

    res.json({
      success: true,
      reportId,
      voteType,
      newVotes: reportsDatabase[reportIndex].votes,
    });
  } catch (error) {
    console.error("❌ Error voting on report:", error);
    res.status(500).json({
      error: "Failed to vote on report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get reports statistics for admin
 */
export const getReportsStats: RequestHandler = async (req, res) => {
  try {
    const totalReports = reportsDatabase.length;
    const approvedReports = reportsDatabase.filter(
      (r) => r.adminApproved,
    ).length;
    const pendingReports = reportsDatabase.filter(
      (r) => !r.adminApproved,
    ).length;

    const reportsByType = reportsDatabase.reduce(
      (acc, report) => {
        acc[report.issueType] = (acc[report.issueType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    res.json({
      success: true,
      stats: {
        total: totalReports,
        approved: approvedReports,
        pending: pendingReports,
        byType: reportsByType,
      },
    });
  } catch (error) {
    console.error("❌ Error getting reports stats:", error);
    res.status(500).json({
      error: "Failed to get reports stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
