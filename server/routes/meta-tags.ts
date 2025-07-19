import { RequestHandler } from "express";
import { database } from "../database/database";

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

// Initialize meta tags table
const initMetaTagsTable = async () => {
  try {
    await database.run(`
      CREATE TABLE IF NOT EXISTS meta_tags (
        id TEXT PRIMARY KEY,
        page TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        keywords TEXT,
        og_title TEXT,
        og_description TEXT,
        og_image TEXT,
        twitter_title TEXT,
        twitter_description TEXT,
        twitter_image TEXT,
        robots TEXT DEFAULT 'index, follow',
        canonical TEXT,
        last_modified TEXT NOT NULL
      )
    `);
    console.log("✅ Meta tags table initialized");
  } catch (error) {
    console.error("❌ Error initializing meta tags table:", error);
  }
};

// Initialize table on import
initMetaTagsTable();

// Get all meta tags
export const getAllMetaTags: RequestHandler = async (req, res) => {
  try {
    const metaTags = await database.all(`
      SELECT 
        id,
        page,
        title,
        description,
        keywords,
        og_title as ogTitle,
        og_description as ogDescription,
        og_image as ogImage,
        twitter_title as twitterTitle,
        twitter_description as twitterDescription,
        twitter_image as twitterImage,
        robots,
        canonical,
        last_modified as lastModified
      FROM meta_tags 
      ORDER BY last_modified DESC
    `);

    res.json({
      success: true,
      metaTags: metaTags,
    });
  } catch (error) {
    console.error("Error fetching meta tags:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch meta tags",
    });
  }
};

// Get meta tags for a specific page
export const getMetaTagsByPage: RequestHandler = async (req, res) => {
  try {
    const { page } = req.params;

    const metaTag = await database.get(
      `
      SELECT 
        id,
        page,
        title,
        description,
        keywords,
        og_title as ogTitle,
        og_description as ogDescription,
        og_image as ogImage,
        twitter_title as twitterTitle,
        twitter_description as twitterDescription,
        twitter_image as twitterImage,
        robots,
        canonical,
        last_modified as lastModified
      FROM meta_tags 
      WHERE page = ?
    `,
      [page],
    );

    if (!metaTag) {
      return res.status(404).json({
        success: false,
        error: "Meta tags not found for this page",
      });
    }

    res.json({
      success: true,
      metaTag: metaTag,
    });
  } catch (error) {
    console.error("Error fetching meta tags for page:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch meta tags for page",
    });
  }
};

// Create new meta tags
export const createMetaTags: RequestHandler = async (req, res) => {
  try {
    const {
      page,
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      robots,
      canonical,
    } = req.body;

    if (!page || !title || !description) {
      return res.status(400).json({
        success: false,
        error: "Page, title, and description are required",
      });
    }

    const id = `meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const lastModified = new Date().toISOString();

    await database.run(
      `
      INSERT INTO meta_tags (
        id, page, title, description, keywords, 
        og_title, og_description, og_image,
        twitter_title, twitter_description, twitter_image,
        robots, canonical, last_modified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        page,
        title,
        description,
        keywords || "",
        ogTitle || "",
        ogDescription || "",
        ogImage || "",
        twitterTitle || "",
        twitterDescription || "",
        twitterImage || "",
        robots || "index, follow",
        canonical || "",
        lastModified,
      ],
    );

    res.json({
      success: true,
      message: "Meta tags created successfully",
      id: id,
    });
  } catch (error: any) {
    console.error("Error creating meta tags:", error);

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({
        success: false,
        error: "Meta tags already exist for this page",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create meta tags",
    });
  }
};

// Update meta tags
export const updateMetaTags: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page,
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      robots,
      canonical,
    } = req.body;

    if (!page || !title || !description) {
      return res.status(400).json({
        success: false,
        error: "Page, title, and description are required",
      });
    }

    const lastModified = new Date().toISOString();

    const result = await database.run(
      `
      UPDATE meta_tags SET 
        page = ?, title = ?, description = ?, keywords = ?,
        og_title = ?, og_description = ?, og_image = ?,
        twitter_title = ?, twitter_description = ?, twitter_image = ?,
        robots = ?, canonical = ?, last_modified = ?
      WHERE id = ?
    `,
      [
        page,
        title,
        description,
        keywords || "",
        ogTitle || "",
        ogDescription || "",
        ogImage || "",
        twitterTitle || "",
        twitterDescription || "",
        twitterImage || "",
        robots || "index, follow",
        canonical || "",
        lastModified,
        id,
      ],
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Meta tags not found",
      });
    }

    res.json({
      success: true,
      message: "Meta tags updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating meta tags:", error);

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({
        success: false,
        error: "Another page already uses this path",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update meta tags",
    });
  }
};

