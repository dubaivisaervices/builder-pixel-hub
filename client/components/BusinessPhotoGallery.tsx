import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  Camera,
  ExternalLink,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Eye,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface BusinessPhoto {
  id: string;
  url: string;
  s3Url?: string;
  base64?: string;
  width?: number;
  height?: number;
  caption?: string;
  uploadedAt?: string;
  source: "s3" | "cache" | "api" | "default";
  needsDownload?: boolean;
}

interface BusinessPhotoGalleryProps {
  businessId: string;
  businessName: string;
  photos?: BusinessPhoto[];
  photosS3Urls?: string[];
  className?: string;
}

export default function BusinessPhotoGallery({
  businessId,
  businessName,
  photos = [],
  photosS3Urls = [],
  className = "",
}: BusinessPhotoGalleryProps) {
  const [galleryPhotos, setGalleryPhotos] = useState<BusinessPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<BusinessPhoto | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingPhotos, setLoadingPhotos] = useState<Set<string>>(new Set());

  // Default business photos as fallback
  const defaultBusinessPhotos: BusinessPhoto[] = [
    {
      id: "default-1",
      url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80",
      caption: "Modern Office Space",
      source: "default",
    },
    {
      id: "default-2",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
      caption: "Professional Workspace",
      source: "default",
    },
    {
      id: "default-3",
      url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80",
      caption: "Business Meeting Room",
      source: "default",
    },
    {
      id: "default-4",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80",
      caption: "Corporate Environment",
      source: "default",
    },
    {
      id: "default-5",
      url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&q=80",
      caption: "Office Reception",
      source: "default",
    },
    {
      id: "default-6",
      url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop&q=80",
      caption: "Modern Building",
      source: "default",
    },
  ];

  useEffect(() => {
    loadBusinessPhotos();
  }, [businessId]); // Only depend on businessId to avoid infinite loops

  const loadBusinessPhotos = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("📸 Loading business photos for:", businessName);

      let processedPhotos: BusinessPhoto[] = [];

      // 1. Process S3 URLs first (highest priority)
      if (photosS3Urls && photosS3Urls.length > 0) {
        console.log("📸 Found S3 URLs:", photosS3Urls.length);
        processedPhotos = photosS3Urls.map((url, index) => ({
          id: `s3-${index}`,
          url: `/api/s3-image/${encodeURIComponent(url.replace(/^https?:\/\/[^\/]+\//, ""))}`,
          s3Url: url,
          caption: `Business Photo ${index + 1}`,
          source: "s3" as const,
        }));
      }

      // 2. Process regular photos array (from database)
      if (photos && photos.length > 0) {
        console.log("📸 Found regular photos:", photos.length);
        const regularPhotos = photos.map((photo, index) => ({
          ...photo,
          id: photo.id || `photo-${index}`,
          caption:
            photo.caption ||
            `Business Photo ${processedPhotos.length + index + 1}`,
        }));
        processedPhotos = [...processedPhotos, ...regularPhotos];
      }

      // 3. If no photos available, try to fetch from API
      if (processedPhotos.length === 0) {
        console.log("📸 No photos found, trying to fetch from API...");
        try {
          const response = await fetch(
            `/api/business-photos/${businessId}?_t=${Date.now()}`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.photos && data.photos.length > 0) {
              console.log("📸 Fetched photos from API:", data.photos.length);
              processedPhotos = data.photos.map(
                (photo: any, index: number) => ({
                  id: photo.id || `api-${index}`,
                  url:
                    photo.s3Url || photo.url || photo.base64
                      ? `data:image/jpeg;base64,${photo.base64}`
                      : photo.url,
                  s3Url: photo.s3Url,
                  base64: photo.base64,
                  width: photo.width,
                  height: photo.height,
                  caption: photo.caption || `Business Photo ${index + 1}`,
                  source: photo.s3Url ? "s3" : photo.base64 ? "cache" : "api",
                  needsDownload: photo.needsDownload,
                }),
              );
            }
          }
        } catch (apiError) {
          console.warn("📸 Failed to fetch photos from API:", apiError);
        }
      }

      // 4. Use default photos if still no photos
      if (processedPhotos.length === 0) {
        console.log("📸 Using default business photos");
        processedPhotos = defaultBusinessPhotos;
      }

      // Validate and filter out any invalid photos
      const validPhotos = processedPhotos.filter(
        (photo) => photo.url && photo.url.trim() !== "",
      );

      setGalleryPhotos(validPhotos);
      console.log(
        "📸 Final gallery photos:",
        validPhotos.length,
        "photos loaded",
      );
    } catch (err) {
      console.error("📸 Error loading business photos:", err);
      setError("Failed to load photos");
      // Use default photos on error
      setGalleryPhotos(defaultBusinessPhotos);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (photoId: string, photoUrl: string) => {
    console.warn("📸 Image failed to load:", photoUrl);

    // Mark this photo as loading to show spinner
    setLoadingPhotos((prev) => new Set([...prev, photoId]));

    // Try to reload after a delay
    setTimeout(() => {
      setLoadingPhotos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
    }, 2000);
  };

  const handleImageLoad = (photoId: string) => {
    // Remove from loading set when image loads successfully
    setLoadingPhotos((prev) => {
      const newSet = new Set(prev);
      newSet.delete(photoId);
      return newSet;
    });
  };

  const openLightbox = (photo: BusinessPhoto, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setIsModalOpen(false);
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev"
        ? (currentIndex - 1 + galleryPhotos.length) % galleryPhotos.length
        : (currentIndex + 1) % galleryPhotos.length;

    setCurrentIndex(newIndex);
    setSelectedPhoto(galleryPhotos[newIndex]);
  };

  const downloadPhoto = (photo: BusinessPhoto) => {
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = `${businessName.replace(/[^a-zA-Z0-9]/g, "-")}-photo-${photo.id}.jpg`;
    link.click();
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "s3":
        return (
          <Badge
            variant="outline"
            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
          >
            S3
          </Badge>
        );
      case "cache":
        return (
          <Badge
            variant="outline"
            className="text-xs bg-green-50 text-green-700 border-green-200"
          >
            Cached
          </Badge>
        );
      case "api":
        return (
          <Badge
            variant="outline"
            className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            API
          </Badge>
        );
      case "default":
        return (
          <Badge
            variant="outline"
            className="text-xs bg-gray-50 text-gray-700 border-gray-200"
          >
            Stock
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card
        className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm ${className}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span>Business Photos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 font-medium">
              Loading business photos...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Fetching images from gallery
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm ${className}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <span>Business Photos</span>
              <Badge variant="outline" className="text-xs">
                {galleryPhotos.length}{" "}
                {galleryPhotos.length === 1 ? "photo" : "photos"}
              </Badge>
            </div>
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadBusinessPhotos}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && galleryPhotos.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Failed to Load Photos
              </h3>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <Button onClick={loadBusinessPhotos} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : galleryPhotos.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Photos Available
              </h3>
              <p className="text-sm text-gray-500">
                This business hasn't uploaded any photos yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {galleryPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 aspect-square"
                    onClick={() => openLightbox(photo, index)}
                  >
                    {loadingPhotos.has(photo.id) ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
                      </div>
                    ) : (
                      <img
                        src={photo.url}
                        alt={photo.caption || `Business photo ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        crossOrigin="anonymous"
                        onLoad={() => handleImageLoad(photo.id)}
                        onError={() => handleImageError(photo.id, photo.url)}
                      />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/90 rounded-full p-2">
                          <Eye className="h-4 w-4 text-gray-700" />
                        </div>
                      </div>
                    </div>

                    {/* Source Badge */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {getSourceBadge(photo.source)}
                    </div>

                    {/* Photo Number */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge className="bg-black/70 text-white text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Photo Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-blue-800">
                    <div className="flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>{galleryPhotos.length} photos available</span>
                    </div>
                    {galleryPhotos.some((p) => p.source === "s3") && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>High-quality images</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openLightbox(galleryPhotos[0], 0)}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    View Gallery
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      {isModalOpen && selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {galleryPhotos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto("prev")}
                  className="absolute left-4 z-10 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => navigatePhoto("next")}
                  className="absolute right-4 z-10 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || "Business photo"}
              className="max-w-full max-h-full object-contain"
              crossOrigin="anonymous"
            />

            {/* Photo Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm text-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedPhoto.caption}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm opacity-90">
                      {currentIndex + 1} of {galleryPhotos.length}
                    </span>
                    {getSourceBadge(selectedPhoto.source)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPhoto(selectedPhoto)}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  {selectedPhoto.s3Url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedPhoto.s3Url, "_blank")}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
