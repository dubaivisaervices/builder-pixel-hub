import { RequestHandler } from "express";

export const autoFetchDubaiVisa: RequestHandler = async (req, res) => {
  try {
    console.log(
      "🚀 Starting automated Dubai visa/immigration businesses fetch...",
    );

    const categories = [
      "UAE Golden Visa consultants Dubai",
      "UAE residence visa consultants Dubai",
      "UAE investment visa consultants Dubai",
      "UAE family visa consultants Dubai",
      "UAE employment visa consultants Dubai",
      "UAE business visa consultants Dubai",
      "UAE retirement visa consultants Dubai",
      "UAE visit visa consultants Dubai",
      "UAE tourist visa consultants Dubai",
      "UAE transit visa consultants Dubai",
      "Visa renewal services Dubai",
      "Visa cancellation services Dubai",
      "Emirates ID services Dubai",
      "Labour card services Dubai",
      "Work permit consultants Dubai",
      "Medical insurance for visa Dubai",
      "Visa medical test Dubai",
      "Document attestation services Dubai",
      "Document translation services Dubai",
      "Visa photography services Dubai",
      "Immigration lawyers Dubai",
      "Immigration consultants Dubai",
      "Deportation appeal services Dubai",
      "Visa ban removal services Dubai",
      "Entry permit services Dubai",
      "Change status visa Dubai",
      "Dependent visa services Dubai",
      "Investor visa consultants Dubai",
      "Freelancer visa Dubai",
      "Green visa UAE Dubai",
      "Blue collar visa Dubai",
      "Domestic worker visa Dubai",
      "Student visa consultants Dubai",
      "Medical visa Dubai",
      "UK visa consultants Dubai",
      "US visa consultants Dubai",
      "Canada visa consultants Dubai",
      "Australia visa consultants Dubai",
      "New Zealand visa consultants Dubai",
      "Schengen visa consultants Dubai",
      "Germany work permit visa agency Dubai",
      "Romania work permit visa agency Dubai",
      "Poland work permit agents agency Dubai",
      "Spain work permit visa agency Dubai",
      "Portugal work permit visa agency Dubai",
      "Italy seasonal work permit visa agency Dubai",
      "Malta work permit visa agency Dubai",
      "Luxembourg work visa agency Dubai",
      "Greece work permit agency Dubai",
      "Norway Work Permit Visa agency Dubai",
      "Work permit Consultants Dubai",
      "Visit visa consultants Dubai",
      "Work visa agency Dubai",
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
            maxResults: 15,
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
