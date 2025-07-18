import { RequestHandler } from "express";
import { database } from "../database/database";

export const debugDatabaseSave: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 Diagnosing database save issues...");

    // Test 1: Check database connection
    let connectionTest;
    try {
      const testQuery = await database.get("SELECT 1 as test");
      connectionTest = { success: true, result: testQuery };
    } catch (error) {
      connectionTest = { success: false, error: error.message };
    }

    // Test 2: Check table structure
    let schemaTest;
    try {
      const schema = await database.all("PRAGMA table_info(businesses)");
      schemaTest = { success: true, columns: schema };
    } catch (error) {
      schemaTest = { success: false, error: error.message };
    }

    // Test 3: Try a simple insert with test data
    let insertTest;
    const testBusiness = {
      id: "test_business_" + Date.now(),
      name: "Test Business for Diagnostic",
      address: "Test Address Dubai",
      phone: "",
      website: "",
      latitude: 25.2048,
      longitude: 55.2708,
      rating: 4.5,
      user_ratings_total: 100,
      business_status: "OPERATIONAL",
      category: "test category",
      description: "Test business for diagnostic purposes",
    };

    try {
      await database.run(
        `
        INSERT INTO businesses (
          id, name, address, phone, website, latitude, longitude,
          rating, user_ratings_total, business_status, category, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          testBusiness.id,
          testBusiness.name,
          testBusiness.address,
          testBusiness.phone,
          testBusiness.website,
          testBusiness.latitude,
          testBusiness.longitude,
          testBusiness.rating,
          testBusiness.user_ratings_total,
          testBusiness.business_status,
          testBusiness.category,
          testBusiness.description,
        ],
      );

      // Verify it was inserted
      const inserted = await database.get(
        "SELECT * FROM businesses WHERE id = ?",
        [testBusiness.id],
      );

      if (inserted) {
        // Clean up test data
        await database.run("DELETE FROM businesses WHERE id = ?", [
          testBusiness.id,
        ]);
        insertTest = { success: true, message: "Insert and delete successful" };
      } else {
        insertTest = {
          success: false,
          error: "Insert appeared to succeed but record not found",
        };
      }
    } catch (error) {
      insertTest = { success: false, error: error.message };
    }

    // Test 4: Check current business count
    let countTest;
    try {
      const count = await database.get(
        "SELECT COUNT(*) as total FROM businesses",
      );
      countTest = { success: true, count: count.total };
    } catch (error) {
      countTest = { success: false, error: error.message };
    }

    // Test 5: Check for constraint issues by testing duplicate insert
    let duplicateTest;
    try {
      // Get an existing business ID
      const existing = await database.get(
        "SELECT id, name FROM businesses LIMIT 1",
      );

      if (existing) {
        try {
          await database.run(
            `
            INSERT INTO businesses (
              id, name, address, phone, website, latitude, longitude,
              rating, user_ratings_total, business_status, category, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
            [
              existing.id, // Same ID should cause constraint error
              "Duplicate Test",
              "Test Address",
              "",
              "",
              0,
              0,
              0,
              0,
              "OPERATIONAL",
              "test",
              "test",
            ],
          );
          duplicateTest = {
            success: false,
            error: "Duplicate insert succeeded (should have failed)",
          };
        } catch (error) {
          duplicateTest = {
            success: true,
            message: "Primary key constraint working",
            constraintError: error.message,
          };
        }
      } else {
        duplicateTest = { success: false, error: "No existing business found" };
      }
    } catch (error) {
      duplicateTest = { success: false, error: error.message };
    }

    res.json({
      success: true,
      diagnostics: {
        connectionTest,
        schemaTest,
        insertTest,
        countTest,
        duplicateTest,
      },
      recommendations: insertTest.success
        ? [
            "Database appears to be working correctly",
            "Issue might be with data validation or duplicate checking",
          ]
        : [
            "Database insert is failing",
            "Check database permissions and schema",
          ],
    });
  } catch (error) {
    console.error("Database diagnostic error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
