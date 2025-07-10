import React from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import ComplaintForm from "./pages/ComplaintForm";
import CompanyReviews from "./pages/CompanyReviewsWorking";
import CompanyProfileModern from "./pages/CompanyProfileModern";
import BusinessDirectory from "./pages/BusinessDirectory";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/complaint" element={<ComplaintForm />} />
          <Route path="/dubai-businesses" element={<BusinessDirectory />} />
          <Route path="/services" element={<BusinessListing />} />
          <Route path="/services/:category" element={<BusinessListing />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/sync" element={<AdminSync />} />
          <Route path="/admin/manage" element={<AdminManage />} />
          <Route path="/admin/status" element={<DatabaseStatus />} />
          <Route path="/admin/images" element={<ImageDownloadDashboard />} />
          <Route path="/admin/search" element={<BusinessSearchManager />} />
          <Route path="/data-persistence" element={<DataPersistence />} />
          <Route path="/reviews-sync" element={<ReviewsSync />} />
          <Route
            path="/:location/review/:companyName"
            element={<CompanyReviews />}
          />
          <Route
            path="/modern-profile/:location/:companyName"
            element={<CompanyProfileModern />}
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
