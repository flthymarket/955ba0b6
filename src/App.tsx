import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Collection from "./pages/Collection";
import ProductPage from "./pages/ProductPage";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import Help from "./pages/Help";
import BrandsPage from "./pages/Brands";
import Stories from "./pages/Stories";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminStories from "./pages/admin/AdminStories";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin routes */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/brands" element={<AdminBrands />} />
            <Route path="/admin/stories" element={<AdminStories />} />
            <Route path="/admin/offers" element={<AdminOffers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/newsletter" element={<AdminNewsletter />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* Public routes */}
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/collection" element={<Layout><Collection /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductPage /></Layout>} />
            <Route path="/auth" element={<Layout><Auth /></Layout>} />
            <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
            <Route path="/account" element={<Layout><Account /></Layout>} />
            <Route path="/help" element={<Layout><Help /></Layout>} />
            <Route path="/brands" element={<Layout><BrandsPage /></Layout>} />
            <Route path="/stories" element={<Layout><Stories /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
