import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Upload, Camera, ArrowRight } from "lucide-react";

export function QuickUploadAccess() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Upload className="h-5 w-5" />
          Hostinger Image Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-blue-700">
          Upload all business logos and photos from Google Places API to your
          Hostinger server
        </p>

        <div className="flex gap-3">
          <Button
            onClick={() => (window.location.href = "/hostinger-upload")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Camera className="mr-2 h-4 w-4" />
            🚀 Bulk Upload All Images
          </Button>

          <Button
            onClick={() => (window.location.href = "/admin-images")}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Individual Business Upload
          </Button>
        </div>

        <div className="text-xs text-blue-600">
          <strong>Bulk Upload:</strong> Processes all 840+ businesses
          automatically
          <br />
          <strong>Individual:</strong> Select specific businesses to upload
        </div>
      </CardContent>
    </Card>
  );
}
