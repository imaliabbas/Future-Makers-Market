"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types/app";
import api from "@/lib/api"; // Import the axios instance

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: Partial<User> & { password: string; parent_email?: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isKidSeller: boolean;
  isParentGuardian: boolean;
  isBuyer: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      const backendUser = response.data;
      
      // Map backend user to frontend User type
      // Backend returns: _id (or id), email, display_name, role, parent_id, birthday
      const mappedUser: User = {
        user_id: backendUser._id || backendUser.id,
        email: backendUser.email,
        password_hash: "", // Not returned by API, kept for type compatibility
        display_name: backendUser.display_name,
        birthday: backendUser.birthday || "",
        role: backendUser.role,
        parent_id: backendUser.parent_id,
        created_date: new Date().toISOString(), // Mock if not in API
        last_modified_date: new Date().toISOString(), // Mock if not in API
        email_verified: true,
      };
      setCurrentUser(mappedUser);
    } catch (error) {
      console.error("Auth check failed:", error);
      // If 401, clear token
      localStorage.removeItem("accessToken");
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // OAuth2PasswordRequestForm expects form data
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = response.data;
      localStorage.setItem("accessToken", access_token);
      
      await checkAuth(); // Fetch user details after login
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const register = async (userData: Partial<User> & { password: string; parent_email?: string }): Promise<boolean> => {
    try {
      // Backend expects: email, password, display_name, role, parent_email (optional), birthday (optional)
      const payload = {
        email: userData.email,
        password: userData.password, // Frontend sends 'password_hash' as password in current impl, need to ensure
        display_name: userData.display_name,
        role: userData.role,
        parent_email: userData.parent_email,
        birthday: userData.birthday,
        parent_id: userData.parent_id 
      };

      await api.post("/auth/signup", payload);
      
      // Auto-login after successful registration
      if (userData.email && userData.password) {
        return await login(userData.email, userData.password);
      }
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setCurrentUser(null);
  };

  const updateUser = async (user: User): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { display_name: user.display_name };
      // Check if password was provided (stored temporarily in password_hash by ProfilePage)
      if (user.password_hash) {
        payload.password = user.password_hash;
      }

      const response = await api.put("/auth/me", payload);
      const backendUser = response.data;
      
      const mappedUser: User = {
        user_id: backendUser._id || backendUser.id,
        email: backendUser.email,
        password_hash: "",
        display_name: backendUser.display_name,
        birthday: backendUser.birthday || "",
        role: backendUser.role,
        parent_id: backendUser.parent_id,
        created_date: new Date().toISOString(),
        last_modified_date: new Date().toISOString(),
        email_verified: true,
      };

      setCurrentUser(mappedUser);
      return true;
    } catch (error) {
      console.error("Update user failed:", error);
      return false;
    }
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === "admin";
  const isKidSeller = currentUser?.role === "kid_seller";
  const isParentGuardian = currentUser?.role === "parent_guardian";
  const isBuyer = currentUser?.role === "buyer";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin,
        isKidSeller,
        isParentGuardian,
        isBuyer,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};