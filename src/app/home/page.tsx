"use client";

import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect, useState } from "react";
import { StarIcon } from "lucide-react";

const gridItems = [
  {
    title: "WOMEN",
    subtitle: "From world's top designer",
    image:
      "https://images.unsplash.com/photo-1614251056216-f748f76cd228?q=80&w=1974&auto=format&fit=crop",
  },
  {
    title: "FALL LEGENDS",
    subtitle: "Timeless cool weather",
    image:
      "https://avon-demo.myshopify.com/cdn/shop/files/demo1-winter1_600x.png?v=1733380268",
  },
  {
    title: "ACCESSORIES",
    subtitle: "Everything you need",
    image:
      "https://avon-demo.myshopify.com/cdn/shop/files/demo1-winter4_600x.png?v=1733380275",
  },
  {
    title: "HOLIDAY SPARKLE EDIT",
    subtitle: "Party season ready",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1974&auto=format&fit=crop",
  },
];

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { banners, featuredProducts, fetchFeaturedProducts, fetchBanners } =
    useSettingsStore();

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
  }, [fetchBanners, fetchFeaturedProducts]);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(bannerTimer);
  }, [banners.length]);

  console.log(banners, featuredProducts);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner Section */}
      <section className="relative h-[700px] overflow-hidden">
        {banners.map((bannerItem, index) => (
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
            key={bannerItem.id}
          >
            <div className="absolute inset-0">
              <img
                src={bannerItem.imageUrl}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
            </div>
            <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
              <div className="text-white max-w-2xl space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/90 rounded-full mb-4">
                  <span className="text-sm uppercase tracking-wider font-medium">
                    Premium Collection
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  ELEVATE YOUR
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    STYLE
                  </span>
                </h1>
                <p className="text-lg text-gray-200">
                  Discover our curated collection of premium fashion items designed
                  to enhance your personal style and make you feel confident every day.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-lg rounded-full transform hover:scale-105 transition-all duration-300">
                    EXPLORE COLLECTION
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                    VIEW SHOWCASE
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gridItems.map((gridItem, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="aspect-[3/4]">
                  <img
                    src={gridItem.image}
                    alt={gridItem.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">{gridItem.title}</h3>
                    <p className="text-sm opacity-90">{gridItem.subtitle}</p>
                    <Button className="mt-4 bg-white text-black hover:bg-gray-100 rounded-full px-6 py-2 shadow-lg">
                      SHOP NOW
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">NEW ARRIVALS</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Check out our latest additions to the collection. Fresh styles for the modern lifestyle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((productItem, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={productItem.images[0]}
                    alt={productItem.name}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                    <span className="text-lg font-bold text-gray-800">${productItem.price}</span>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{productItem.rating || 4.5}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{productItem.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{productItem.description?.substring(0, 80)}...</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{productItem.category}</span>
                    <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2">
                      VIEW DETAILS
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            JOIN OUR FASHION COMMUNITY
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to our newsletter and get exclusive access to new collections,
            special offers, and style tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
            />
            <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold shadow-lg">
              SUBSCRIBE
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
