"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAllReviews, adminUpdateReview, adminDeleteReview } from "@/actions/review";
import { useAuthStore } from "@/store/useAuthStore";
import { Review } from "@/types";
import { useEffect, useState } from "react";
import StarRating from "@/components/rating/StarRating";

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const result = await getAllReviews();
      if (result.success && result.reviews) {
        setReviews(result.reviews);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch reviews",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      const result = await adminUpdateReview(
        editingReview.id,
        editingReview.rating,
        editingReview.title,
        editingReview.comment
      );

      if (result.success) {
        toast({
          title: "Success",
          description: "Review updated successfully",
        });
        setEditingReview(null);
        fetchReviews(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update review",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the review",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this review?");
    if (!confirmed) return;

    try {
      const result = await adminDeleteReview(reviewId);

      if (result.success) {
        toast({
          title: "Success",
          description: "Review deleted successfully",
        });
        fetchReviews(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete review",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the review",
        variant: "destructive",
      });
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-red-500">Access denied. Super admin only.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Reviews Management</CardTitle>
            <div className="flex space-x-4">
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.product.name}</TableCell>
                      <TableCell>{review.user.name || review.user.email}</TableCell>
                      <TableCell>
                        <StarRating rating={review.rating} readonly size={16} />
                      </TableCell>
                      <TableCell>{review.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                      <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingReview(review)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Review Dialog */}
      {editingReview && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Product</Label>
                  <Input
                    value={editingReview.product.name}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>User</Label>
                  <Input
                    value={editingReview.user.name || editingReview.user.email}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <Label>Rating</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={editingReview.rating.toString()}
                    onValueChange={(value) => 
                      setEditingReview({
                        ...editingReview,
                        rating: parseInt(value)
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Title</Label>
                <Input
                  value={editingReview.title}
                  onChange={(e) => 
                    setEditingReview({
                      ...editingReview,
                      title: e.target.value
                    })
                  }
                />
              </div>
              
              <div>
                <Label>Comment</Label>
                <Textarea
                  value={editingReview.comment}
                  onChange={(e) => 
                    setEditingReview({
                      ...editingReview,
                      comment: e.target.value
                    })
                  }
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleUpdateReview}>
                  Update Review
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingReview(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminReviewsPage;