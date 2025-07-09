import { RequestHandler } from "express";
import { businessService } from "../database/businessService";

export const fixBusinessEmailsAndWebsites: RequestHandler = async (
  req,
  res,
) => {
  try {
    console.log("🔧 Starting to fix business emails and websites...");

    // Get all businesses
    const businesses = await businessService.getAllBusinesses();
    let updatedCount = 0;

    for (const business of businesses) {
      let needsUpdate = false;
      const updates: any = {};

      // Generate proper email format with info@
      if (!business.email || !business.email.includes("info@")) {
        // Create domain from business name
        const domain =
          business.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "") // Remove special characters
            .replace(/\s+/g, "") // Remove spaces
            .substring(0, 20) + // Limit length
          ".ae";

        updates.email = `info@${domain}`;
        needsUpdate = true;
      }

      // Generate proper website format
      if (!business.website || !business.website.startsWith("https://")) {
        // Create website from business name
        const websiteName = business.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "") // Remove special characters
          .replace(/\s+/g, "") // Remove spaces
          .substring(0, 20); // Limit length

        updates.website = `https://${websiteName}.ae`;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await businessService.updateBusiness(business.id, updates);
        updatedCount++;
        console.log(
          `✅ Updated ${business.name}: email=${updates.email}, website=${updates.website}`,
        );
      }
    }

    console.log(
      `🎉 Fixed ${updatedCount} businesses with proper email and website formats`,
    );

    res.json({
      success: true,
      message: `Fixed ${updatedCount} businesses with proper email and website formats`,
      totalBusinesses: businesses.length,
      updatedBusinesses: updatedCount,
    });
  } catch (error) {
    console.error("❌ Error fixing business data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fix business data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
