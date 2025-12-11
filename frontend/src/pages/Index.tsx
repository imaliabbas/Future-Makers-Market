"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Corrected import path

const Index = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (currentUser?.role === "kid_seller") {
        navigate("/kid-dashboard");
      } else if (currentUser?.role === "parent_guardian") {
        navigate("/parent-dashboard");
      } else if (currentUser?.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/marketplace"); // Default for buyers
      }
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, currentUser, navigate]);

  // This component will now render nothing visually,
  // as its sole purpose is to redirect based on authentication status.
  return null;
};

export default Index;