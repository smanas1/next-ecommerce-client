"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductStore } from "@/store/useProductStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@/types";
import { getProductReviews, createReview, canUserReviewProduct } from "@/actions/review";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Star, Heart, Share, Truck, RotateCcw, ShieldCheck, Minus, Plus, Check } from "lucide-react";
import Image from "next/image";

function ProductDetailsContent({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const { getProductById, isLoading } = useProductStore();
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Review form state
  const [canReview, setCanReview] = useState(false);
  const [checkingReviewEligibility, setCheckingReviewEligibility] = useState(true);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuthStore();
  const { getOrdersByUserId, userOrders } = useOrderStore();

  useEffect(() => {
    const fetchProduct = async () => {
      // Fetch product
      const productDetails = await getProductById(id);
      if (productDetails) {
        setProduct(productDetails);
      } else {
        router.push("/404");
        return;
      }
    };

    fetchProduct();
  }, [id, getProductById, router]);

  // Separate effect for fetching reviews to avoid dependency issues
  useEffect(() => {
    if (product?.id) {
      const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
          const reviewsResult = await getProductReviews(product.id);
          if (reviewsResult.success && reviewsResult.reviews) {
            setReviews(reviewsResult.reviews);
          } else {
            console.error("Failed to fetch reviews:", reviewsResult.message);
            setReviews([]);
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      };

      fetchReviews();
    }
  }, [product?.id]);

  // Effect to check review eligibility
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (user) {
        setCheckingReviewEligibility(true);
        // Fetch user orders to determine if they can review this product
        await getOrdersByUserId();
      }
      setCheckingReviewEligibility(false);
    };

    checkReviewEligibility();
  }, [id, user, getOrdersByUserId]);

  // Effect to update canReview based on user orders
  // We'll run this when user changes or after orders are fetched
  useEffect(() => {
    if (user) {
      // Check if user has any delivered orders that contain this product
      const canUserReview = userOrders.some(order =>
        order.status === "DELIVERED" &&
        order.items.some(item => item.productId === id)
      );

      setCanReview(canUserReview);
    } else {
      setCanReview(false);
    }
  }, [user, userOrders.length, id]); // Use userOrders.length instead of the array to avoid infinite loop

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please log in to add items to cart",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        color: product.colors[selectedColor],
        size: selectedSize,
        quantity: quantity,
      });

      setSelectedSize("");
      setSelectedColor(0);
      setQuantity(1);

      toast({
        title: "Product is added to cart",
      });
    }
  };

  console.log(id, product);

  if (!product || isLoading) return <ProductDetailsSkeleton />;


  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (!reviewTitle.trim()) {
      toast({
        title: "Please enter a review title",
        variant: "destructive",
      });
      return;
    }

    if (!reviewComment.trim()) {
      toast({
        title: "Please enter a review comment",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);

    // Find a delivered order that contains this product
    const eligibleOrder = userOrders.find(order =>
      order.status === "DELIVERED" &&
      order.items.some(item => item.productId === id)
    );

    if (!eligibleOrder) {
      toast({
        title: "You can only review products that you have purchased and received",
        variant: "destructive",
      });
      setSubmittingReview(false);
      return;
    }

    // Find the specific order item
    const orderItem = eligibleOrder.items.find(item => item.productId === id);

    if (!orderItem) {
      toast({
        title: "Could not find the ordered item",
        variant: "destructive",
      });
      setSubmittingReview(false);
      return;
    }

    const result = await createReview(
      id,
      eligibleOrder.id,
      reviewRating,
      reviewTitle,
      reviewComment
    );

    if (result.success) {
      toast({
        title: "Review submitted successfully!",
      });
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5); // Reset rating to default
      setReviewFormOpen(false);

      // Refresh the reviews list
      const reviewsResult = await getProductReviews(id);
      if (reviewsResult.success && reviewsResult.reviews) {
        setReviews(reviewsResult.reviews);
      }
    } else {
      toast({
        title: result.message || "Error submitting review",
        variant: "destructive",
      });
    }

    setSubmittingReview(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images Section */}
          <div className="lg:w-2/3">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Thumbnails - Hidden on mobile */}
              <div className="hidden lg:flex flex-col gap-2 w-24">
                {product?.images.map((image: string, index: number) => (
                  <button
                    onClick={() => setSelectedImage(index)}
                    key={index}
                    className={`rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Product-${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              {/* Main Image */}
              <div className="flex-1 bg-white rounded-2xl shadow-sm p-4">
                <div className="relative w-full aspect-square">
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
            
            {/* Mobile Thumbnails */}
            <div className="lg:hidden mt-4 flex gap-2 overflow-x-auto pb-2">
              {product?.images.map((image: string, index: number) => (
                <button
                  onClick={() => setSelectedImage(index)}
                  key={index}
                  className={`flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-indigo-500 ring-2 ring-indigo-200"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Product-${index + 1}`}
                    width={60}
                    height={60}
                    className="w-16 h-16 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Info Section */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating || 4) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.rating || 4} reviews)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50">
                    <Share className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-indigo-600 mb-4">
                ${product.price.toFixed(2)}
              </div>
              
              <p className="text-gray-600 mb-6">
                {product.description}
              </p>
              
              <div className="space-y-6">
                {/* Color Selection */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Color</h3>
                  <div className="flex gap-3">
                    {product.colors.map((color: string, index: number) => (
                      <button
                        key={index}
                        className={`w-10 h-10 rounded-full border-2 ${
                          selectedColor === index
                            ? "border-indigo-500 ring-2 ring-indigo-200"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(index)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Size Selection */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Size</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size: string, index: string) => (
                      <Button
                        key={index}
                        variant={selectedSize === size ? "default" : "outline"}
                        className={`h-10 ${
                          selectedSize === size ? "bg-indigo-600 text-white" : "bg-white"
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Quantity */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <Button
                  className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  onClick={handleAddToCart}
                >
                  ADD TO CART
                </Button>
                
                {/* Product Features */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Truck className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-xs text-gray-600">Free Shipping</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <RotateCcw className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-xs text-gray-600">30 Days Return</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <ShieldCheck className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-xs text-gray-600">1 Year Warranty</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm overflow-hidden">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-0">
              <TabsTrigger value="details" className="p-4 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none">
                Product Details
              </TabsTrigger>
              <TabsTrigger value="reviews" className="p-4 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none">
                Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="shipping" className="p-4 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-none">
                Shipping & Returns
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-6">
              <h3 className="font-semibold text-lg mb-4">Product Information</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Material</h4>
                  <p className="text-gray-600">Premium quality fabric</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Care Instructions</h4>
                  <p className="text-gray-600">Machine wash cold, tumble dry low</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Category</h4>
                  <p className="text-gray-600">{product.category}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">SKU</h4>
                  <p className="text-gray-600">#{product.id.substring(0, 8)}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
              <div className="space-y-6">
                {/* Review form */}
                {checkingReviewEligibility ? (
                  <div className="mb-6 text-center">
                    <p>Checking review eligibility...</p>
                  </div>
                ) : user && !reviewFormOpen && (
                  <div className="mb-6">
                    {canReview ? (
                      <Button
                        onClick={() => setReviewFormOpen(true)}
                        className="mb-4 bg-indigo-600 hover:bg-indigo-700"
                      >
                        Write a Review
                      </Button>
                    ) : (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                          {user ?
                            "You can only review this product after it has been delivered." :
                            "Please log in to submit a review."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {reviewFormOpen && user && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-4">Write Your Review</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Rating</label>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-6 h-6 ${star <= reviewRating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Review Title</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                          placeholder="Summarize your review..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Review</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full p-3 border rounded-lg min-h-[100px] focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                          placeholder="Share your detailed thoughts about this product..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                        <Button
                          onClick={() => {
                            setReviewFormOpen(false);
                            setReviewTitle("");
                            setReviewComment("");
                            setReviewRating(5);
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing reviews */}
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <p>Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-lg">{review.title}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(review.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-1">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{review.user.name || review.user.email}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No reviews yet for this product.</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Be the first to review this product!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="shipping">
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-4">Shipping & Returns</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Truck className="w-6 h-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Free Shipping</h4>
                      <p className="text-gray-600">Free standard shipping on all orders</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <RotateCcw className="w-6 h-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Easy Returns</h4>
                      <p className="text-gray-600">30-day return policy, free return shipping</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-6 h-6 text-indigo-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Secure Payment</h4>
                      <p className="text-gray-600">Your payment information is processed securely</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsContent;