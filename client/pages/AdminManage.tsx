import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  FolderOpen,
  Users,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
} from "lucide-react";
import { BusinessData } from "@shared/google-business";

interface BusinessesByCategory {
  [category: string]: BusinessData[];
}

export default function AdminManage() {
  const [businessesByCategory, setBusinessesByCategory] =
    useState<BusinessesByCategory>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBusiness, setEditingBusiness] = useState<BusinessData | null>(
    null,
  );
  const [editingCategory, setEditingCategory] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load businesses by category
      const businessesResponse = await fetch(
        "/api/admin/businesses-by-category",
      );
      if (businessesResponse.ok) {
        const businessesResult = await businessesResponse.json();
        setBusinessesByCategory(businessesResult.data);
      }

      // Load categories
      const categoriesResponse = await fetch("/api/admin/categories");
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBusiness = (business: BusinessData) => {
    setEditingBusiness(business);
    setIsEditDialogOpen(true);
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    try {
      const response = await fetch(
        `/api/admin/business/${editingBusiness.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingBusiness),
        },
      );

      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingBusiness(null);
        await loadData();
      }
    } catch (error) {
      console.error("Error updating business:", error);
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    try {
      const response = await fetch(`/api/admin/business/${businessId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  const handleUpdateCategory = async (
    oldCategory: string,
    newCategory: string,
  ) => {
    try {
      const response = await fetch(
        `/api/admin/category/${encodeURIComponent(oldCategory)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newCategory }),
        },
      );

      if (response.ok) {
        setIsCategoryDialogOpen(false);
        setEditingCategory("");
        await loadData();
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    try {
      const response = await fetch(
        `/api/admin/category/${encodeURIComponent(category)}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const getFilteredCategories = () => {
    if (selectedCategory === "all") {
      return Object.keys(businessesByCategory);
    }
    return selectedCategory ? [selectedCategory] : [];
  };

  const getTotalBusinesses = () => {
    return Object.values(businessesByCategory).reduce(
      (total, businesses) => total + businesses.length,
      0,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg">Loading admin data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Building2 className="h-7 w-7 mr-3 text-blue-600" />
                Business & Category Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all business listings and categories in the database
              </p>
            </div>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Businesses
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getTotalBusinesses()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FolderOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Categories
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {categories.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg per Category
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {categories.length > 0
                      ? Math.round(getTotalBusinesses() / categories.length)
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="businesses">Business Management</TabsTrigger>
            <TabsTrigger value="categories">Category Management</TabsTrigger>
          </TabsList>

          {/* Business Management Tab */}
          <TabsContent value="businesses" className="space-y-6">
            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Categories ({getTotalBusinesses()} businesses)
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category} (
                        {businessesByCategory[category]?.length || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Businesses by Category */}
            {getFilteredCategories().map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
                      {category}
                      <Badge variant="secondary" className="ml-2">
                        {businessesByCategory[category]?.length || 0} businesses
                      </Badge>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {businessesByCategory[category]?.map((business) => (
                    <div
                      key={business.id}
                      className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {business.name}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {business.address}
                            </div>
                            {business.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {business.phone}
                              </div>
                            )}
                            {business.email && (
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {business.email}
                              </div>
                            )}
                            {business.website && (
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-1" />
                                <a
                                  href={business.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm">
                                {business.rating}
                              </span>
                            </div>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-600">
                              {business.reviewCount} reviews
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <Badge
                              variant={
                                business.businessStatus === "OPERATIONAL"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {business.businessStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBusiness(business)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Business
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {business.name}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteBusiness(business.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Category Management Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{category}</h3>
                          <p className="text-sm text-gray-600">
                            {businessesByCategory[category]?.length || 0}{" "}
                            businesses
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="categoryName">
                                    Category Name
                                  </Label>
                                  <Input
                                    id="categoryName"
                                    defaultValue={category}
                                    onChange={(e) =>
                                      setEditingCategory(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      setIsCategoryDialogOpen(false)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleUpdateCategory(
                                        category,
                                        editingCategory,
                                      )
                                    }
                                  >
                                    Update
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Category
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the category "
                                  {category}"? This will also delete all{" "}
                                  {businessesByCategory[category]?.length || 0}{" "}
                                  businesses in this category. This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Category & Businesses
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Business Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Business</DialogTitle>
            </DialogHeader>
            {editingBusiness && (
              <form onSubmit={handleUpdateBusiness} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Business Name</Label>
                    <Input
                      id="name"
                      value={editingBusiness.name}
                      onChange={(e) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingBusiness.category}
                      onValueChange={(value) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={editingBusiness.address}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editingBusiness.phone || ""}
                      onChange={(e) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editingBusiness.email || ""}
                      onChange={(e) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={editingBusiness.website || ""}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        website: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={editingBusiness.rating}
                      onChange={(e) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          rating: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewCount">Review Count</Label>
                    <Input
                      id="reviewCount"
                      type="number"
                      min="0"
                      value={editingBusiness.reviewCount}
                      onChange={(e) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          reviewCount: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editingBusiness.businessStatus}
                      onValueChange={(value) =>
                        setEditingBusiness({
                          ...editingBusiness,
                          businessStatus: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPERATIONAL">Operational</SelectItem>
                        <SelectItem value="CLOSED_TEMPORARILY">
                          Closed Temporarily
                        </SelectItem>
                        <SelectItem value="CLOSED_PERMANENTLY">
                          Closed Permanently
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Business</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
