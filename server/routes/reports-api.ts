import { Request, Response } from "express";
import { database } from "../database/database";

export const submitReport = async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      companyName,
      issueType,
      description,
      reporterName,
      reporterEmail,
      amountLost,
      dateOfIncident,
      evidenceDescription,
      employeeName,
    } = req.body;

    if (!companyId || !companyName || !issueType || !description) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Handle file uploads (if any)
    let paymentReceiptPath = null;
    let agreementCopyPath = null;

    // In a real implementation, you would save files to disk or cloud storage
    // For now, we'll just note that files were uploaded
    const files = req.files as any;
    if (files?.paymentReceipt) {
      paymentReceiptPath = `uploads/receipts/${reportId}_receipt.${files.paymentReceipt.name.split(".").pop()}`;
      console.log(
        `���� Payment receipt uploaded: ${files.paymentReceipt.name}`,
      );
    }
    if (files?.agreementCopy) {
      agreementCopyPath = `uploads/agreements/${reportId}_agreement.${files.agreementCopy.name.split(".").pop()}`;
      console.log(`📁 Agreement copy uploaded: ${files.agreementCopy.name}`);
    }

    // Insert report into database
    await database.run(
      `INSERT INTO reports (
        id, company_id, company_name, issue_type, description,
        reporter_name, reporter_email, amount_lost, date_of_incident,
        evidence_description, employee_name, payment_receipt_path,
        agreement_copy_path, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reportId,
        companyId,
        companyName,
        issueType,
        description,
        reporterName,
        reporterEmail,
        amountLost || 0,
        dateOfIncident,
        evidenceDescription || "",
        employeeName || "",
        paymentReceiptPath,
        agreementCopyPath,
        "pending",
        new Date().toISOString(),
      ],
    );

    console.log(`📋 New report submitted for ${companyName}: ${issueType}`);
    console.log(`👤 Employee mentioned: ${employeeName || "Not specified"}`);
    console.log(`💰 Amount lost: AED ${amountLost || 0}`);

    res.json({
      success: true,
      message: "Report submitted successfully",
      reportId,
      filesUploaded: {
        paymentReceipt: !!paymentReceiptPath,
        agreementCopy: !!agreementCopyPath,
      },
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({
      error: "Failed to submit report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getCompanyReports = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { status = "approved" } = req.query;

    const reports = await database.all(
      `SELECT
        id, issue_type, description, amount_lost, date_of_incident,
        evidence_description, status, created_at, updated_at
      FROM reports
      WHERE company_id = ? AND status = ?
      ORDER BY created_at DESC`,
      [companyId, status],
    );

    // Add some formatting and anonymize reporter info
    const formattedReports = reports.map((report) => ({
      id: report.id,
      issueType: report.issue_type,
      description: report.description,
      amountLost: report.amount_lost,
      dateOfIncident: report.date_of_incident,
      evidenceDescription: report.evidence_description,
      status: report.status,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
    }));

    res.json({
      reports: formattedReports,
      total: formattedReports.length,
    });
  } catch (error) {
    console.error("Error fetching company reports:", error);
    res.status(500).json({
      error: "Failed to fetch reports",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const { status = "pending", limit = 50 } = req.query;

    const reports = await database.all(
      `SELECT
        id, company_id, company_name, issue_type, description,
        reporter_name, reporter_email, amount_lost, date_of_incident,
        evidence_description, status, created_at, updated_at
      FROM reports
      WHERE status = ?
      ORDER BY created_at DESC
      LIMIT ?`,
      [status, limit],
    );

    res.json({
      reports,
      total: reports.length,
    });
  } catch (error) {
    console.error("Error fetching all reports:", error);
    res.status(500).json({
      error: "Failed to fetch reports",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    await database.run(
      `UPDATE reports
       SET status = ?, admin_notes = ?, updated_at = ?
       WHERE id = ?`,
      [status, adminNotes || "", new Date().toISOString(), reportId],
    );

    console.log(`📋 Report ${reportId} status updated to: ${status}`);

    res.json({
      success: true,
      message: "Report status updated successfully",
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({
      error: "Failed to update report status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
