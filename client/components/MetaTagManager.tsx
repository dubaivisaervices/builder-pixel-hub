import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Globe,
  Search,
  FileText,
  Tags,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Copy,
} from "lucide-react";

interface MetaTag {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  canonical?: string;
  lastModified: string;
}

const defaultPages = [
  { path: "/", name: "Home Page" },
  { path: "/dubai-businesses", name: "Business Directory" },
  { path: "/complaint", name: "Report Business" },
  { path: "/services", name: "Services" },
  { path: "/help-center", name: "Help Center" },
  { path: "/add-business", name: "Add Business" },
  {
    path: "/fraud-immigration-consultants",
    name: "Fraud Immigration Consultants",
  },
  { path: "/admin", name: "Admin Dashboard" },
];

export default function MetaTagManager() {
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [editingMeta, setEditingMeta] = useState<MetaTag | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    page: "",
    title: "",
    description: "",
    keywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    robots: "index, follow",
    canonical: "",
  });

  useEffect(() => {
    loadMetaTags();
  }, []);

  const loadMetaTags = async () => {
    try {
      const response = await fetch("/api/admin/meta-tags");
      const data = await response.json();
      if (data.success) {
        setMetaTags(data.metaTags || []);
      }
    } catch (error) {
      console.error("Error loading meta tags:", error);
    }
  };

  const handleSave = async () => {
    if (!formData.page || !formData.title || !formData.description) {
      setMessage({
        type: "error",
        text: "Page, title, and description are required!",
      });
      return;
    }

    setLoading(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/admin/meta-tags/${editingMeta?.id}`
        : "/api/admin/meta-tags";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Meta tags ${isEditing ? "updated" : "created"} successfully!`,
        });
        loadMetaTags();
        resetForm();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save meta tags",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error saving meta tags" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meta: MetaTag) => {
    setEditingMeta(meta);
    setIsEditing(true);
    setFormData({
      page: meta.page,
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      ogTitle: meta.ogTitle || "",
      ogDescription: meta.ogDescription || "",
      ogImage: meta.ogImage || "",
      twitterTitle: meta.twitterTitle || "",
      twitterDescription: meta.twitterDescription || "",
      twitterImage: meta.twitterImage || "",
      robots: meta.robots || "index, follow",
      canonical: meta.canonical || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("Are you sure you want to delete this meta tag configuration?")
    )
      return;

    try {
      const response = await fetch(`/api/admin/meta-tags/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: "Meta tags deleted successfully!",
        });
        loadMetaTags();
      } else {
        setMessage({ type: "error", text: "Failed to delete meta tags" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error deleting meta tags" });
    }
  };

  const resetForm = () => {
    setFormData({
      page: "",
      title: "",
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      robots: "index, follow",
      canonical: "",
    });
    setIsEditing(false);
    setEditingMeta(null);
  };

  const generateSitemap = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/generate-sitemap", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: "Sitemap generated successfully!",
        });
      } else {
        setMessage({ type: "error", text: "Failed to generate sitemap" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error generating sitemap" });
    } finally {
      setLoading(false);
    }
  };

  const testMetaTags = async (page: string) => {
    try {
      const response = await fetch(
        `/api/admin/test-meta-tags?page=${encodeURIComponent(page)}`,
      );
      const data = await response.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Meta tags are working correctly for ${page}`,
        });
      } else {
        setMessage({ type: "error", text: "Meta tags test failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error testing meta tags" });
    }
  };

  const copyMetaTags = (meta: MetaTag) => {
    const metaString = `<title>${meta.title}</title>
<meta name="description" content="${meta.description}" />
<meta name="keywords" content="${meta.keywords}" />
<meta property="og:title" content="${meta.ogTitle || meta.title}" />
<meta property="og:description" content="${meta.ogDescription || meta.description}" />
${meta.ogImage ? `<meta property="og:image" content="${meta.ogImage}" />` : ""}
<meta name="twitter:title" content="${meta.twitterTitle || meta.title}" />
<meta name="twitter:description" content="${meta.twitterDescription || meta.description}" />
${meta.twitterImage ? `<meta name="twitter:image" content="${meta.twitterImage}" />` : ""}
<meta name="robots" content="${meta.robots || "index, follow"}" />
${meta.canonical ? `<link rel="canonical" href="${meta.canonical}" />` : ""}`;

    navigator.clipboard.writeText(metaString);
    setMessage({ type: "success", text: "Meta tags copied to clipboard!" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tags className="h-5 w-5" />
            <span>Meta Tag Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Manage SEO meta tags, Open Graph, and Twitter Card data for all
            pages. Optimize your site for search engines and social media
            sharing.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={generateSitemap}
              disabled={loading}
              variant="outline"
            >
              <Globe className="h-4 w-4 mr-2" />
              Generate Sitemap
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message.text}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessage(null)}
            className="ml-auto"
          >
            ×
          </Button>
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>{isEditing ? "Edit Meta Tags" : "Add New Meta Tags"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Page Selection */}
          <div>
            <Label>Page *</Label>
            <Select
              value={formData.page}
              onValueChange={(value) =>
                setFormData({ ...formData, page: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {defaultPages.map((page) => (
                  <SelectItem key={page.path} value={page.path}>
                    {page.name} ({page.path})
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Page Path</SelectItem>
              </SelectContent>
            </Select>
            {formData.page === "custom" && (
              <Input
                placeholder="Enter custom page path (e.g., /custom-page)"
                value={formData.page}
                onChange={(e) =>
                  setFormData({ ...formData, page: e.target.value })
                }
                className="mt-2"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Meta Tags */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Basic Meta Tags
              </h3>

              <div>
                <Label>Page Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Page title (60 chars max)"
                  maxLength={60}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/60 characters
                </div>
              </div>

              <div>
                <Label>Meta Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the page (160 chars max)"
                  maxLength={160}
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/160 characters
                </div>
              </div>

              <div>
                <Label>Keywords</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div>
                <Label>Robots</Label>
                <Select
                  value={formData.robots}
                  onValueChange={(value) =>
                    setFormData({ ...formData, robots: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index, follow">index, follow</SelectItem>
                    <SelectItem value="noindex, nofollow">
                      noindex, nofollow
                    </SelectItem>
                    <SelectItem value="index, nofollow">
                      index, nofollow
                    </SelectItem>
                    <SelectItem value="noindex, follow">
                      noindex, follow
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Canonical URL</Label>
                <Input
                  value={formData.canonical}
                  onChange={(e) =>
                    setFormData({ ...formData, canonical: e.target.value })
                  }
                  placeholder="https://example.com/canonical-url"
                />
              </div>
            </div>

            {/* Social Media Meta Tags */}
            <div className="space-y-4">
              <h3 className="font-semibold">Social Media Meta Tags</h3>

              <div>
                <Label>Open Graph Title</Label>
                <Input
                  value={formData.ogTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, ogTitle: e.target.value })
                  }
                  placeholder="Title for social sharing (defaults to page title)"
                />
              </div>

              <div>
                <Label>Open Graph Description</Label>
                <Textarea
                  value={formData.ogDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, ogDescription: e.target.value })
                  }
                  placeholder="Description for social sharing (defaults to meta description)"
                  rows={2}
                />
              </div>

              <div>
                <Label>Open Graph Image</Label>
                <Input
                  value={formData.ogImage}
                  onChange={(e) =>
                    setFormData({ ...formData, ogImage: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label>Twitter Title</Label>
                <Input
                  value={formData.twitterTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, twitterTitle: e.target.value })
                  }
                  placeholder="Title for Twitter (defaults to OG title)"
                />
              </div>

              <div>
                <Label>Twitter Description</Label>
                <Textarea
                  value={formData.twitterDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      twitterDescription: e.target.value,
                    })
                  }
                  placeholder="Description for Twitter (defaults to OG description)"
                  rows={2}
                />
              </div>

              <div>
                <Label>Twitter Image</Label>
                <Input
                  value={formData.twitterImage}
                  onChange={(e) =>
                    setFormData({ ...formData, twitterImage: e.target.value })
                  }
                  placeholder="https://example.com/twitter-image.jpg"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Meta Tags"
                  : "Save Meta Tags"}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Meta Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Meta Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {metaTags.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No meta tags configured yet. Add your first meta tag configuration
              above.
            </p>
          ) : (
            <div className="space-y-4">
              {metaTags.map((meta) => (
                <div key={meta.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{meta.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {defaultPages.find((p) => p.path === meta.page)?.name ||
                          meta.page}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testMetaTags(meta.page)}
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyMetaTags(meta)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(meta)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(meta.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {meta.description}
                  </p>
                  {meta.keywords && (
                    <div className="text-xs text-gray-500">
                      Keywords: {meta.keywords}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    Last modified:{" "}
                    {new Date(meta.lastModified).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
