import { Request, Response } from "express";
import { database } from "../database/database";

export async function checkReviewsSchema(req: Request, res: Response) {
  try {
    const schema = await database.all("PRAGMA table_info(reviews)");
    const sampleReview = await database.get("SELECT * FROM reviews LIMIT 1");

    res.json({
      schema,
      sampleReview,
      columns: schema.map((col: any) => col.name),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check schema",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
