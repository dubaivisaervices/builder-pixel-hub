import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  loadPageMetaTags,
  getDefaultSEOData,
  updateMetaTags,
  injectStructuredData,
  enhanceGoogleIndexing,
} from "../utils/seo";

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  structuredData?: any;
  skipAutoLoad?: boolean;
}

export const useSEO = (options: SEOOptions = {}) => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    let isMounted = true;

    const initializeSEO = async () => {
      try {
        // Enhance Google indexing signals
        enhanceGoogleIndexing();

        // Try to load custom meta tags from database (don't let this block manual options)
        if (!options.skipAutoLoad && isMounted) {
          try {
            await loadPageMetaTags(currentPath);
          } catch (dbError) {
            console.warn(
              "Failed to load meta tags from database, continuing with manual options:",
              dbError,
            );
          }
        }

        // ALWAYS apply manual SEO options if provided (regardless of database loading)
        if (
          isMounted &&
          (options.title ||
            options.description ||
            options.keywords ||
            options.ogImage)
        ) {
          console.log("🔧 Applying manual SEO options:", options.title);

          const defaultData = getDefaultSEOData(currentPath);
          const seoData = {
            ...defaultData,
            title: options.title || defaultData.title,
            description: options.description || defaultData.description,
            keywords: options.keywords || defaultData.keywords,
            ogImage: options.ogImage || defaultData.ogImage,
          };

          updateMetaTags(seoData);
          console.log("✅ Manual SEO applied, title should be:", seoData.title);
        }

        // Inject structured data if provided and component is still mounted
        if (isMounted && options.structuredData) {
          injectStructuredData(options.structuredData);
        }
      } catch (error) {
        console.error("Error initializing SEO:", error);
      }
    };

    initializeSEO();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [
    location.pathname,
    options.title,
    options.description,
    options.keywords,
    options.ogImage,
    options.skipAutoLoad,
  ]);

  // Return utility functions for manual SEO management
  return {
    updateMetaTags,
    injectStructuredData,
    loadPageMetaTags,
  };
};

// Specific hooks for different page types
export const useBusinessListingSEO = (businesses: any[] = []) => {
  const { injectStructuredData } = useSEO();

  useEffect(() => {
    if (businesses.length > 0) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Dubai Business Directory",
        description: "Verified businesses in Dubai, UAE",
        numberOfItems: businesses.length,
        itemListElement: businesses.slice(0, 10).map((business, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "LocalBusiness",
            name: business.name,
            address: {
              "@type": "PostalAddress",
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
          },
        })),
      };

      injectStructuredData(structuredData);
    }
  }, [businesses, injectStructuredData]);
};

export const useBusinessProfileSEO = (business: any) => {
  const { updateMetaTags, injectStructuredData } = useSEO({
    skipAutoLoad: true,
  });

  useEffect(() => {
    if (business) {
      // Update meta tags for business profile
      updateMetaTags({
        title: `${business.name} - Dubai Business Directory`,
        description: `${business.name} in Dubai, UAE. ${business.description || "Professional business services"}. Rating: ${business.rating || "Not rated"}.`,
        keywords: `${business.name}, Dubai business, ${business.category || "services"}, UAE`,
        ogImage: business.logoUrl,
        canonical: `${window.location.origin}/business/${business.id}`,
      });

      // Add business structured data
      const structuredData = {
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
      };

      injectStructuredData(structuredData);
    }
  }, [business, updateMetaTags, injectStructuredData]);
};

export const useComplaintFormSEO = () => {
  useSEO({
    title: "Report Business Issues - Dubai Business Directory",
    description:
      "Report problematic businesses in Dubai. Help protect the community by sharing your experience with fraud, poor service, or unethical business practices.",
    keywords:
      "report business Dubai, business complaints UAE, fraud reporting, consumer protection Dubai",
  });
};

export const useFraudReportSEO = () => {
  console.log("🚨 useFraudReportSEO hook called");

  useSEO({
    title: "Report Fraud Immigration Consultants - Dubai UAE",
    description:
      "Report fraudulent immigration consultants in Dubai. Protect yourself and others from visa scams and illegal immigration services. Community-driven protection.",
    keywords:
      "fraud immigration consultants Dubai, visa scams UAE, illegal immigration services, immigration fraud reporting Dubai",
  });
};
