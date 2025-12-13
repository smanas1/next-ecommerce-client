"use client";

import { ArrowLeft, Menu, ShoppingBag, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";

// Define a function to get navigation items based on user authentication
const getNavItems = (isLoggedIn: boolean) => {
  const items = [
    {
      title: "HOME",
      to: "/",
    },
  ];

  if (isLoggedIn) {
    items.push({
      title: "PRODUCTS",
      to: "/listing",
    });
  }

  return items;
};

function Header() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [mobileView, setMobileView] = useState<"menu" | "account">("menu");
  const [showSheetDialog, setShowSheetDialog] = useState(false);
  const { fetchCart, items } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  const { user, isLoading } = useAuthStore(); // Get user and loading state from auth store

  // For consistent server and client rendering, always render an array with a placeholder
  // The actual nav items will be determined after hydration
  const [navItems, setNavItems] = useState(getNavItems(false)); // Start with non-auth items
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after component mounts
    setIsClient(true);
    // Update nav items based on actual auth status
    setNavItems(getNavItems(!!user));
  }, [user, isLoading]);

  // Use the isClient state to prevent rendering conditional UI during SSR
  const shouldRenderConditionalUI = isClient && !isLoading;
  // Fallback to non-auth items during SSR/initial load
  const displayNavItems = shouldRenderConditionalUI ? getNavItems(!!user) : getNavItems(false);

  const renderMobileMenuItems = () => {
    switch (mobileView) {
      case "account":
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <Button
                onClick={() => setMobileView("menu")}
                variant="ghost"
                size="icon"
              >
                <ArrowLeft />
              </Button>
            </div>
            {shouldRenderConditionalUI ? ( // Show conditional UI after auth is loaded
              user ? ( // Show user actions if logged in
                <nav className="space-y-2">
                  <p
                    onClick={() => {
                      setShowSheetDialog(false);
                      router.push("/account");
                    }}
                    className="block cursor-pointer w-full p-2"
                  >
                    Your Account
                  </p>
                  <Button
                    onClick={() => {
                      setShowSheetDialog(false);
                      setMobileView("menu");
                      handleLogout();
                    }}
                  >
                    Logout
                  </Button>
                </nav>
              ) : ( // Show login button if not logged in
                <div className="p-2">
                  <Button
                    onClick={() => {
                      setShowSheetDialog(false);
                      router.push("/auth/login");
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                </div>
              )
            ) : ( // Show a placeholder while loading to prevent hydration mismatch
              <div className="p-2">Loading...</div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              {displayNavItems.map((navItem) => (
                <p
                  className={`block w-full font-semibold p-2 cursor-pointer ${!shouldRenderConditionalUI ? 'opacity-0 absolute' : ''}`}
                  onClick={() => {
                    setShowSheetDialog(false);
                    router.push(navItem.to);
                  }}
                  key={navItem.title}
                >
                  {navItem.title}
                </p>
              ))}
            </div>
            <div className="space-y-4">
              {shouldRenderConditionalUI ? ( // Show conditional UI after auth is loaded
                user ? ( // Show account button if logged in
                  <Button
                    onClick={() => setMobileView("account")}
                    className="w-full justify-start"
                  >
                    <User className="mr-1 h-4 w-4" />
                    Account
                  </Button>
                ) : ( // Show login button if not logged in
                  <Button
                    onClick={() => {
                      setShowSheetDialog(false);
                      router.push("/auth/login");
                    }}
                    className="w-full justify-start"
                  >
                    <User className="mr-1 h-4 w-4" />
                    Login
                  </Button>
                )
              ) : ( // Show a placeholder while loading to prevent hydration mismatch
                <div className="w-full justify-start p-2">Loading...</div>
              )}
              {shouldRenderConditionalUI && user && ( // Show cart button only for logged-in users after auth is loaded
                <Button
                  onClick={() => {
                    setShowSheetDialog(false);
                    router.push("/cart");
                  }}
                  className="w-full justify-start"
                >
                  <ShoppingBag className="mr-1 h-4 w-4" />
                  Cart ({items?.length || 0})
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <header className="sticky bg-white  top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link className="text-2xl font-bold" href="/">
            ECOMMERCE
          </Link>
          <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            <nav className="flex items-center space-x-8">
              {displayNavItems.map((item, index) => (
                <Link
                  href={item.to}
                  key={index}
                  className={`text-sm font-semibold hover:text-gray-700 ${!shouldRenderConditionalUI ? 'opacity-0 absolute' : ''}`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            {shouldRenderConditionalUI && user && ( // Show cart icon only for logged-in users after auth is loaded
              <div
                className="relative cursor-pointer"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  {items?.length}
                </span>
              </div>
            )}
            {shouldRenderConditionalUI ? ( // Show conditional UI after auth is loaded
              user ? ( // Show user menu if logged in
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant={"ghost"}>
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push("/account")}>
                      Your Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : ( // Show login button if not logged in
                <Button
                  onClick={() => router.push("/auth/login")}
                  variant="outline"
                  size="sm"
                >
                  Login
                </Button>
              )
            ) : ( // Show a placeholder while loading to prevent hydration mismatch
              <div className="w-16 h-10"></div> // Placeholder for the login button or user menu
            )}
          </div>
          <div className="lg:hidden">
            <Sheet
              open={showSheetDialog}
              onOpenChange={() => {
                setShowSheetDialog(false);
                setMobileView("menu");
              }}
            >
              <Button
                onClick={() => setShowSheetDialog(!showSheetDialog)}
                size="icon"
                variant="ghost"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>
                    {shouldRenderConditionalUI && user ? "Account" : "ECOMMERCE"}
                  </SheetTitle>
                </SheetHeader>
                {renderMobileMenuItems()}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
