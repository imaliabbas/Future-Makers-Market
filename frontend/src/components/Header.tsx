"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MenuIcon, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";


const Header = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { currentUser, isAuthenticated, logout, isKidSeller, isParentGuardian, isAdmin, isBuyer } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsSheetOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const renderNavigationLinks = (onLinkClick?: () => void) => (
    <>
      {onLinkClick ? (
        <Button variant="ghost" className="justify-start text-foreground hover:text-primary" onClick={() => { navigate("/marketplace"); onLinkClick(); }}>
          Marketplace
        </Button>
      ) : (
        <Link to="/marketplace" className="text-sm font-medium transition-colors text-foreground hover:text-primary">
          Marketplace
        </Link>
      )}

      {isKidSeller && (
        onLinkClick ? (
          <Button variant="ghost" className="justify-start text-foreground hover:text-primary" onClick={() => { navigate("/kid-dashboard"); onLinkClick(); }}>
            My Dashboard
          </Button>
        ) : (
          <Link to="/kid-dashboard" className="text-sm font-medium transition-colors text-foreground hover:text-primary">
            My Dashboard
          </Link>
        )
      )}
      {isParentGuardian && (
        <>
          {onLinkClick ? (
            <Button variant="ghost" className="justify-start text-foreground hover:text-primary" onClick={() => { navigate("/parent-dashboard"); onLinkClick(); }}>
              Parent Dashboard
            </Button>
          ) : (
            <Link to="/parent-dashboard" className="text-sm font-medium transition-colors text-foreground hover:text-primary">
              Parent Dashboard
            </Link>
          )}
          {onLinkClick ? (
            <Button variant="ghost" className="justify-start text-foreground hover:text-primary" onClick={() => { navigate("/parent/pending-approvals"); onLinkClick(); }}>
              Pending Approvals
            </Button>
          ) : (
            <Link to="/parent/pending-approvals" className="text-sm font-medium transition-colors text-foreground hover:text-primary">
              Pending Approvals
            </Link>
          )}
        </>
      )}
      {isAdmin && (
        onLinkClick ? (
          <Button variant="ghost" className="justify-start text-foreground hover:text-primary" onClick={() => { navigate("/admin-dashboard"); onLinkClick(); }}>
            Admin Dashboard
          </Button>
        ) : (
          <Link to="/admin-dashboard" className="text-sm font-medium transition-colors text-foreground hover:text-primary">
            Admin Dashboard
          </Link>
        )
      )}
    </>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm shadow-sm supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          Future Makers Market
        </Link>

        {/* Right-aligned group: Desktop Nav, Cart, User/Auth, Mobile Menu */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Desktop Navigation (hidden on small, flex on medium+) */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {renderNavigationLinks()}
          </nav>

          {/* Cart Icon for Buyers */}
          {isBuyer && (
            <Button variant="ghost" size="icon" asChild className="relative text-foreground hover:text-primary">
              <Link to="/cart">
                {/* Removed React.Fragment here */}
                <span className="flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center text-xs">
                      {cartItemCount}
                    </span>
                  )}
                  <span className="sr-only">View Cart</span>
                </span>
              </Link>
            </Button>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={currentUser?.display_name} />
                    <AvatarFallback>{getInitials(currentUser?.display_name || "User")}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.display_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email} ({currentUser?.role.replace('_', ' ')})
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Register
              </Button>
            </div>
          )}

          {/* Mobile Navigation Trigger (hidden on medium+ screens) */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <span className="flex items-center justify-center">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 py-6">
                {renderNavigationLinks(() => setIsSheetOpen(false))}
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" onClick={() => { navigate("/profile"); setIsSheetOpen(false); }} className="justify-start text-foreground hover:text-primary">
                      Profile
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className="justify-start text-foreground hover:text-primary">
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { navigate("/login"); setIsSheetOpen(false); }} className="justify-start">
                      Login
                    </Button>
                    <Button onClick={() => { navigate("/register"); setIsSheetOpen(false); }} className="justify-start">
                      Register
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;