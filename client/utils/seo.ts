// SEO utilities for dynamic meta tag injection and structured data

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  canonical?: string;
}

interface StructuredData {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

// Dynamic meta tag injection
export const updateMetaTags = (seoData: SEOData) => {
  // Ensure we're in the browser environment
  if (typeof document === "undefined") {
    console.warn("updateMetaTags called outside browser environment");
    return;
  }

  // Update document title
  if (seoData.title) {
    document.title = seoData.title;
  }

  // Update or create meta tags
  const metaTags = [
    { name: "description", content: seoData.description },
    { name: "keywords", content: seoData.keywords || "" },
    { name: "robots", content: seoData.robots || "index, follow" },
    { property: "og:title", content: seoData.ogTitle || seoData.title },
    {
      property: "og:description",
      content: seoData.ogDescription || seoData.description,
    },
    { property: "og:image", content: seoData.ogImage || "" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: window.location.href },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: seoData.twitterTitle || seoData.ogTitle || seoData.title,
    },
    {
      name: "twitter:description",
      content:
        seoData.twitterDescription ||
        seoData.ogDescription ||
        seoData.description,
    },
    {
      name: "twitter:image",
      content: seoData.twitterImage || seoData.ogImage || "",
    },
  ];

  metaTags.forEach(({ name, property, content }) => {
    if (!content) return;

    const selector = name
      ? `meta[name="${name}"]`
      : `meta[property="${property}"]`;
    let metaTag = document.querySelector(selector);

    if (metaTag) {
      metaTag.setAttribute("content", content);
    } else {
      metaTag = document.createElement("meta");
      if (name) metaTag.setAttribute("name", name);
      if (property) metaTag.setAttribute("property", property);
      metaTag.setAttribute("content", content);
      document.head.appendChild(metaTag);
    }
  });

  // Update canonical URL
  if (seoData.canonical) {
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute("href", seoData.canonical);
    } else {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      canonicalLink.setAttribute("href", seoData.canonical);
      document.head.appendChild(canonicalLink);
    }
  }
};

// Load meta tags for current page
export const loadPageMetaTags = async (page: string) => {
  try {
    const response = await fetch(
      `/api/admin/meta-tags/page/${encodeURIComponent(page)}`,
    );

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // If 404, that's expected for pages without custom meta tags
      if (response.status === 404) {
        console.log(`No custom meta tags found for page: ${page}`);
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.metaTag) {
      updateMetaTags(data.metaTag);
    }
  } catch (error) {
    // Only log actual errors, not expected 404s
    if (
      error instanceof TypeError &&
      error.message.includes("body stream already read")
    ) {
      console.warn(
        "Response body was already consumed - skipping meta tag loading",
      );
    } else {
      console.error("Error loading page meta tags:", error);
    }
  }
};

// Generate structured data for business listings
export const generateBusinessStructuredData = (
  businesses: any[],
): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Dubai Approved Business Directory",
    description: "Comprehensive directory of verified businesses in Dubai, UAE",
    url: window.location.href,
    numberOfItems: businesses.length,
    itemListElement: businesses.map((business, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        name: business.name,
        description: business.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: business.address,
          addressLocality: "Dubai",
          addressCountry: "UAE",
        },
        aggregateRating: business.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: business.rating,
              reviewCount: business.reviewCount || 0,
            }
          : undefined,
        image: business.logoUrl,
        telephone: business.phone,
        url: business.website,
      },
    })),
  };
};

// Generate structured data for individual business
export const generateSingleBusinessStructuredData = (
  business: any,
): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: "Dubai",
      addressCountry: "UAE",
    },
    aggregateRating: business.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: business.rating,
          reviewCount: business.reviewCount || 0,
        }
      : undefined,
    image: business.logoUrl,
    telephone: business.phone,
    url: business.website,
    openingHours: business.hours,
    priceRange: business.priceRange,
  };
};

// Generate structured data for organization
export const generateOrganizationStructuredData = (): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dubai Approved Business Directory",
    description:
      "The most comprehensive and trusted business directory in Dubai, UAE. Find verified immigration consultants, visa services, and businesses.",
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    sameAs: [
      // Add social media links here when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Arabic"],
    },
  };
};

