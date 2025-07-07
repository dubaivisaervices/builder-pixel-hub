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
          business_status = ?, photo_reference = ?, logo_url = ?,
          is_open = ?, price_level = ?, has_target_keyword = ?,
          hours_json = ?, photos_json = ?, updated_at = CURRENT_TIMESTAMP
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
          business.isOpen,
          business.priceLevel,
          business.hasTargetKeyword,
          hoursJson,
          photosJson,
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
          review_count, category, business_status, photo_reference, logo_url,
          is_open, price_level, has_target_keyword, hours_json, photos_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          business.isOpen,
          business.priceLevel,
          business.hasTargetKeyword,
          hoursJson,
          photosJson,
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

  // Get all businesses from database
  async getAllBusinesses(): Promise<BusinessData[]> {
    const businesses = await database.all(`
      SELECT * FROM businesses ORDER BY rating DESC, review_count DESC
    `);

    return Promise.all(
      businesses.map(async (business) => {
        const reviews = await this.getBusinessReviews(business.id);
        return this.mapToBusinessData(business, reviews);
      }),
    );
  }

  // Get businesses with pagination
  async getBusinessesPaginated(
    limit: number = 25,
    offset: number = 0,
  ): Promise<BusinessData[]> {
    const businesses = await database.all(
      `
      SELECT * FROM businesses 
      ORDER BY has_target_keyword DESC, rating DESC, review_count DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    return Promise.all(
      businesses.map(async (business) => {
        const reviews = await this.getBusinessReviews(business.id);
        return this.mapToBusinessData(business, reviews);
      }),
    );
  }

  // Search businesses by name or category
  async searchBusinesses(
    query: string,
    category?: string,
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

    return Promise.all(
      businesses.map(async (business) => {
        const reviews = await this.getBusinessReviews(business.id);
        return this.mapToBusinessData(business, reviews);
      }),
    );
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
    const categories = await database.all(`
      SELECT DISTINCT category FROM businesses WHERE category IS NOT NULL ORDER BY category
    `);
    return categories.map((c) => c.category);
  }

  // Get database statistics
  async getStats(): Promise<{
    total: number;
    categories: number;
    withReviews: number;
  }> {
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
      total: total.count,
      categories: categories.count,
      withReviews: withReviews.count,
    };
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
      logoUrl: business.logo_url,
      isOpen: business.is_open,
      priceLevel: business.price_level,
      hasTargetKeyword: business.has_target_keyword,
      hours: business.hours_json ? JSON.parse(business.hours_json) : undefined,
      photos: business.photos_json
        ? JSON.parse(business.photos_json)
        : undefined,
      reviews: reviews,
    };
  }
}

export const businessService = new BusinessService();
