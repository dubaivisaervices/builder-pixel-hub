import { RequestHandler } from "express";

interface CompanyRequest {
  name: string;
  address: string;
  city: string;
  description?: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

// In-memory storage for demo - in production, use a database
let companyRequests: CompanyRequest[] = [];

export const addCompanyRequest: RequestHandler = async (req, res) => {
  try {
    const { name, address, city, description } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({
        error: "Company name, address, and city are required",
      });
    }

    const newRequest: CompanyRequest = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      description: description?.trim() || "",
      requestedAt: new Date().toISOString(),
      status: "pending",
    };

    companyRequests.push(newRequest);

    console.log(`📝 New company addition request: ${name} in ${city}`);

    res.json({
      success: true,
      message: "Company addition request submitted successfully",
      requestId: companyRequests.length,
    });
  } catch (error) {
    console.error("Error processing company request:", error);
    res.status(500).json({
      error: "Failed to submit company request",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getCompanyRequests: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      requests: companyRequests.map((request, index) => ({
        id: index + 1,
        ...request,
      })),
    });
  } catch (error) {
    console.error("Error fetching company requests:", error);
    res.status(500).json({
      error: "Failed to fetch company requests",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateCompanyRequestStatus: RequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const index = parseInt(requestId) - 1;
    if (index < 0 || index >= companyRequests.length) {
      return res.status(404).json({
        error: "Company request not found",
      });
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be 'approved', 'rejected', or 'pending'",
      });
    }

    companyRequests[index].status = status;

    res.json({
      success: true,
      message: `Company request ${status} successfully`,
      request: {
        id: parseInt(requestId),
        ...companyRequests[index],
      },
    });
  } catch (error) {
    console.error("Error updating company request:", error);
    res.status(500).json({
      error: "Failed to update company request",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
