import { RequestHandler } from "express";

export const autoFetchDubaiVisa: RequestHandler = async (req, res) => {
  try {
    console.log(
      "🚀 Starting automated Dubai visa/immigration businesses fetch...",
    );

    // Improved search terms - broader and more likely to return results
    const categories = [
      "visa services Dubai",
      "immigration consultants Dubai",
      "visa agency Dubai",
      "immigration services Dubai",
      "UAE visa Dubai",
      "visa consultant Dubai",
      "visa processing Dubai",
      "immigration lawyer Dubai",
      "work permit Dubai",
      "residence visa Dubai",
      "visit visa Dubai",
      "tourist visa Dubai",
      "business visa Dubai",
      "family visa Dubai",
      "golden visa Dubai",
      "immigration office Dubai",
      "visa center Dubai",
      "Emirates ID Dubai",
      "labour card Dubai",
      "document attestation Dubai",
      "visa medical Dubai",
      "PRO services Dubai",
      "government relations Dubai",
      "typing center Dubai",
      "translation services Dubai",
      "visa renewal Dubai",
      "visa cancellation Dubai",
      "entry permit Dubai",
      "dependent visa Dubai",
      "investor visa Dubai",
      "freelancer visa Dubai",
      "green visa Dubai",
      "student visa Dubai",
      "medical visa Dubai",
      "UK visa Dubai",
      "US visa Dubai",
      "Canada visa Dubai",
      "Australia visa Dubai",
      "Schengen visa Dubai",
      "Europe visa Dubai",
    ];

    let totalBusinesses = 0;
    let successfulCategories = 0;
    let errors: string[] = [];

    // Send initial response to prevent timeout
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 Starting bulk fetch for ${categories.length} Dubai visa/immigration categories...\n\n`,
    );

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const progress = `[${i + 1}/${categories.length}]`;

      res.write(
        `🔍 ${progress} Fetching: ${category.replace(" Dubai", "")}...\n`,
      );

      try {
        // Make internal fetch request to existing enhanced Google fetcher
        const fetchUrl = `${req.protocol}://${req.get("host")}/api/admin/fetch-google-businesses`;

        const response = await fetch(fetchUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            searchQuery: category,
            maxResults: 20,
            radius: 75,
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
            totalBusinesses += found;
            successfulCategories++;
            res.write(
              `✅ ${progress} ${category.replace(" Dubai", "")}: ${found} businesses found\n`,
            );
          } else {
            const errorMsg = `❌ ${progress} ${category.replace(" Dubai", "")}: ${result.error}`;
            res.write(errorMsg + "\n");
            errors.push(errorMsg);
          }
        } else {
          const errorText = await response.text();
          const errorMsg = `❌ ${progress} ${category.replace(" Dubai", "")}: HTTP ${response.status} - ${errorText}`;
          res.write(errorMsg + "\n");
          errors.push(errorMsg);
        }
      } catch (error) {
        const errorMsg = `❌ ${progress} ${category.replace(" Dubai", "")}: ${error.message}`;
        res.write(errorMsg + "\n");
        errors.push(errorMsg);
      }

      // Add delay between requests to avoid rate limiting
      if (i < categories.length - 1) {
        res.write(`⏳ Waiting 2 seconds before next category...\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Final summary
    res.write(`\n🎉 BULK FETCH COMPLETE!\n`);
    res.write(`📊 Total businesses fetched: ${totalBusinesses}\n`);
    res.write(
      `✅ Successful categories: ${successfulCategories}/${categories.length}\n`,
    );

    if (errors.length > 0) {
      res.write(`❌ Errors encountered: ${errors.length}\n`);
      res.write(`\nError details:\n${errors.slice(0, 5).join("\n")}\n`);
      if (errors.length > 5) {
        res.write(`... and ${errors.length - 5} more errors\n`);
      }
    }

    res.write(
      `\n✨ Database should now contain significantly more Dubai visa/immigration businesses!`,
    );
    res.end();
  } catch (error) {
    console.error("Auto-fetch error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Automated fetch failed",
      });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
