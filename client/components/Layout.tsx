import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
}

const Layout = ({
  children,
  className,
  containerClassName,
  fullWidth = false,
}: LayoutProps) => {
  return (
    <div className={cn("min-h-[calc(100vh-4rem)]", className)}>
      {fullWidth ? (
        children
      ) : (
        <div className={cn("container mx-auto px-4 py-6", containerClassName)}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Layout;