// Delete meta tags
export const deleteMetaTags: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await database.run("DELETE FROM meta_tags WHERE id = ?", [
      id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Meta tags not found",
      });
    }

    res.json({
      success: true,
      message: "Meta tags deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting meta tags:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete meta tags",
    });
  }
};

// Generate sitemap
export const generateSitemap: RequestHandler = async (req, res) => {
  try {
    const metaTags = await database.all("SELECT page FROM meta_tags");
    const pages = metaTags.map((tag: any) => tag.page);

    // Add default pages if not already in meta tags
    const defaultPages = [
      "/",
      "/dubai-businesses",
      "/complaint",
      "/services",
      "/help-center",
      "/add-business",
      "/fraud-immigration-consultants",
    ];

    const allPages = [...new Set([...pages, ...defaultPages])];
    const baseUrl = process.env.BASE_URL || "https://dubaiapprovedbusiness.com";

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("")}
</urlset>`;

    // Write sitemap to public directory
    const fs = await import("fs/promises");
    const path = await import("path");
    const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    await fs.writeFile(sitemapPath, sitemap);

    res.json({
      success: true,
      message: "Sitemap generated successfully",
      pages: allPages.length,
      path: "/sitemap.xml",
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate sitemap",
    });
  }
};

// Test meta tags for a page
export const testMetaTags: RequestHandler = async (req, res) => {
  try {
    const { page } = req.query;

    if (!page) {
      return res.status(400).json({
        success: false,
        error: "Page parameter is required",
      });
    }

    const metaTag = await database.get(
      "SELECT * FROM meta_tags WHERE page = ?",
      [page],
    );

    if (!metaTag) {
      return res.status(404).json({
        success: false,
        error: "No meta tags found for this page",
      });
    }

    // Simulate testing meta tags
    const tests = {
      titleLength: metaTag.title.length <= 60,
      descriptionLength: metaTag.description.length <= 160,
      hasKeywords: !!metaTag.keywords,
      hasOgTags: !!(metaTag.og_title || metaTag.title),
      hasTwitterTags: !!(metaTag.twitter_title || metaTag.title),
      robotsValid: [
        "index, follow",
        "noindex, nofollow",
        "index, nofollow",
        "noindex, follow",
      ].includes(metaTag.robots),
    };

    const allTestsPassed = Object.values(tests).every(Boolean);

    res.json({
      success: allTestsPassed,
      tests: tests,
      message: allTestsPassed
        ? "All meta tag tests passed!"
        : "Some meta tag tests failed",
      metaTag: {
        page: metaTag.page,
        title: metaTag.title,
        description: metaTag.description,
        titleLength: metaTag.title.length,
        descriptionLength: metaTag.description.length,
      },
    });
  } catch (error) {
    console.error("Error testing meta tags:", error);
    res.status(500).json({
      success: false,
      error: "Failed to test meta tags",
    });
  }
};

// Generate robots.txt
export const generateRobotsTxt: RequestHandler = async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || "https://dubaiapprovedbusiness.com";

    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin
Disallow: /api/

# Allow important pages
Allow: /
Allow: /dubai-businesses
Allow: /complaint
Allow: /services
Allow: /help-center
Allow: /add-business
Allow: /fraud-immigration-consultants

# Crawl delay
Crawl-delay: 1`;

    // Write robots.txt to public directory
    const fs = await import("fs/promises");
    const path = await import("path");
    const robotsPath = path.join(process.cwd(), "public", "robots.txt");
    await fs.writeFile(robotsPath, robotsTxt);

    res.json({
      success: true,
      message: "robots.txt generated successfully",
      content: robotsTxt,
    });
  } catch (error) {
    console.error("Error generating robots.txt:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate robots.txt",
    });
  }
};
