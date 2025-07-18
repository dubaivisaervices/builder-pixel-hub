import { RequestHandler } from "express";

export const fetchVisaCategories: RequestHandler = async (req, res) => {
  try {
    console.log("🚀 Starting targeted visa categories fetch for Dubai...");

    // Specific categories as requested by user
    const categories = [
      "visa agent Dubai",
      "consultants Dubai",
      "visa consulting services Dubai",
      "work visa agent Dubai",
      "immigration consultant Dubai",
      "visa services Dubai",
      "immigration agent Dubai",
      "work permit agent Dubai",
    ];

    let totalBusinesses = 0;
    let successfulCategories = 0;
    let errors: string[] = [];

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 Starting fetch for ${categories.length} targeted visa categories in Dubai...\n\n`,
    );

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const progress = `[${i + 1}/${categories.length}]`;

      res.write(`🔍 ${progress} Fetching: ${category}...\n`);

      try {
        // Make internal fetch request to enhanced Google fetcher
        const fetchUrl = `${req.protocol}://${req.get("host")}/api/admin/fetch-google-businesses`;

        const response = await fetch(fetchUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            searchQuery: category,
            maxResults: 25, // Increased for better coverage
            radius: 50,
            minRating: 0,
            downloadImages: true,
            saveToDatabase: true,
            getReviews: true,
            skipExisting: true,
            filters: {
              companyName: null,
              category: category.replace(" Dubai", ""),
              city: "Dubai",
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const found = result.businessesFound || 0;
            const saved = result.businessesSaved || 0;
            totalBusinesses += found;
            successfulCategories++;
            res.write(
              `✅ ${progress} ${category}: Found ${found} businesses, Saved ${saved} to database\n`,
            );
          } else {
            const errorMsg = `❌ ${progress} ${category}: ${result.error || "Unknown error"}`;
            res.write(errorMsg + "\n");
            errors.push(errorMsg);
          }
        } else {
          const errorText = await response.text();
          const errorMsg = `❌ ${progress} ${category}: HTTP ${response.status} - ${errorText.substring(0, 100)}`;
          res.write(errorMsg + "\n");
          errors.push(errorMsg);
        }
      } catch (error) {
        const errorMsg = `❌ ${progress} ${category}: ${error.message}`;
        res.write(errorMsg + "\n");
        errors.push(errorMsg);
      }

      // Add delay between requests to respect API rate limits
      if (i < categories.length - 1) {
        res.write(`⏳ Waiting 3 seconds before next category...\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Final summary
    res.write(`\n🎉 TARGETED FETCH COMPLETE!\n`);
    res.write(`📊 Total businesses found: ${totalBusinesses}\n`);
    res.write(
      `✅ Successful categories: ${successfulCategories}/${categories.length}\n`,
    );

    if (errors.length > 0) {
      res.write(`❌ Errors encountered: ${errors.length}\n`);
      if (errors.length <= 3) {
        res.write(`\nError details:\n${errors.join("\n")}\n`);
      }
    }

    res.write(
      `\n✨ Dubai visa agent and consultant businesses added to database!`,
    );
    res.end();
  } catch (error) {
    console.error("Fetch error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
