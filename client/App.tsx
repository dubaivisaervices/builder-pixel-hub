import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ComplaintForm from "./pages/ComplaintForm";
import CompanyReviews from "./pages/CompanyReviewsWorking";
import BusinessDirectory from "./pages/BusinessDirectoryFixed";
import BusinessListing from "./pages/BusinessListing";
import HelpCenter from "./pages/HelpCenter";
import ApiTest from "./pages/ApiTest";
import AdminSync from "./pages/AdminSync";
import AdminManage from "./pages/AdminManage";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import DatabaseStatus from "./pages/DatabaseStatus";
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
          <Route
            path="/:location/review/:companyName"
            element={<CompanyReviews />}
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
