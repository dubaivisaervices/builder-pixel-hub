// Bulk category fetcher for Dubai visa and immigration services
const categories = [
  "Visa consulting services Dubai",
  "Visa agent Dubai",
  "Immigration Consultants Dubai",
  "Consultants Dubai",
  "Education services Dubai",
  "Work permit Dubai",
  "Europe Work Visa Consultants Dubai",
  "Canada Visa Agent Dubai",
  "USA Student Visa Consultants Dubai",
  "US Immigration Consultants Dubai",
  "USA Tourist Visa Agents Dubai",
  "UK Immigration Consultants Dubai",
  "UK Work Visa Consultants Dubai",
  "UK Student Visa Consultants Dubai",
  "MARA Agent Dubai",
  "Australia PR Consultant Dubai",
  "Australia Immigration Agents Dubai",
  "Australia Student Visa Services Dubai",
  "Australia Work Visa Consultants Dubai",
  "Europe Work Visa Agent Dubai",
  "Canada Immigration Consultants Dubai",
  "Canada PR Visa Agents Dubai",
  "Canada Work Permit Consultant Dubai",
  "Canada Express Entry Consultant Dubai",
  "Best Canada Immigration Agency Dubai",
  "Canada Student Visa Consultant Dubai",
  "Canada Tourist Visa Agents Dubai",
  "Immigration naturalization service Dubai",
  "Germany Work permit Visa agency Dubai",
  "Czech Republic work permit visa agency Dubai",
  "Cyprus work visa permit agency Dubai",
  "Netherlands Work permit Visa agency Dubai",
  "France work permit visa agency Dubai",
  "Hungary work permit visa agency Dubai",
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

async function fetchBusinessesForCategory(category, index) {
  console.log(`\n🔍 [${index + 1}/${categories.length}] Fetching: ${category}`);

  try {
    const response = await fetch("/api/admin/fetch-google-businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchQuery: category,
        maxResults: 20, // Reasonable limit per category
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

    const result = await response.json();

    if (result.success) {
      console.log(
        `✅ [${index + 1}] ${category}: ${result.businessesFound || 0} businesses found`,
      );
      return {
        category,
        success: true,
        businessesFound: result.businessesFound || 0,
        summary: result.summary,
      };
    } else {
      console.log(`❌ [${index + 1}] ${category}: ${result.error}`);
      return {
        category,
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.log(`❌ [${index + 1}] ${category}: ${error.message}`);
    return {
      category,
      success: false,
      error: error.message,
    };
  }
}

async function fetchAllCategories() {
  console.log(`🚀 Starting bulk fetch for ${categories.length} categories...`);

  const results = [];
  let totalBusinesses = 0;
  let totalSuccessful = 0;

  for (let i = 0; i < categories.length; i++) {
    const result = await fetchBusinessesForCategory(categories[i], i);
    results.push(result);

    if (result.success) {
      totalBusinesses += result.businessesFound || 0;
      totalSuccessful++;
    }

    // Add delay between requests to avoid rate limiting
    if (i < categories.length - 1) {
      console.log(`⏱️ Waiting 3 seconds before next request...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n📊 BULK FETCH COMPLETE:`);
  console.log(
    `   ✅ Successful categories: ${totalSuccessful}/${categories.length}`,
  );
  console.log(`   🏢 Total businesses found: ${totalBusinesses}`);
  console.log(
    `   ❌ Failed categories: ${categories.length - totalSuccessful}`,
  );

  // Show detailed results
  console.log(`\n📋 DETAILED RESULTS:`);
  results.forEach((result, index) => {
    const status = result.success ? "✅" : "❌";
    const count = result.success
      ? `(${result.businessesFound} businesses)`
      : `(${result.error})`;
    console.log(`   ${status} ${result.category} ${count}`);
  });

  return {
    totalCategories: categories.length,
    successfulCategories: totalSuccessful,
    totalBusinesses,
    results,
  };
}

// Start the bulk fetch
fetchAllCategories()
  .then((summary) => {
    console.log(
      `\n🎉 Bulk fetch completed! ${summary.totalBusinesses} new businesses added to database.`,
    );
  })
  .catch((error) => {
    console.error(`💥 Bulk fetch failed:`, error);
  });
