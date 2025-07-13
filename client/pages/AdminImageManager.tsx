import React, { useState, useEffect } from "react";
import { AdminImageUpload } from "../components/AdminImageUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, Building2, Star, Upload } from "lucide-react";

interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
}

function AdminImageManager() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredBusinesses(
        businesses.filter(
          (business) =>
            business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.category.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    } else {
      setFilteredBusinesses(businesses);
    }
  }, [searchTerm, businesses]);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/admin/business-list");
      const data = await response.json();
      setBusinesses(data);
      setFilteredBusinesses(data);
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (urls: string[]) => {
    console.log("Upload completed:", urls);
    // Optionally refresh business data or show success message
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading businesses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Business Image Manager</h1>
        <p className="text-gray-600">
          Upload business logos and photos to S3 storage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Business
            </CardTitle>
            <CardDescription>
              Choose a business to upload images for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBusiness?.id === business.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedBusiness(business)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm">{business.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {business.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">{business.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {business.category}
                  </Badge>
                </div>
              ))}

              {filteredBusinesses.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No businesses found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <div className="space-y-4">
          {selectedBusiness ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-medium">{selectedBusiness.name}</h3>
                    <p className="text-sm text-gray-600">
                      ID: {selectedBusiness.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      Category: {selectedBusiness.category}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{selectedBusiness.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <AdminImageUpload
                businessId={selectedBusiness.id}
                type="logo"
                onUploadComplete={handleUploadComplete}
              />

              <AdminImageUpload
                businessId={selectedBusiness.id}
                type="photos"
                onUploadComplete={handleUploadComplete}
              />
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Business Selected
                </h3>
                <p className="text-gray-600">
                  Please select a business from the list to upload images
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Business IDs for Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Business IDs for Testing</CardTitle>
          <CardDescription>
            Here are some business IDs you can use directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.slice(0, 6).map((business) => (
              <div
                key={business.id}
                className="p-3 border rounded-lg bg-gray-50"
              >
                <div className="space-y-1">
                  <p className="font-mono text-sm font-medium">{business.id}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {business.name}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => setSelectedBusiness(business)}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
