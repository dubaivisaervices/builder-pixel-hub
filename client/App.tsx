import React, { useEffect } from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import SimpleNavigation from "./components/SimpleNavigation";
import Index from "./pages/Index";
import ComplaintFormModern from "./pages/ComplaintFormModern";
import CompanyReviews from "./pages/CompanyReviewsWorking";
import CompanyProfileModern from "./pages/CompanyProfileModern";
import SimpleBusinessDirectory from "./pages/SimpleBusinessDirectory";
import BusinessListing from "./pages/BusinessListing";
import HelpCenter from "./pages/HelpCenter";
import ApiTest from "./pages/ApiTest";
import AdminSync from "./pages/AdminSync";
import AdminManage from "./pages/AdminManage";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import DataPersistence from "./pages/DataPersistence";
import ReviewsSync from "./pages/ReviewsSync";
import DatabaseStatus from "./pages/DatabaseStatus";
import ImageDownloadDashboard from "./pages/ImageDownloadDashboard";
import BusinessSearchManager from "./pages/BusinessSearchManager";
import AdminImageManager from "./pages/AdminImageManager";
import HostingerUpload from "./pages/HostingerUpload";
import AdminBypass from "./pages/AdminBypass";
import InstantAdmin from "./pages/InstantAdmin";
import NotFound from "./pages/NotFound";
import DataDiagnostic from "./components/DataDiagnostic";
import CompanyRedirect from "./pages/CompanyRedirect";
import ImageTest from "./pages/ImageTest";
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
            <Route path="/complaint" element={<ComplaintForm />} />
            <Route
              path="/dubai-businesses"
              element={<SimpleBusinessDirectory />}
            />
            <Route path="/services" element={<BusinessListing />} />
            <Route path="/services/:category" element={<BusinessListing />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/api-test" element={<ApiTest />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/manage" element={<AdminManage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/admin-images" element={<AdminImageManager />} />
            <Route path="/supabase-admin" element={<SupabaseAdmin />} />
            <Route path="/hostinger-upload" element={<HostingerUpload />} />
            <Route path="/add-business" element={<AddBusinessPage />} />
            <Route path="/admin-login" element={<AdminBypass />} />
            <Route path="/admin-access" element={<InstantAdmin />} />
            <Route
              path="/fraud-immigration-consultants"
              element={<FraudImmigrationConsultants />}
            />
            <Route
              path="/fraud-immigration-consultants-static"
              element={<FraudImmigrationConsultantsStatic />}
            />
            <Route path="/data-diagnostic" element={<DataDiagnostic />} />
            <Route path="/data-persistence" element={<DataPersistence />} />
            <Route path="/reviews-sync" element={<ReviewsSync />} />
            <Route path="/image-test" element={<ImageTest />} />
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
