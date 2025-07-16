import React from "react";
import { getBestLogoUrl } from "../lib/imageUtils";
import SafeImage from "../components/SafeImage";
import BusinessLogo from "../components/BusinessLogo";

export default function ImageTest() {
  // Test business data with problematic URL
  const testBusiness = {
    id: "ChIJBVX2jx9DXz4RX2vu4AWa-sg",
    name: "Certificate Attestation",
    category: "document attestation",
    logoUrl:
      "https://reportvisascam.com/business-images/logos/logo-ChIJBVX2jx9DXz4RX2vu4AWa-sg.jpg",
  };

  const testBusinesses = [
    {
      name: "Visa Services Company",
      category: "visa services",
      logoUrl: "https://nonexistent.com/logo.jpg",
    },
    {
      name: "Document Clearing",
      category: "document attestation",
      logoUrl: "https://broken-url.com/logo.jpg",
    },
    {
      name: "PRO Services",
      category: "pro services",
      logoUrl: "https://reportvisascam.com/missing.jpg",
    },
    {
      name: "Education Consultant",
      category: "education visa",
      logoUrl: "https://reportvisascam.com/business-images/logos/missing.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Loading Test</h1>

        <div className="space-y-8">
          {/* Original problematic business */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Original Problematic Business
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <h3 className="font-medium mb-2">getBestLogoUrl Result:</h3>
                <code className="text-sm bg-gray-100 p-2 rounded block break-all">
                  {getBestLogoUrl(testBusiness)}
                </code>
              </div>
              <div>
                <h3 className="font-medium mb-2">SafeImage Component:</h3>
                <SafeImage
                  src={getBestLogoUrl(testBusiness) || ""}
                  alt={testBusiness.name}
                  className="w-16 h-16 rounded-lg border"
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">BusinessLogo Component:</h3>
                <BusinessLogo business={testBusiness} size="lg" />
              </div>
            </div>
          </div>

          {/* Test various categories */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Category-Based Fallbacks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {testBusinesses.map((business, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="text-center">
                    <BusinessLogo business={business} size="lg" />
                    <h3 className="font-medium mt-2">{business.name}</h3>
                    <p className="text-sm text-gray-500">{business.category}</p>
                    <div className="mt-2 text-xs text-gray-400 break-all">
                      {getBestLogoUrl(business)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image URL Testing */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Direct URL Tests</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">
                    Business Image (should fail fast):
                  </h3>
                  <SafeImage
                    src="https://reportvisascam.com/business-images/logos/nonexistent.jpg"
                    alt="Test"
                    className="w-16 h-16 rounded-lg border"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">
                    Unsplash Image (should work):
                  </h3>
                  <SafeImage
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&crop=center&auto=format&q=80"
                    alt="Test"
                    className="w-16 h-16 rounded-lg border"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
