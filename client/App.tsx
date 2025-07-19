import React, { useEffect } from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import SimpleNavigation from "./components/SimpleNavigation";
import Index from "./pages/Index";
import ComplaintFormImproved from "./pages/ComplaintFormImproved";
import CompanyReviews from "./pages/CompanyReviewsWorking";
import CompanyProfileModern from "./pages/CompanyProfileModern";
import SimpleBusinessDirectory from "./pages/SimpleBusinessDirectory";
import BusinessListing from "./pages/BusinessListing";
import HelpCenter from "./pages/HelpCenter";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManage from "./pages/AdminManage";
import NotFound from "./pages/NotFound";
import CompanyRedirect from "./pages/CompanyRedirect";
import AddBusinessPage from "./pages/AddBusinessPage";
import SupabaseAdmin from "./pages/SupabaseAdmin";
import LegacyRedirect from "./components/LegacyRedirect";
import FraudImmigrationConsultants from "./pages/FraudImmigrationConsultants";
import FraudImmigrationConsultantsStatic from "./pages/FraudImmigrationConsultantsStatic";

const queryClient = new QueryClient();

// Component to handle scroll to top on route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <SimpleNavigation />
        <main className="min-h-screen pt-4">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/complaint" element={<ComplaintFormImproved />} />
            <Route
              path="/dubai-businesses"
              element={<SimpleBusinessDirectory />}
            />
            <Route path="/services" element={<BusinessListing />} />
            <Route path="/services/:category" element={<BusinessListing />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/manage" element={<AdminManage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/add-business" element={<AddBusinessPage />} />
            <Route
              path="/fraud-immigration-consultants"
              element={<FraudImmigrationConsultants />}
            />
            <Route
              path="/fraud-immigration-consultants-static"
              element={<FraudImmigrationConsultantsStatic />}
            />

            <Route
              path="/:location/review/:companyName"
              element={<CompanyReviews />}
            />
            <Route path="/company/:companyId" element={<CompanyRedirect />} />
            <Route
              path="/reviews/:location/:companyName"
              element={<CompanyProfileModern key={`${Date.now()}`} />}
            />
            {/* Legacy redirect for old modern-profile URLs */}
            <Route
              path="/modern-profile/:location/:companyName"
              element={<LegacyRedirect />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
