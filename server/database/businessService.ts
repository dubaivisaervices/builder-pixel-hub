import { database } from "./database";
import { BusinessData, BusinessReview } from "@shared/google-business";

export class BusinessService {
  // Insert or update a business
  async upsertBusiness(business: BusinessData): Promise<void> {
    const existingBusiness = await database.get(
      "SELECT id FROM businesses WHERE id = ?",
      [business.id],
    );

    const hoursJson = business.hours ? JSON.stringify(business.hours) : null;
    const photosJson = business.photos ? JSON.stringify(business.photos) : null;

    if (existingBusiness) {
      // Update existing business
      await database.run(
        `
        UPDATE businesses SET
          name = ?, address = ?, phone = ?, website = ?, email = ?,
          lat = ?, lng = ?, rating = ?, review_count = ?, category = ?,
          business_status = ?, photo_reference = ?, logo_url = ?, logo_base64 = ?,
          is_open = ?, price_level = ?, has_target_keyword = ?,
          hours_json = ?, photos_json = ?, photos_local_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [
          business.name,
          business.address,
          business.phone,
          business.website,
          business.email,
          business.location.lat,
          business.location.lng,
          business.rating,
          business.reviewCount,
          business.category,
          business.businessStatus,
          business.photoReference,
          business.logoUrl,
          business.logoBase64 || null,
          business.isOpen,
          business.priceLevel,
          business.hasTargetKeyword,
          hoursJson,
          photosJson,
          business.photosLocal ? JSON.stringify(business.photosLocal) : null,
          business.id,
        ],
      );
      console.log(`Updated business: ${business.name}`);
    } else {
      // Insert new business
      await database.run(
        `
        INSERT INTO businesses (
          id, name, address, phone, website, email, lat, lng, rating,
          review_count, category, business_status, photo_reference, logo_url, logo_base64,
          is_open, price_level, has_target_keyword, hours_json, photos_json, photos_local_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          business.id,
          business.name,
          business.address,
          business.phone,
          business.website,
          business.email,
          business.location.lat,
          business.location.lng,
          business.rating,
          business.reviewCount,
          business.category,
          business.businessStatus,
          business.photoReference,
          business.logoUrl,
          business.logoBase64 || null,
          business.isOpen,
          business.priceLevel,
          business.hasTargetKeyword,
          hoursJson,
          photosJson,
          business.photosLocal ? JSON.stringify(business.photosLocal) : null,
        ],
      );
      console.log(`Inserted new business: ${business.name}`);
    }

    // Insert reviews if they exist
    if (business.reviews && business.reviews.length > 0) {
      await this.upsertReviews(business.id, business.reviews);
    }
  }

