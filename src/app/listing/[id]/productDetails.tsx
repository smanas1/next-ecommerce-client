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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 flex gap-4">
            <div className="hidden lg:flex flex-col gap-2 w-24">
              {product?.images.map((image: string, index: number) => (
                <button
                  onClick={() => setSelectedImage(index)}
                  key={index}
                  className={`${
                    selectedImage === index
                      ? "border-black"
                      : "border-transparent"
                  } border-2`}
                >
                  <img
                    src={image}
                    alt={`Product-${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="flex-1 relative w-[300px]">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:w-1/3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div>
                <span className="text-2xl font-semibold">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color: string, index: number) => (
                  <button
                    key={index}
                    className={`w-12 h-12 rounded-full border-2 ${
                      selectedColor === index
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(index)}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size: string, index: string) => (
                  <Button
                    key={index}
                    className={`w-12 h-12`}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Quantity</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  variant="outline"
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  onClick={() => setQuantity(quantity + 1)}
                  variant="outline"
                >
                  +
                </Button>
              </div>
            </div>
            <div>
              <Button
                className={"w-full bg-black text-white hover:bg-gray-800"}
                onClick={handleAddToCart}
              >
                ADD TO CART
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-16">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="details">PRODUCT DESCRIPTION</TabsTrigger>
              <TabsTrigger value="reviews">REVIEWS</TabsTrigger>
              <TabsTrigger value="shipping">
                SHIPPING & RETURNS INFO
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-5">
              <p className="text-gray-700 mb-4">{product.description}</p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-5">
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
                        variant="outline"
                        className="mb-4"
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill={star <= reviewRating ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`lucide lucide-star ${star <= reviewRating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
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
                          className="w-full p-2 border rounded"
                          placeholder="Summarize your review..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Review</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full p-2 border rounded min-h-[100px]"
                          placeholder="Share your detailed thoughts about this product..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                          className="bg-black text-white hover:bg-gray-800"
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
                      <div key={review.id} className="border-b pb-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-lg">{review.title}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill={i < Math.floor(review.rating) ? "currentColor" : "none"}
                                    stroke={i < Math.floor(review.rating) ? "currentColor" : "currentColor"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`lucide lucide-star ${i < Math.floor(review.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                  >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
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
              <p className="text-gray-700 mb-4">
                Shipping and return information goes here.Please read the info
                before proceeding.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsContent;
