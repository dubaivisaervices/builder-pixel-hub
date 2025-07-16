import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lock,
  Building2,
  Plus,
  X,
  Upload,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Camera,
  MessageSquare,
  CheckCircle,
  LogOut,
  UserCheck,
  AlertTriangle,
  FileImage,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BusinessForm {
  name: string;
  address: string;
  category: string;
  phone: string;
  website: string;
  email: string;
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  businessStatus: string;
  logoUrl: string;
  photos: string[];
  reviews: Review[];
  description: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export default function AddBusinessPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [businessForm, setBusinessForm] = useState<BusinessForm>({
    name: "",
    address: "",
    category: "",
    phone: "",
    website: "",
    email: "",
    rating: 4.5,
    reviewCount: 10,
    latitude: 25.2048,
    longitude: 55.2708,
    businessStatus: "OPERATIONAL",
    logoUrl: "",
    photos: [],
    reviews: [],
    description: "",
  });

  const [newPhoto, setNewPhoto] = useState("");
  const [newReview, setNewReview] = useState({
    author: "",
    rating: 5,
    text: "",
    date: new Date().toISOString().split("T")[0],
  });

  // File upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    "registered visa agent Dubai",
    "education visa",
    "document clearance",
    "pro services",
    "attestation services",
    "work permit services",
    "tourist visa",
    "business visa",
    "family visa",
    "golden visa services",
    "residence visa",
    "employment visa",
    "investor visa",
    "visa helper",
    "immigration services",
    "business setup services",
  ];

  // File validation functions
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return "Please upload only image files (JPG, PNG, GIF, WebP)";
    }

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return "File size must be less than 2MB";
    }

    return null;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setUploadErrors([error]);
      return;
    }

    setLogoFile(file);
    setUploadErrors([]);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`Photo ${index + 1}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
      return;
    }

    setPhotoFiles((prev) => [...prev, ...validFiles]);
    setUploadErrors([]);
  };

  const removePhotoFile = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFilesToServer = async (): Promise<{
    logoUrl?: string;
    photoUrls: string[];
  }> => {
    setIsUploading(true);
    const formData = new FormData();

    try {
      // Upload logo
      let logoUrl = businessForm.logoUrl;
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      // Upload photos
      photoFiles.forEach((file, index) => {
        formData.append(`photo_${index}`, file);
      });

      // Add business ID for file naming
      const businessId = `manual-${Date.now()}`;
      formData.append("businessId", businessId);

      const response = await fetch("/api/admin/upload-business-images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const result = await response.json();
      return {
        logoUrl: result.logoUrl || logoUrl,
        photoUrls: result.photoUrls || [],
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple hardcoded login (you can make this more secure)
    if (
      loginForm.username === "bizadmin" &&
      loginForm.password === "addvisa2024"
    ) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ username: "", password: "" });
    // Reset form
    setBusinessForm({
      name: "",
      address: "",
      category: "",
      phone: "",
      website: "",
      email: "",
      rating: 4.5,
      reviewCount: 10,
      latitude: 25.2048,
      longitude: 55.2708,
      businessStatus: "OPERATIONAL",
      logoUrl: "",
      photos: [],
      reviews: [],
      description: "",
    });
  };

  const addPhoto = () => {
    if (newPhoto.trim()) {
      setBusinessForm((prev) => ({
        ...prev,
        photos: [...prev.photos, newPhoto.trim()],
      }));
      setNewPhoto("");
    }
  };

  const removePhoto = (index: number) => {
    setBusinessForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const addReview = () => {
    if (newReview.author.trim() && newReview.text.trim()) {
      const review: Review = {
        id: Date.now().toString(),
        ...newReview,
      };
      setBusinessForm((prev) => ({
        ...prev,
        reviews: [...prev.reviews, review],
      }));
      setNewReview({
        author: "",
        rating: 5,
        text: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  };

  const removeReview = (id: string) => {
    setBusinessForm((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Validate required fields
      if (
        !businessForm.name ||
        !businessForm.address ||
        !businessForm.category
      ) {
        alert("Please fill in all required fields (Name, Address, Category)");
        setIsUploading(false);
        return;
      }

      // Upload files first if any
      let logoUrl = businessForm.logoUrl;
      let photoUrls = [...businessForm.photos];

      if (logoFile || photoFiles.length > 0) {
        const uploadResult = await uploadFilesToServer();
        logoUrl = uploadResult.logoUrl || logoUrl;
        photoUrls = [...photoUrls, ...uploadResult.photoUrls];
      }

      // Generate unique ID
      const businessId = `manual-${Date.now()}`;

      const businessData = {
        ...businessForm,
        id: businessId,
        logoUrl: logoUrl,
        photos: photoUrls,
        hasTargetKeyword: businessForm.category.toLowerCase().includes("visa"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Adding business:", businessData);

      const response = await fetch("/api/admin/add-business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(businessData),
      });

      if (response.ok) {
        alert("Business added successfully!");
        // Reset form
        setBusinessForm({
          name: "",
          address: "",
          category: "",
          phone: "",
          website: "",
          email: "",
          rating: 4.5,
          reviewCount: 10,
          latitude: 25.2048,
          longitude: 55.2708,
          businessStatus: "OPERATIONAL",
          logoUrl: "",
          photos: [],
          reviews: [],
          description: "",
        });
        // Reset file uploads
        setLogoFile(null);
        setLogoPreview("");
        setPhotoFiles([]);
        setUploadErrors([]);
      } else {
        const errorData = await response.json();
        alert(
          `Failed to add business: ${errorData.error || "Please try again."}`,
        );
      }
    } catch (error) {
      console.error("Error adding business:", error);
      alert(`Error adding business: ${error.message || "Please try again."}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Login Form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Business Entry Portal
            </CardTitle>
            <p className="text-gray-600">Secure access required</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  className="mt-1"
                />
              </div>
              {loginError && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                  {loginError}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                Secure Login
              </Button>
            </form>
            <div className="mt-6 text-xs text-center text-gray-500 bg-gray-50 p-3 rounded">
              <p>🔐 Demo Credentials:</p>
              <p>
                Username: <strong>bizadmin</strong>
              </p>
              <p>
                Password: <strong>addvisa2024</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Business Entry Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Business Entry Portal</h1>
                <p className="text-blue-100">
                  Add new business listings manually
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500/20 text-green-100 border-green-300">
                <UserCheck className="h-3 w-3 mr-1" />
                Logged in as bizadmin
              </Badge>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-6 w-6" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={businessForm.name}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={businessForm.category}
                    onValueChange={(value) =>
                      setBusinessForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={businessForm.address}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  required
                  placeholder="Enter full business address"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={businessForm.description}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the business"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-6 w-6" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={businessForm.phone}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="04 123 4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessForm.email}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="info@business.com"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={businessForm.website}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://website.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Rating */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-6 w-6" />
                <span>Location & Rating</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={businessForm.latitude}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        latitude: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={businessForm.longitude}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        longitude: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={businessForm.rating}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        rating: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="reviewCount">Review Count</Label>
                  <Input
                    id="reviewCount"
                    type="number"
                    min="0"
                    value={businessForm.reviewCount}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({
                        ...prev,
                        reviewCount: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo & Photos */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-6 w-6" />
                <span>Images</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={businessForm.logoUrl}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({
                      ...prev,
                      logoUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/logo.jpg"
                />
              </div>

              <div>
                <Label>Business Photos</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(e.target.value)}
                    placeholder="Enter photo URL"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addPhoto}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {businessForm.photos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {businessForm.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm truncate flex-1">{photo}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6" />
                <span>Reviews</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="reviewAuthor">Author Name</Label>
                  <Input
                    id="reviewAuthor"
                    value={newReview.author}
                    onChange={(e) =>
                      setNewReview((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="reviewRating">Rating</Label>
                  <Select
                    value={newReview.rating.toString()}
                    onValueChange={(value) =>
                      setNewReview((prev) => ({
                        ...prev,
                        rating: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} ⭐
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="reviewDate">Date</Label>
                  <Input
                    id="reviewDate"
                    type="date"
                    value={newReview.date}
                    onChange={(e) =>
                      setNewReview((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-4">
                  <Label htmlFor="reviewText">Review Text</Label>
                  <Input
                    id="reviewText"
                    value={newReview.text}
                    onChange={(e) =>
                      setNewReview((prev) => ({
                        ...prev,
                        text: e.target.value,
                      }))
                    }
                    placeholder="Great service!"
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <Button
                    type="button"
                    onClick={addReview}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {businessForm.reviews.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium">
                    Added Reviews ({businessForm.reviews.length})
                  </h4>
                  {businessForm.reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{review.author}</span>
                            <div className="flex">
                              {Array.from({ length: review.rating }).map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className="h-3 w-3 text-yellow-400 fill-current"
                                  />
                                ),
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{review.text}</p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeReview(review.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-blue-50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ready to Add Business?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Make sure all information is correct before submitting.
                  </p>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Add Business
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
