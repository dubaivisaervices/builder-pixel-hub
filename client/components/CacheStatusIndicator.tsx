import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Cloud, DollarSign, Zap } from "lucide-react";

interface CacheStatusProps {
  totalImages: number;
  cachedImages: number;
  apiCallsNeeded: number;
  moneySaved: string;
}

export default function CacheStatusIndicator({
  totalImages,
  cachedImages,
  apiCallsNeeded,
  moneySaved,
}: CacheStatusProps) {
  const cachePercentage =
    totalImages > 0 ? Math.round((cachedImages / totalImages) * 100) : 0;
  const isWellCached = cachePercentage >= 80;
  const isModerateCached = cachePercentage >= 50;

  return (
    <div className="space-y-4">
      {/* Cache Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <Database className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <p className="font-semibold text-green-800">From Database</p>
            <p className="text-sm text-green-700">
              {cachedImages} images (No cost)
            </p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <Cloud className="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <p className="font-semibold text-orange-800">From Google API</p>
            <p className="text-sm text-orange-700">
              {apiCallsNeeded} images (Costs money)
            </p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <p className="font-semibold text-blue-800">Money Saved</p>
            <p className="text-sm text-blue-700">{moneySaved}</p>
          </div>
        </div>
      </div>

      {/* Cache Performance Alert */}
      {isWellCached ? (
        <Alert className="border-green-200 bg-green-50">
          <Zap className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Excellent cache performance!</strong> {cachePercentage}% of
            your images are served from the database, minimizing Google API
            costs. Your website loads images instantly without API calls.
          </AlertDescription>
        </Alert>
      ) : isModerateCached ? (
        <Alert className="border-orange-200 bg-orange-50">
          <Cloud className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Good cache coverage</strong> ({cachePercentage}%), but you
            can save more money by downloading the remaining {apiCallsNeeded}{" "}
            images to avoid Google API calls.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-red-200 bg-red-50">
          <DollarSign className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>High API usage detected!</strong> Only {cachePercentage}% of
            images are cached. Download more images to reduce Google API costs
            and improve loading speed.
          </AlertDescription>
        </Alert>
      )}

      {/* Cache Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={isWellCached ? "default" : "secondary"}
          className={isWellCached ? "bg-green-100 text-green-800" : ""}
        >
          {cachePercentage}% Cached
        </Badge>

        {cachedImages > 0 && (
          <Badge variant="outline" className="text-green-700 border-green-300">
            <Database className="h-3 w-3 mr-1" />
            {cachedImages} from Database
          </Badge>
        )}

        {apiCallsNeeded > 0 && (
          <Badge
            variant="outline"
            className="text-orange-700 border-orange-300"
          >
            <Cloud className="h-3 w-3 mr-1" />
            {apiCallsNeeded} need API
          </Badge>
        )}

        <Badge variant="outline" className="text-blue-700 border-blue-300">
          <DollarSign className="h-3 w-3 mr-1" />
          {moneySaved} saved
        </Badge>
      </div>
    </div>
  );
}
