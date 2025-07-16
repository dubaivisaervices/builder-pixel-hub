import React from "react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowRight, Upload, Camera } from "lucide-react";

export function UploadAlert() {
  return (
    <Alert className="border-green-200 bg-green-50 mb-6">
      <Upload className="h-4 w-4 text-green-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="text-green-800">
          <strong>Ready to upload images to Hostinger!</strong> Go to the
          dedicated upload pages to process all 840+ businesses.
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            onClick={() => (window.location.href = "/hostinger-upload")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Camera className="mr-1 h-3 w-3" />
            🚀 Bulk Upload
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = "/admin-images")}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            <ArrowRight className="mr-1 h-3 w-3" />
            Individual
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
