import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  Building2,
  Search,
  HelpCircle,
  Settings,
  FileText,
  Users,
  BarChart3,
  Database,
  Menu,
  Globe,
  Star,
  Shield,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const mainNavItems = [
    {
      path: "/",
      label: "Home",
      icon: Home,
      description: "Business directory homepage",
    },
    {
      path: "/dubai-businesses",
      label: "Businesses",
      icon: Building2,
      description: "Browse all Dubai businesses",
    },
    {
      path: "/services",
      label: "Services",
      icon: Search,
      description: "Find services by category",
    },
    {
      path: "/help-center",
      label: "Help",
      icon: HelpCircle,
      description: "Get support and documentation",
    },
  ];

  const adminNavItems = [
    { path: "/admin", label: "Dashboard", icon: BarChart3 },
    { path: "/admin/search", label: "Add Businesses", icon: Search },
    { path: "/admin/manage", label: "Manage", icon: Settings },
    { path: "/admin/sync", label: "Sync Data", icon: Database },
    { path: "/admin/status", label: "Status", icon: FileText },
    { path: "/admin/images", label: "Images", icon: Sparkles },
  ];

  const utilityNavItems = [
    { path: "/complaint", label: "Report Issue", icon: Shield },
    { path: "/api-test", label: "API Test", icon: Globe },
    { path: "/data-persistence", label: "Data Export", icon: FileText },
    { path: "/reviews-sync", label: "Reviews Sync", icon: Star },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 transition-all hover:scale-105"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline-block font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dubai Business Directory
            </span>
            <span className="sm:hidden font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DBD
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Main Navigation */}
                {mainNavItems.map((item) => (
                  <NavigationMenuItem key={item.path}>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive(item.path) &&
                          "bg-accent text-accent-foreground",
                      )}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                {/* Admin Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      isActive("/admin") && "bg-accent text-accent-foreground",
                    )}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {adminNavItems.map((item) => (
                        <NavigationMenuLink
                          key={item.path}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            isActive(item.path) &&
                              "bg-accent text-accent-foreground",
                          )}
                          onClick={() => handleNavigation(item.path)}
                        >
                          <div className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">
                              {item.label}
                            </div>
                          </div>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* More Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Users className="mr-2 h-4 w-4" />
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[300px] gap-3 p-4">
                      {utilityNavItems.map((item) => (
                        <NavigationMenuLink
                          key={item.path}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            isActive(item.path) &&
                              "bg-accent text-accent-foreground",
                          )}
                          onClick={() => handleNavigation(item.path)}
                        >
                          <div className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">
                              {item.label}
                            </div>
                          </div>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">
                      Dubai Business Directory
                    </span>
                  </div>

                  {/* Main Navigation */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Main
                    </h3>
                    {mainNavItems.map((item) => (
                      <Button
                        key={item.path}
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavigation(item.path)}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    ))}
                  </div>

                  {/* Admin Navigation */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Admin
                    </h3>
                    {adminNavItems.map((item) => (
                      <Button
                        key={item.path}
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavigation(item.path)}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    ))}
                  </div>

                  {/* Utility Navigation */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Tools
                    </h3>
                    {utilityNavItems.map((item) => (
                      <Button
                        key={item.path}
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavigation(item.path)}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
