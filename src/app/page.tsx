"use client";

import { Button } from "@/components/ui/button";
import { StarIcon, HeartIcon, ArrowRightIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// Define types
type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  rating?: number;
};

type Banner = {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
};

// Define grid items for categories section - these are static for the homepage
const gridItems = [
  {
    title: "WOMEN",
    subtitle: "From world's top designers",
    image:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=2070&auto=format&fit=crop",
  },
  {
    title: "MEN",
    subtitle: "Modern styles for everyone",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1974&auto=format&fit=crop",
  },
  {
    title: "ACCESSORIES",
    subtitle: "Everything you need",
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1974&auto=format&fit=crop",
  },
  {
    title: "HOLIDAY SPARKLE EDIT",
    subtitle: "Party season ready",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1974&auto=format&fit=crop",
  },
];

// Define mock featured products as a constant so it's available to all sections
const mockFeaturedProducts: Product[] = [
  {
    id: "1",
    name: "Designer Leather Jacket",
    price: 249.99,
    description: "Premium leather jacket crafted with sustainable materials",
    category: "Outerwear",
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1974&auto=format&fit=crop"],
    rating: 4.8
  },
  {
    id: "2",
    name: "Silk Evening Dress",
    price: 189.99,
    description: "Elegant silk dress perfect for special occasions",
    category: "Dresses",
    images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop"],
    rating: 4.9
  },
  {
    id: "3",
    name: "Sustainable Sneakers",
    price: 89.99,
    description: "Comfortable sneakers made from recycled materials",
    category: "Footwear",
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2070&auto=format&fit=crop"],
    rating: 4.7
  },
  {
    id: "4",
    name: "Designer Handbag",
    price: 349.99,
    description: "Luxury handbag with premium leather finish",
    category: "Accessories",
    images: ["https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?q=80&w=2070&auto=format&fit=crop"],
    rating: 4.6
  }
];

// Function to fetch data from the API with proper error handling
async function fetchBanners(): Promise<Banner[]> {
  try {
    // Try to fetch actual banners from the server API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/settings/get-banners`, {
      cache: 'no-store', // This ensures fresh data on each request
      credentials: 'include' // Include authentication cookies if available
    });

    if (!response.ok) {
      console.error('Failed to fetch banners:', response.status);
      // Return fallback banners if API call fails
      return [
        {
          id: "1",
          imageUrl: "https://images.unsplash.com/photo-1603076564521-360ea6c78ada?q=80&w=2074&auto=format&fit=crop",
          title: "Premium Collection",
          subtitle: "New Season Arrivals"
        },
        {
          id: "2",
          imageUrl: "https://images.unsplash.com/photo-1520509454706-f3b657c4b39b?q=80&w=2070&auto=format&fit=crop",
          title: "Summer Essentials",
          subtitle: "Limited Time Offers"
        },
        {
          id: "3",
          imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
          title: "Luxury Goods",
          subtitle: "Exclusive Designer Items"
        }
      ];
    }

    const data = await response.json();
    const banners = data.banners || [];

    // If no banners are returned from the API, use fallback images
    if (!banners || banners.length === 0) {
      return [
        {
          id: "1",
          imageUrl: "https://images.unsplash.com/photo-1603076564521-360ea6c78ada?q=80&w=2074&auto=format&fit=crop",
          title: "Premium Collection",
          subtitle: "New Season Arrivals"
        },
        {
          id: "2",
          imageUrl: "https://images.unsplash.com/photo-1520509454706-f3b657c4b39b?q=80&w=2070&auto=format&fit=crop",
          title: "Summer Essentials",
          subtitle: "Limited Time Offers"
        },
        {
          id: "3",
          imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
          title: "Luxury Goods",
          subtitle: "Exclusive Designer Items"
        }
      ];
    }

    // Map the API response to Banner objects
    return banners.map((banner: any) => ({
      id: banner.id,
      imageUrl: banner.imageUrl,
      title: banner.title || "Featured Collection",
      subtitle: banner.subtitle || "New Arrivals"
    }));
  } catch (error) {
    console.error('Error fetching banners:', error);
    // Return fallback banners if there's a network error
    return [
      {
        id: "1",
        imageUrl: "https://images.unsplash.com/photo-1603076564521-360ea6c78ada?q=80&w=2074&auto=format&fit=crop",
        title: "Premium Collection",
        subtitle: "New Season Arrivals"
      },
      {
        id: "2",
        imageUrl: "https://images.unsplash.com/photo-1520509454706-f3b657c4b39b?q=80&w=2070&auto=format&fit=crop",
        title: "Summer Essentials",
        subtitle: "Limited Time Offers"
      },
      {
        id: "3",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        title: "Luxury Goods",
        subtitle: "Exclusive Designer Items"
      }
    ];
  }
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    // Since API endpoints require authentication, we'll use fallback products for public access
    // In a production app, you would want public endpoints for the homepage

    // Try to fetch actual featured products from the server API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/settings/fetch-feature-products`, {
      cache: 'no-store', // This ensures fresh data on each request
      credentials: 'include' // Include authentication cookies if available
    });

    if (!response.ok) {
      console.error('Failed to fetch featured products:', response.status);
      // Return fallback products if API call fails
      return [...mockFeaturedProducts];
    }

    const data = await response.json();
    const featuredProducts = data.featuredProducts || [];

    // If no featured products are returned from the API, use fallback products
    if (!featuredProducts || featuredProducts.length === 0) {
      return [...mockFeaturedProducts];
    }

    // Map the API response to Product objects
    return featuredProducts.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      images: product.images || [],
      rating: product.rating
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // Return fallback products if there's a network error
    return [...mockFeaturedProducts];
  }
}

