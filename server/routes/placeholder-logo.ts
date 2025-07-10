import { Request, Response } from "express";

export const generatePlaceholderLogo = (req: Request, res: Response) => {
  try {
    const { businessName } = req.params;

    // Get initials from business name
    const initials = businessName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);

    // Create a simple SVG logo
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="20" fill="url(#grad)"/>
        <text x="100" y="130" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(svg);
  } catch (error) {
    console.error("Error generating placeholder logo:", error);
    res.status(500).json({ error: "Failed to generate logo" });
  }
};
