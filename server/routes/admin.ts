import { RequestHandler } from "express";
import { businessService } from "../database/businessService";

// Get all businesses grouped by category
export const getBusinessesByCategory: RequestHandler = async (req, res) => {
  try {
    const businessesByCategory =
      await businessService.getBusinessesByCategory();
    res.json({
      success: true,
      data: businessesByCategory,
    });
  } catch (error) {
    console.error("Error fetching businesses by category:", error);
    res.status(500).json({
      error: "Failed to fetch businesses by category",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Debug endpoint to check photo data
export const debugPhotoData: RequestHandler = async (req, res) => {
  try {
    const businesses = await businessService.getBusinessesPaginated(
      50,
      0,
      false,
    );

    const photoStats = {
      totalBusinesses: businesses.length,
      withLogoUrl: 0,
      withPhotos: 0,
      sampleLogoUrls: [] as string[],
      sampleBusinessesWithPhotos: [] as any[],
    };

    businesses.forEach((business) => {
      if (business.logoUrl) {
        photoStats.withLogoUrl++;
        if (photoStats.sampleLogoUrls.length < 5) {
          photoStats.sampleLogoUrls.push(business.logoUrl);
        }
      }

      if (business.photos && business.photos.length > 0) {
        photoStats.withPhotos++;
        if (photoStats.sampleBusinessesWithPhotos.length < 5) {
          photoStats.sampleBusinessesWithPhotos.push({
            name: business.name,
            logoUrl: business.logoUrl,
            photosCount: business.photos.length,
            firstPhotoUrl: business.photos[0]?.url,
          });
        }
      }
    });

    res.json({
      success: true,
      photoStats,
    });
  } catch (error) {
    console.error("Error debugging photo data:", error);
    res.status(500).json({
      error: "Failed to debug photo data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update a business
export const updateBusiness: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const businessData = req.body;

    await businessService.updateBusiness(id, businessData);

    res.json({
      success: true,
      message: "Business updated successfully",
    });
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({
      error: "Failed to update business",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a business
export const deleteBusiness: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await businessService.deleteBusiness(id);

    res.json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({
      error: "Failed to delete business",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all categories
export const getAllCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await businessService.getAllCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update category name
export const updateCategory: RequestHandler = async (req, res) => {
  try {
    const { oldCategory } = req.params;
    const { newCategory } = req.body;

    await businessService.updateCategory(oldCategory, newCategory);

    res.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      error: "Failed to update category",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete category and all its businesses
export const deleteCategory: RequestHandler = async (req, res) => {
  try {
    const { category } = req.params;

    await businessService.deleteCategory(category);

    res.json({
      success: true,
      message: "Category and all its businesses deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      error: "Failed to delete category",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
