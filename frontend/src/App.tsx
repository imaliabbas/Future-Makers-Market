import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import "./globals.css"; // Ensure globals.css is imported
import RegisterPage from "./pages/RegisterPage";
import MarketplacePage from "./pages/MarketplacePage";
import KidDashboardPage from "./pages/KidDashboardPage";
import ParentDashboardPage from "./pages/ParentDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MyStorefrontPage from "./pages/kid/MyStorefrontPage";
import MyProductsPage from "./pages/kid/MyProductsPage";
import ProductDetailsPage from "./pages/kid/ProductDetailsPage";
import PendingApprovalsPage from "./pages/parent/PendingApprovalsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { CartProvider } from "./contexts/CartContext";
import CartPage from "./pages/CartPage";


const queryClient = new QueryClient();

const App = () => (
  // The App component must return a single root element.
  // This React.Fragment now correctly wraps all top-level elements.
  <React.Fragment>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AppProvider>
            <CartProvider>
              <AuthProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/marketplace" element={<MarketplacePage />} />
                      <Route path="/kid-dashboard" element={<KidDashboardPage />} />
                      <Route path="/kid/my-storefront" element={<MyStorefrontPage />} />
                      <Route path="/kid/my-products" element={<MyProductsPage />} />
                      <Route path="/kid/products/new" element={<ProductDetailsPage />} />
                      <Route path="/kid/products/edit/:productId" element={<ProductDetailsPage />} />
                      <Route path="/parent-dashboard" element={<ParentDashboardPage />} />
                      <Route path="/parent/pending-approvals" element={<PendingApprovalsPage />} />
                      <Route path="/product/:productId" element={<ProductDetailPage />} />
                      <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </AuthProvider>
            </CartProvider>
          </AppProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    {/* Toaster and Sonner are now correctly rendered as siblings within the top-level React.Fragment */}
    <Toaster />
    <Sonner />
  </React.Fragment>
);

export default App;