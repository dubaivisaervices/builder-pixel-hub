import { Request, Response } from "express";
import axios from "axios";

export async function testGoogleAPIAccess(req: Request, res: Response) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: "Google Places API key not configured",
    });
  }

  const tests = [];

  // Test 1: Simple Geocoding API (usually works)
  try {
    const geocodeResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: "Dubai Mall, Dubai",
          key: apiKey,
        },
      },
    );

    tests.push({
      api: "Geocoding API",
      status: geocodeResponse.data.status,
      success: geocodeResponse.data.status === "OK",
      url: "https://maps.googleapis.com/maps/api/geocode/json",
    });
  } catch (error) {
    tests.push({
      api: "Geocoding API",
      status: "ERROR",
      success: false,
      error: error.message,
    });
  }

  // Test 2: Places Text Search API
  try {
    const textSearchResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: "McDonald's Dubai",
          key: apiKey,
        },
      },
    );

    tests.push({
      api: "Places Text Search API",
      status: textSearchResponse.data.status,
      success: textSearchResponse.data.status === "OK",
      url: "https://maps.googleapis.com/maps/api/place/textsearch/json",
      results: textSearchResponse.data.results?.length || 0,
    });
  } catch (error) {
    tests.push({
      api: "Places Text Search API",
      status: "ERROR",
      success: false,
      error: error.message,
    });
  }

  // Test 3: Find Place from Text API
  try {
    const findPlaceResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
      {
        params: {
          input: "McDonald's Dubai",
          inputtype: "textquery",
          fields: "place_id,name",
          key: apiKey,
        },
      },
    );

    tests.push({
      api: "Find Place from Text API",
      status: findPlaceResponse.data.status,
      success: findPlaceResponse.data.status === "OK",
      url: "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
      candidates: findPlaceResponse.data.candidates?.length || 0,
    });
  } catch (error) {
    tests.push({
      api: "Find Place from Text API",
      status: "ERROR",
      success: false,
      error: error.message,
    });
  }

  // Test 4: Nearby Search API
  try {
    const nearbyResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: "25.276987,55.296249", // Dubai coordinates
          radius: "1000",
          type: "restaurant",
          key: apiKey,
        },
      },
    );

    tests.push({
      api: "Nearby Search API",
      status: nearbyResponse.data.status,
      success: nearbyResponse.data.status === "OK",
      url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      results: nearbyResponse.data.results?.length || 0,
    });
  } catch (error) {
    tests.push({
      api: "Nearby Search API",
      status: "ERROR",
      success: false,
      error: error.message,
    });
  }

  const summary = {
    totalTests: tests.length,
    successful: tests.filter((t) => t.success).length,
    failed: tests.filter((t) => !t.success).length,
    apiKey: `${apiKey.substring(0, 10)}...`,
  };

  res.json({
    success: true,
    summary,
    tests,
    message: "Google API Access Test Results",
  });
}
