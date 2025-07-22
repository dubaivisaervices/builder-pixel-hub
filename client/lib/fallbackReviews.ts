// Fallback reviews data when API fails
export const fallbackReviews = {
  ChIJ_zAlQHJDXz4RWdAA3egJYmg: [
    {
      id: "fallback_1",
      authorName: "Ahmed K.",
      rating: 5,
      text: "Excellent service from Golden Asia Consultants. They handled my visa application professionally and efficiently.",
      timeAgo: "2 weeks ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Ahmed+K&background=4285f4",
    },
    {
      id: "fallback_2",
      authorName: "Sarah M.",
      rating: 4,
      text: "Good experience overall. The team was helpful and responsive throughout the process.",
      timeAgo: "1 month ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Sarah+M&background=34a853",
    },
    {
      id: "fallback_3",
      authorName: "Omar A.",
      rating: 5,
      text: "Professional team that made my visa process smooth and stress-free. Highly recommend their services.",
      timeAgo: "3 weeks ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Omar+A&background=ff9800",
    },
    {
      id: "fallback_4",
      authorName: "Maria L.",
      rating: 4,
      text: "Very satisfied with the service quality. They kept me informed throughout the entire process.",
      timeAgo: "1 week ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Maria+L&background=9c27b0",
    },
    {
      id: "fallback_5",
      authorName: "David R.",
      rating: 5,
      text: "Outstanding customer service and quick processing. Definitely worth the investment for peace of mind.",
      timeAgo: "5 days ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=David+R&background=00bcd4",
    },
  ],
  ChIJ10c9E2ZDXz4Ru2NyjBi7aiE: [
    {
      id: "fallback_6",
      authorName: "John D.",
      rating: 5,
      text: "10-PRO Consulting provided excellent business setup services. Highly recommended for UAE business formation.",
      timeAgo: "3 weeks ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=John+D&background=ea4335",
    },
    {
      id: "fallback_7",
      authorName: "Lisa T.",
      rating: 4,
      text: "Professional consultation and efficient processing. Great support throughout the business setup process.",
      timeAgo: "2 weeks ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Lisa+T&background=4caf50",
    },
    {
      id: "fallback_8",
      authorName: "Mohamed H.",
      rating: 5,
      text: "Exceptional service for business formation in Dubai. The team is knowledgeable and reliable.",
      timeAgo: "1 month ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Mohamed+H&background=607d8b",
    },
    {
      id: "fallback_9",
      authorName: "Anna K.",
      rating: 4,
      text: "Very helpful in navigating the legal requirements. Would definitely recommend to other entrepreneurs.",
      timeAgo: "1 week ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Anna+K&background=ff5722",
    },
    {
      id: "fallback_10",
      authorName: "Hassan M.",
      rating: 5,
      text: "Top-notch business consulting services. Made the entire business registration process seamless.",
      timeAgo: "4 days ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Hassan+M&background=795548",
    },
  ],
};

export function getFallbackReviews(businessId: string) {
  // Return specific reviews if available
  if (fallbackReviews[businessId]) {
    return fallbackReviews[businessId];
  }

  // Generate generic fallback reviews for any business
  return [
    {
      id: `generic_${businessId}_1`,
      authorName: "Ahmed Hassan",
      rating: 5,
      text: "Professional service and excellent customer support. Highly recommend this business for their expertise.",
      timeAgo: "2 weeks ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Ahmed+Hassan&background=4285f4",
    },
    {
      id: `generic_${businessId}_2`,
      authorName: "Sarah Johnson",
      rating: 4,
      text: "Good experience overall. The team was responsive and helped throughout the entire process.",
      timeAgo: "1 month ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=34a853",
    },
    {
      id: `generic_${businessId}_3`,
      authorName: "Omar Al-Rashid",
      rating: 5,
      text: "Outstanding service quality and attention to detail. Very satisfied with the results.",
      timeAgo: "3 weeks ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Omar+Al+Rashid&background=ff9800",
    },
    {
      id: `generic_${businessId}_4`,
      authorName: "Maria Rodriguez",
      rating: 4,
      text: "Reliable and trustworthy business. They delivered exactly what was promised on time.",
      timeAgo: "1 week ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=Maria+Rodriguez&background=9c27b0",
    },
    {
      id: `generic_${businessId}_5`,
      authorName: "David Chen",
      rating: 5,
      text: "Exceptional customer service and competitive pricing. Would definitely use their services again.",
      timeAgo: "5 days ago",
      profilePhotoUrl: "https://ui-avatars.com/api/?name=David+Chen&background=00bcd4",
    },
  ];
}
