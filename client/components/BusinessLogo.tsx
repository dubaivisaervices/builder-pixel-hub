import React, { useState, useEffect } from "react";
import { getBestLogoUrl } from "../lib/imageUtils";

interface BusinessLogoProps {
  business: any;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export default function BusinessLogo({
  business,
  className = "",
  size = "md",
}: BusinessLogoProps) {
  const [logoSrc, setLogoSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the best logo URL using the utility
    const logoUrl = getBestLogoUrl(business);

    if (logoUrl) {
      setLogoSrc(logoUrl);
      setIsLoading(false);
    } else {
      // Fallback to default business icon
      setLogoSrc(
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&crop=center&auto=format&q=80",
      );
      setIsLoading(false);
    }
  }, [business]);

  const handleError = () => {
    // If the current image fails, switch to a reliable fallback
    console.log(
      `❌ Logo failed for ${business.name}, using generic business icon`,
    );
    setLogoSrc(
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&crop=center&auto=format&q=80",
    );
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}
      >
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={`${business.name} logo`}
      className={`${sizeClasses[size]} ${className} object-cover rounded-lg`}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
}