function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [bannersData, featuredProductsData] = await Promise.all([
          fetchBanners(),
          fetchFeaturedProducts()
        ]);

        setBanners(bannersData);
        setFeaturedProducts(featuredProductsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate banner and progress bar
  useEffect(() => {
    if (banners.length <= 1) return; // Don't auto-rotate if there's only one banner

    // Reset progress when slide changes
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next slide when progress completes
          setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
          return 0; // Reset progress
        }
        return prev + 2; // Increment by 2 every 100ms to reach 100 in 5000ms
      });
    }, 100); // Update every 100ms

    return () => clearInterval(progressInterval);
  }, [currentIndex, banners.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setProgress(0); // Reset progress when manually navigating
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % banners.length;
    setCurrentIndex(newIndex);
    setProgress(0); // Reset progress when manually navigating
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0); // Reset progress when manually navigating
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner Section with Modern Slider */}
      <section className="relative min-h-[80vh] overflow-hidden">
        {banners.map((bannerItem, index) => (
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            key={bannerItem.id}
          >
            <div className="absolute inset-0">
              <Image
                src={bannerItem.imageUrl}
                alt={`Banner ${index + 1}`}
                fill
                className="w-full h-full object-cover object-center"
                priority={index === currentIndex}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
            </div>
            <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
              <div className="text-white max-w-2xl space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-primary/90 rounded-full mb-4">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm uppercase tracking-wider font-medium">
                    {bannerItem.title}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  ELEVATE YOUR
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    STYLE
                  </span>
                </h1>
                <p className="text-lg text-gray-200">
                  {bannerItem.subtitle}. Discover our curated collection of premium fashion items designed
                  to enhance your personal style and make you feel confident every day.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/listing">
                    <Button
                      className="group relative px-8 py-5 text-lg font-bold rounded-full overflow-hidden bg-white text-black transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                      size="lg"
                    >
                      <span className="relative z-10 flex items-center">
                        EXPLORE COLLECTION
                        <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </Link>
                  <Link href="/listing">
                    <Button
                      variant="outline"
                      className="group relative px-8 py-5 text-lg font-bold rounded-full overflow-hidden border-2 border-white text-white bg-transparent transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                      size="lg"
                    >
                      <span className="relative z-10">VIEW SHOWCASE</span>
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Slider Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-10">
          {/* Previous Button */}
          <button
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
            onClick={goToPrevious}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Indicators */}
          <div className="flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
            onClick={goToNext}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Slider Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-600"
            style={{
              width: `${progress}%`,
            }}
          ></div>
        </div>
      </section>

      {/* Trusted Brands Banner */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {['VERSACE', 'GUCCI', 'PRADA', 'CHANEL', 'DIOR', 'HERMES'].map((brand, i) => (
              <div key={i} className="text-2xl font-bold text-gray-800">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">CURATED COLLECTIONS</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore our carefully selected collections to find the perfect pieces that reflect your unique style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gridItems.map((gridItem, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 aspect-[3/4]"
              >
                <Image
                  src={gridItem.image}
                  alt={gridItem.title}
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">{gridItem.title}</h3>
                    <p className="text-sm opacity-90">{gridItem.subtitle}</p>
                    <Link href="/listing">
                      <Button
                        className="mt-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full px-6 py-2 shadow-lg border border-white/30"
                        variant="outline"
                      >
                        SHOP NOW
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">NEW ARRIVALS</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Check out our latest additions to the collection. Fresh styles for the modern lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((productItem, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3"
              >
                <div className="relative group">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={productItem.images[0]}
                      alt={productItem.name}
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md border-0"
                    >
                      <HeartIcon className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{productItem.rating || 4.5}</span>
                  </div>

                  {/* Quick actions overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="rounded-full bg-white text-black hover:bg-gray-100"
                      >
                        ADD TO CART
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white/30"
                      >
                        QUICK VIEW
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{productItem.name}</h3>
                      <span className="text-sm text-gray-500">{productItem.category}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">${productItem.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-3 mb-4">{productItem.description.substring(0, 80)}...</p>
                  <div className="flex justify-between items-center">
                    <Link href="/listing">
                      <Button
                        className="bg-black text-white hover:bg-gray-800 rounded-full px-4 py-2 text-sm"
                        size="sm"
                      >
                        VIEW DETAILS
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/listing">
              <Button variant="outline" className="rounded-full px-8 py-6 text-lg font-medium">
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">TRENDING NOW</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Discover what's hot in the fashion world right now. These items are flying off our virtual shelves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockFeaturedProducts.slice(0, 4).map((productItem, index) => (
              <div
                key={`trending-${index}`}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3"
              >
                <div className="relative group">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={productItem.images[0]}
                      alt={productItem.name}
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md border-0"
                    >
                      <HeartIcon className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center bg-red-500 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                    <span className="text-xs text-white font-medium">TRENDING</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{productItem.name}</h3>
                      <span className="text-sm text-gray-500">{productItem.category}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">${productItem.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-3 mb-4">{productItem.description.substring(0, 80)}...</p>
                  <div className="flex justify-between items-center">
                    <Link href="/listing">
                      <Button
                        className="bg-black text-white hover:bg-gray-800 rounded-full px-4 py-2 text-sm"
                        size="sm"
                      >
                        VIEW DETAILS
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">WHAT OUR CUSTOMERS SAY</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Don't just take our word for it. Here's what our valued customers have to say about their shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Fashion Enthusiast",
                content: "The quality of the products exceeded my expectations. Fast shipping and excellent customer service made this a perfect shopping experience!",
                rating: 5,
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop"
              },
              {
                name: "Michael Chen",
                role: "Style Blogger",
                content: "I've tried several online retailers, but this store stands out for their quality and selection. The customer service team is outstanding!",
                rating: 5,
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop"
              },
              {
                name: "Emma Rodriguez",
                role: "Lifestyle Influencer",
                content: "The fit and finish of their garments are top-notch. I've recommended this store to all my followers and friends.",
                rating: 5,
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1887&auto=format&fit=crop"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover border-2 border-white"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive Offers Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">EXCLUSIVE OFFERS</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Special deals for our newsletter subscribers. Join now to get access to limited-time discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "SUMMER SALE",
                discount: "UP TO 50% OFF",
                description: "Selected items with massive discounts",
                image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1974&auto=format&fit=crop"
              },
              {
                title: "WELCOME GIFT",
                discount: "15% OFF",
                description: "Special discount for new subscribers",
                image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1974&auto=format&fit=crop"
              },
              {
                title: "MEMBER EXCLUSIVE",
                discount: "FREE SHIPPING",
                description: "On orders over $100 for premium members",
                image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1974&auto=format&fit=crop"
              }
            ].map((offer, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="aspect-[4/3] relative">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-bold">{offer.title}</h3>
                    <p className="text-3xl font-bold text-yellow-300 my-2">{offer.discount}</p>
                    <p className="text-white/90">{offer.description}</p>
                    <Button className="mt-4 bg-white text-purple-600 hover:bg-gray-100 rounded-full px-6 py-2 shadow-lg">
                      CLAIM OFFER
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '1M+', label: 'Items Sold' },
              { number: '500+', label: 'Premium Products' },
              { number: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-soft-light filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-soft-light filter blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              JOIN OUR FASHION <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">COMMUNITY</span>
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Subscribe to our newsletter and be the first to get exclusive access to new collections,
              special offers, style tips and member-only benefits.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto items-center justify-center">
            <div className="relative flex-1 min-w-[300px]">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-6 py-4 pl-14 rounded-full border-0 focus:ring-4 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-purple-600 bg-white/90 text-gray-800 shadow-lg"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 absolute left-5 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <Button className="bg-gradient-to-r from-white to-gray-100 text-purple-700 hover:from-gray-100 hover:to-white px-8 py-4 rounded-full font-semibold shadow-xl h-full transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center">
                SUBSCRIBE NOW
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Exclusive offers
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Early access to sales
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Style inspiration
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;