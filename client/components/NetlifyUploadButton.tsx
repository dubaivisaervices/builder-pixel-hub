import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle, Image } from "lucide-react";

export default function NetlifyUploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<string[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleNetlifyUpload = async () => {
    setIsUploading(true);
    setUploadResults([]);
    setUploadComplete(false);

    try {
      const response = await fetch("/api/upload-photos-to-netlify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim());

            setUploadResults((prev) => [...prev, ...lines]);
          }
        }

        setUploadComplete(true);
      } else {
        const error = await response.json();
        setUploadResults([`❌ Upload failed: ${error.error}`]);
      }
    } catch (error) {
      setUploadResults([`❌ Network error: ${error.message}`]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-6 w-6" />
          Netlify Photo Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleNetlifyUpload}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Uploading to Netlify...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload 92+ Photos to Netlify
              </>
            )}
          </Button>

          {uploadComplete && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Upload Complete!</span>
            </div>
          )}
        </div>

        {uploadResults.length > 0 && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Upload Progress:</h4>
            <div className="max-h-96 overflow-y-auto font-mono text-sm">
              {uploadResults.map((line, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    line.includes("✅")
                      ? "text-green-600"
                      : line.includes("❌")
                        ? "text-red-600"
                        : line.includes("🔄")
                          ? "text-blue-600"
                          : "text-gray-700"
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">What this does:</h4>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Uploads 92+ business photos to Netlify CDN</li>
            <li>• Updates database with Netlify URLs</li>
            <li>• Makes photos load faster globally</li>
            <li>
              • Serves photos from
              https://your-site.netlify.app/business-photos/
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