  // Insert or update reviews for a business
  async upsertReviews(
    businessId: string,
    reviews: BusinessReview[],
  ): Promise<void> {
    // Delete existing reviews for this business
    await database.run("DELETE FROM reviews WHERE business_id = ?", [
      businessId,
    ]);

    // Insert new reviews
    for (const review of reviews) {
      await database.run(
        `
        INSERT INTO reviews (id, business_id, author_name, rating, text, time_ago, profile_photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          review.id,
          businessId,
          review.authorName,
          review.rating,
          review.text,
          review.timeAgo,
          review.profilePhotoUrl,
        ],
      );
    }
    console.log(
      `Inserted ${reviews.length} reviews for business: ${businessId}`,
    );
  }

  // Get all businesses from database (lightweight - no reviews)
  async getAllBusinesses(): Promise<BusinessData[]> {
    try {
      const businesses = await database.all(`
        SELECT * FROM businesses
        ORDER BY has_target_keyword DESC, rating DESC, review_count DESC
      `);

      // Return businesses without reviews for faster loading
      return businesses.map((business) => {
        return this.mapToBusinessData(business, []);
      });
    } catch (error) {
      console.error("Database error in getAllBusinesses:", error);
      return []; // Return empty array if database fails
    }
  }

  // Get all businesses with full reviews (slower but complete)
  async getAllBusinessesWithReviews(): Promise<BusinessData[]> {
    const businesses = await database.all(`
      SELECT * FROM businesses
      ORDER BY has_target_keyword DESC, rating DESC, review_count DESC
    `);

    return Promise.all(
      businesses.map(async (business) => {
        const reviews = await this.getBusinessReviews(business.id);
        return this.mapToBusinessData(business, reviews);
      }),
    );
  }

  // Get businesses with pagination (lightweight - no reviews)
  async getBusinessesPaginated(
    limit: number = 25,
    offset: number = 0,
    includeReviews: boolean = false,
  ): Promise<BusinessData[]> {
    const businesses = await database.all(
      `
      SELECT * FROM businesses
      ORDER BY has_target_keyword DESC, rating DESC, review_count DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    if (includeReviews) {
      return Promise.all(
        businesses.map(async (business) => {
          const reviews = await this.getBusinessReviews(business.id);
          return this.mapToBusinessData(business, reviews);
        }),
      );
    } else {
      // Return without reviews for faster loading
      return businesses.map((business) => {
        return this.mapToBusinessData(business, []);
      });
    }
  }

  // Search businesses by name or category (lightweight - no reviews)
  async searchBusinesses(
    query: string,
    category?: string,
    includeReviews: boolean = false,
  ): Promise<BusinessData[]> {
    let sql = `
      SELECT * FROM businesses
      WHERE (name LIKE ? OR address LIKE ?)
    `;
    let params = [`%${query}%`, `%${query}%`];

    if (category && category !== "all") {
      sql += ` AND category = ?`;
      params.push(category);
    }

    sql += ` ORDER BY has_target_keyword DESC, rating DESC, review_count DESC`;

    const businesses = await database.all(sql, params);

    if (includeReviews) {
      return Promise.all(
        businesses.map(async (business) => {
          const reviews = await this.getBusinessReviews(business.id);
          return this.mapToBusinessData(business, reviews);
        }),
      );
    } else {
      // Return without reviews for faster loading
      return businesses.map((business) => {
        return this.mapToBusinessData(business, []);
      });
    }
  }

  // Get reviews for a specific business
  async getBusinessReviews(businessId: string): Promise<BusinessReview[]> {
    const reviews = await database.all(
      `
      SELECT * FROM reviews WHERE business_id = ? ORDER BY rating ASC
    `,
      [businessId],
    );

    return reviews.map((review) => ({
      id: review.id,
      authorName: review.author_name,
      rating: review.rating,
      text: review.text,
      timeAgo: review.time_ago,
      profilePhotoUrl: review.profile_photo_url,
    }));
  }

  // Clear all existing reviews (to remove fake reviews)
  async clearAllReviews(): Promise<void> {
    await database.run("DELETE FROM reviews");
    console.log("✅ Cleared all existing reviews from database");
  }

  async clearBusinessReviews(businessId: string): Promise<void> {
    await database.run("DELETE FROM reviews WHERE business_id = ?", [
      businessId,
    ]);
    console.log(`✅ Cleared reviews for business ${businessId}`);
  }

  async updateBusinessRating(
    businessId: string,
    rating: number,
    reviewCount: number,
  ): Promise<void> {
    await database.run(
      "UPDATE businesses SET rating = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [rating, reviewCount, businessId],
    );
    console.log(
      `✅ Updated business ${businessId} rating to ${rating} (${reviewCount} reviews)`,
    );
  }

  async saveBusinessReviews(
    businessId: string,
    reviews: BusinessReview[],
  ): Promise<void> {
    await this.upsertReviews(businessId, reviews);
    console.log(
      `✅ Saved ${reviews.length} Google reviews for business ${businessId}`,
    );
  }

  // Clear all businesses
  async clearAllBusinesses(): Promise<void> {
    await database.run("DELETE FROM businesses");
    console.log("✅ Cleared all businesses from database");
  }

  // CRUD operations for admin panel

  // Get all businesses grouped by category
  async getBusinessesByCategory(): Promise<Record<string, BusinessData[]>> {
    const businesses = await database.all(
      "SELECT * FROM businesses ORDER BY category, name",
    );

    const businessesByCategory: Record<string, BusinessData[]> = {};

    for (const business of businesses) {
      const reviews = await this.getBusinessReviews(business.id);
      const businessData = this.mapToBusinessData(business, reviews);

      if (!businessesByCategory[business.category]) {
        businessesByCategory[business.category] = [];
      }
      businessesByCategory[business.category].push(businessData);
    }

    return businessesByCategory;
  }

  // Update a business
  async updateBusiness(
    id: string,
    businessData: Partial<BusinessData>,
  ): Promise<void> {
    const updateFields = [];
    const updateValues = [];

    if (businessData.name) {
      updateFields.push("name = ?");
      updateValues.push(businessData.name);
    }
    if (businessData.address) {
      updateFields.push("address = ?");
      updateValues.push(businessData.address);
    }
    if (businessData.phone) {
      updateFields.push("phone = ?");
      updateValues.push(businessData.phone);
    }
    if (businessData.website) {
      updateFields.push("website = ?");
      updateValues.push(businessData.website);
    }
    if (businessData.email) {
      updateFields.push("email = ?");
      updateValues.push(businessData.email);
    }
    if (businessData.category) {
      updateFields.push("category = ?");
      updateValues.push(businessData.category);
    }
    if (businessData.rating !== undefined) {
      updateFields.push("rating = ?");
      updateValues.push(businessData.rating);
    }
    if (businessData.reviewCount !== undefined) {
      updateFields.push("review_count = ?");
      updateValues.push(businessData.reviewCount);
    }
    if (businessData.businessStatus) {
      updateFields.push("business_status = ?");
      updateValues.push(businessData.businessStatus);
    }

    if (updateFields.length === 0) return;

    updateValues.push(id);

    await database.run(
      `UPDATE businesses SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    );
  }

  // Delete a business
  async deleteBusiness(id: string): Promise<void> {
    // Delete reviews first (foreign key constraint)
    await database.run("DELETE FROM reviews WHERE business_id = ?", [id]);
    // Delete business
    await database.run("DELETE FROM businesses WHERE id = ?", [id]);
  }

  // Get all unique categories
  async getAllCategories(): Promise<string[]> {
    const result = await database.all(
      "SELECT DISTINCT category FROM businesses ORDER BY category",
    );
    return result.map((row) => row.category);
  }

  // Update category name for all businesses in that category
  async updateCategory(
    oldCategory: string,
    newCategory: string,
  ): Promise<void> {
    await database.run(
      "UPDATE businesses SET category = ? WHERE category = ?",
      [newCategory, oldCategory],
    );
  }

  // Delete category (delete all businesses in that category)
  async deleteCategory(category: string): Promise<void> {
    // First get all business IDs in this category
    const businesses = await database.all(
      "SELECT id FROM businesses WHERE category = ?",
      [category],
    );

    // Delete reviews for all businesses in this category
    for (const business of businesses) {
      await database.run("DELETE FROM reviews WHERE business_id = ?", [
        business.id,
      ]);
    }

    // Delete all businesses in this category
    await database.run("DELETE FROM businesses WHERE category = ?", [category]);
  }

  // Get business by ID
  async getBusinessById(id: string): Promise<BusinessData | null> {
    const business = await database.get(
      "SELECT * FROM businesses WHERE id = ?",
      [id],
    );

    if (!business) return null;

    const reviews = await this.getBusinessReviews(id);
    return this.mapToBusinessData(business, reviews);
  }

  // Get unique categories
  async getCategories(): Promise<string[]> {
    try {
      const categories = await database.all(`
        SELECT DISTINCT category FROM businesses WHERE category IS NOT NULL ORDER BY category
      `);
      return categories.map((c) => c.category);
    } catch (error) {
      console.error("Database error in getCategories:", error);
      return []; // Return empty array if database fails
    }
  }

  // Get database statistics
  async getStats(): Promise<{
    total: number;
    categories: number;
    withReviews: number;
  }> {
    try {
      const total = await database.get(
        "SELECT COUNT(*) as count FROM businesses",
      );
      const categories = await database.get(
        "SELECT COUNT(DISTINCT category) as count FROM businesses WHERE category IS NOT NULL",
      );
      const withReviews = await database.get(
        "SELECT COUNT(DISTINCT business_id) as count FROM reviews",
      );

      return {
        total: total?.count || 0,
        categories: categories?.count || 0,
        withReviews: withReviews?.count || 0,
      };
    } catch (error) {
      console.error("Database error in getStats:", error);
      return {
        total: 0,
        categories: 0,
        withReviews: 0,
      };
    }
  }

  // Helper method to map database row to BusinessData
  private mapToBusinessData(
    business: any,
    reviews: BusinessReview[],
  ): BusinessData {
    return {
      id: business.id,
      name: business.name,
      address: business.address,
      phone: business.phone,
      website: business.website,
      email: business.email,
      location: {
        lat: business.lat,
        lng: business.lng,
      },
      rating: business.rating || 0,
      reviewCount: business.review_count || 0,
      category: business.category,
      businessStatus: business.business_status,
      photoReference: business.photo_reference,
      logoUrl: business.logo_base64
        ? `data:image/jpeg;base64,${business.logo_base64}`
        : business.logo_url, // Use cached base64 first, avoid API calls
      logoBase64: business.logo_base64, // Keep base64 data for caching
      isOpen: business.is_open,
      priceLevel: business.price_level,
      hasTargetKeyword: business.has_target_keyword,
      hours: business.hours_json ? JSON.parse(business.hours_json) : undefined,
      photos: business.photos_local_json
        ? JSON.parse(business.photos_local_json) // Always use cached photos first (no API cost)
        : business.photos_json
          ? JSON.parse(business.photos_json).map((photo: any) => ({
              ...photo,
              needsDownload: !photo.base64, // Flag photos that need downloading
              source: photo.base64 ? "cache" : "api",
            }))
          : undefined, // Mark uncached photos
      reviews: reviews,
    };
  }
}

export const businessService = new BusinessService();
