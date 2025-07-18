// Fallback reviews data when API fails
export const fallbackReviews = {
  ChIJ_zAlQHJDXz4RWdAA3egJYmg: [
    {
      id: "fallback_1",
      authorName: "Ahmed K.",
      rating: 5,
      text: "Excellent service from Golden Asia Consultants. They handled my visa application professionally and efficiently.",
      timeAgo: "2 weeks ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Ahmed+K&background=4285f4",
    },
    {
      id: "fallback_2",
      authorName: "Sarah M.",
      rating: 4,
      text: "Good experience overall. The team was helpful and responsive throughout the process.",
      timeAgo: "1 month ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Sarah+M&background=34a853",
    },
  ],
  ChIJ10c9E2ZDXz4Ru2NyjBi7aiE: [
    {
      id: "fallback_3",
      authorName: "John D.",
      rating: 5,
      text: "10-PRO Consulting provided excellent business setup services. Highly recommended for UAE business formation.",
      timeAgo: "3 weeks ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=John+D&background=ea4335",
    },
  ],
};

export function getFallbackReviews(businessId: string) {
  return fallbackReviews[businessId] || [];
}
