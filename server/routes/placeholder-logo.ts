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

    // Create a responsive SVG logo
    const svg = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-${businessName}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#8B5CF6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow-${businessName}">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <rect width="100" height="100" rx="16" fill="url(#grad-${businessName})" filter="url(#shadow-${businessName})"/>
        <text x="50" y="65" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="white" stroke="rgba(0,0,0,0.1)" stroke-width="1">${initials}</text>
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
