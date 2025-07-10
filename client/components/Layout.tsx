import React from "react";
import { cn } from "@/lib/utils";
import Breadcrumb from "./Breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
  showBreadcrumbs?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
}

const Layout = ({
  children,
  className,
  containerClassName,
  fullWidth = false,
  showBreadcrumbs = true,
  breadcrumbItems,
}: LayoutProps) => {
  return (
    <div className={cn("min-h-[calc(100vh-4rem)]", className)}>
      {fullWidth ? (
        <>
          {showBreadcrumbs && (
            <div className="container mx-auto px-4 pt-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          )}
          {children}
        </>
      ) : (
        <div className={cn("container mx-auto px-4 py-6", containerClassName)}>
          {showBreadcrumbs && <Breadcrumb items={breadcrumbItems} />}
          {children}
        </div>
      )}
    </div>
  );
};

export default Layout;
