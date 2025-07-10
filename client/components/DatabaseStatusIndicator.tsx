import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const DatabaseStatusIndicator = () => {
  const [status, setStatus] = useState<"checking" | "optimized" | "normal">(
    "checking",
  );

  useEffect(() => {
    // Simple check to see if database is responding
    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch("/api/database-status");
        if (response.ok) {
          setStatus("optimized");
        } else {
          setStatus("normal");
        }
      } catch (error) {
        setStatus("normal");
      }
    };

    checkDatabaseStatus();
  }, []);

  if (status === "checking") return null;

  return (
    <Badge
      variant={status === "optimized" ? "default" : "secondary"}
      className={cn(
        "fixed bottom-4 right-4 z-40 flex items-center space-x-1 transition-all duration-300 hover:scale-105",
        status === "optimized" && "bg-green-600 hover:bg-green-700",
      )}
    >
      {status === "optimized" ? (
        <>
          <CheckCircle className="h-3 w-3" />
          <span className="text-xs">DB Optimized</span>
        </>
      ) : (
        <>
          <Database className="h-3 w-3" />
          <span className="text-xs">DB Active</span>
        </>
      )}
    </Badge>
  );
};

export default DatabaseStatusIndicator;
