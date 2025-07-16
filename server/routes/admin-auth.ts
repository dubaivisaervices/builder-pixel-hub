import { Request, Response } from "express";

/**
 * Direct admin login endpoint for testing
 */
export async function directAdminLogin(req: Request, res: Response) {
  try {
    const { adminId, password } = req.body;

    const validAdminId = process.env.ADMIN_PANEL_ID || "admin";
    const validPassword = process.env.ADMIN_PANEL_PASSWORD || "admin123";

    if (adminId === validAdminId && password === validPassword) {
      res.json({
        success: true,
        message: "Admin login successful",
        adminId: validAdminId,
        token: "admin_authenticated_token",
        redirectUrl: "/hostinger-upload",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login error",
      error: error.message,
    });
  }
}

/**
 * Get admin status
 */
export async function getAdminStatus(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      credentials: {
        adminId: process.env.ADMIN_PANEL_ID || "admin",
        password: process.env.ADMIN_PANEL_PASSWORD || "admin123",
      },
      message: "Admin panel ready",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
