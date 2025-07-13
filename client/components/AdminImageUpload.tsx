import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Upload, X, Check, AlertCircle } from "lucide-react";

interface AdminImageUploadProps {
  businessId: string;
  type: "logo" | "photos";
  onUploadComplete?: (urls: string[]) => void;
}

export function AdminImageUpload({
  businessId,
  type,
  onUploadComplete,
}: AdminImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (type === "logo" && imageFiles.length > 1) {
      setFiles([imageFiles[0]]); // Only one logo allowed
    } else {
      setFiles(imageFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadToS3 = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus("idle");

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("businessId", businessId);
        formData.append("type", type);

        const response = await fetch("/api/upload-business-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const result = await response.json();
        return result.s3Url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Update business record with new S3 URLs
      await fetch(`/api/businesses/${businessId}/update-images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          urls: uploadedUrls,
        }),
      });

      setUploadStatus("success");
      setFiles([]);
      onUploadComplete?.(uploadedUrls);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Business {type === "logo" ? "Logo" : "Photos"}
        </CardTitle>
        <CardDescription>
          Upload {type === "logo" ? "a logo" : "photos"} for this business to S3
          storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept="image/*"
            multiple={type === "photos"}
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-sm text-gray-500 mt-1">
            {type === "logo"
              ? "Select one logo image"
              : "Select multiple photos"}
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Selected Files:</h4>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={uploadToS3}
          disabled={files.length === 0 || uploading}
          className="w-full"
        >
          {uploading
            ? "Uploading..."
            : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
        </Button>

        {uploadStatus === "success" && (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span>Upload successful!</span>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Upload failed. Please try again.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