// Generate structured data for FAQ pages
export const generateFAQStructuredData = (
  faqs: { question: string; answer: string }[],
): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

// Inject structured data into page
export const injectStructuredData = (structuredData: StructuredData) => {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(structuredData);

  // Remove existing structured data script if present
  const existingScript = document.querySelector(
    'script[type="application/ld+json"]',
  );
  if (existingScript) {
    existingScript.remove();
  }

  document.head.appendChild(script);
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (
  breadcrumbs: { name: string; url: string }[],
): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
};

// Default SEO data for fallback
export const getDefaultSEOData = (page: string): SEOData => {
  const defaults: Record<string, SEOData> = {
    "/": {
      title:
        "Dubai Approved Business Directory - Find Trusted Businesses in UAE",
      description:
        "Discover verified and trusted businesses in Dubai, UAE. Find immigration consultants, visa services, and more with reviews and ratings.",
      keywords:
        "Dubai business directory, UAE businesses, immigration consultants Dubai, visa services UAE, trusted businesses Dubai",
      ogImage: "/og-image.jpg",
    },
    "/dubai-businesses": {
      title: "Dubai Business Directory - Verified Companies & Services",
      description:
        "Browse comprehensive list of verified businesses in Dubai. Find immigration consultants, visa services, and professional companies with genuine reviews.",
      keywords:
        "Dubai businesses, business directory UAE, verified companies Dubai, professional services UAE",
      ogImage: "/og-business-directory.jpg",
    },
    "/complaint": {
      title: "Report Business Issues - Dubai Business Directory",
      description:
        "Report issues with businesses in Dubai. Help protect the community by sharing your experience with fraud, poor service, or unethical practices.",
      keywords:
        "report business Dubai, business complaints UAE, fraud reporting Dubai, consumer protection UAE",
      ogImage: "/og-complaint.jpg",
    },
    "/fraud-immigration-consultants": {
      title: "Fraud Immigration Consultants Report - Protect Yourself",
      description:
        "Identify and report fraudulent immigration consultants in Dubai. Protect yourself and others from visa scams and illegal immigration practices.",
      keywords:
        "fraud immigration consultants Dubai, visa scams UAE, illegal immigration services, immigration fraud reporting",
      ogImage: "/og-fraud-report.jpg",
    },
    "/services": {
      title: "Professional Services in Dubai - Business Directory",
      description:
        "Explore professional services available in Dubai. Find qualified service providers across various industries with verified credentials.",
      keywords:
        "professional services Dubai, business services UAE, Dubai service providers, verified professionals UAE",
      ogImage: "/og-services.jpg",
    },
    "/help-center": {
      title: "Help Center - Dubai Business Directory Support",
      description:
        "Get help and support for using Dubai Business Directory. Find answers to common questions and contact information.",
      keywords:
        "help center Dubai business directory, support UAE business guide, FAQ Dubai businesses",
      ogImage: "/og-help.jpg",
    },
  };

  return (
    defaults[page] || {
      title: "Dubai Approved Business Directory",
      description: "Find and verify businesses in Dubai, UAE",
      keywords: "Dubai, business, directory, UAE",
    }
  );
};

// Enhanced Google indexing signals
export const enhanceGoogleIndexing = () => {
  // Add performance monitoring
  if ("performance" in window) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log("Page load performance:", {
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
          });
        }
      }, 0);
    });
  }

  // Add structured data for organization
  injectStructuredData(generateOrganizationStructuredData());

  // Add meta tags for enhanced crawling
  const additionalMeta = [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "format-detection", content: "telephone=no" },
    { name: "mobile-web-app-capable", content: "yes" },
    { property: "og:site_name", content: "Dubai Approved Business Directory" },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:site", content: "@DubaiBusinessDir" },
  ];

  additionalMeta.forEach(({ name, property, content }) => {
    const selector = name
      ? `meta[name="${name}"]`
      : `meta[property="${property}"]`;
    let metaTag = document.querySelector(selector);

    if (!metaTag) {
      metaTag = document.createElement("meta");
      if (name) metaTag.setAttribute("name", name);
      if (property) metaTag.setAttribute("property", property);
      metaTag.setAttribute("content", content);
      document.head.appendChild(metaTag);
    }
  });
};
