import { Review } from '@/types';
import { API_ROUTES } from '@/utils/api';
import axios from 'axios';

/**
 * Submit a new review for a product
 */
export const createReview = async (
  productId: string,
  orderId: string,
  rating: number,
  title: string,
  comment: string
): Promise<{ success: boolean; message: string; review?: Review }> => {
  try {
    const response = await axios.post(
      `${API_ROUTES.REVIEWS}/create`,
      {
        productId,
        orderId,
        rating,
        title,
        comment,
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'An error occurred while submitting the review',
      };
    }
    return {
      success: false,
      message: 'An error occurred while submitting the review',
    };
  }
};

/**
 * Get all reviews for a specific product
 */
export const getProductReviews = async (
  productId: string
): Promise<{ success: boolean; message?: string; reviews?: Review[] }> => {
  try {
    const response = await axios.get(`${API_ROUTES.REVIEWS}/product/${productId}`, {
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'An error occurred while fetching reviews',
      };
    }
    return {
      success: false,
      message: 'An error occurred while fetching reviews',
    };
  }
};

/**
 * Get all reviews by current user
 */
export const getUserReviews = async (): Promise<{ success: boolean; message?: string; reviews?: Review[] }> => {
  try {
    const response = await axios.get(`${API_ROUTES.REVIEWS}/user`, {
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'An error occurred while fetching reviews',
      };
    }
    return {
      success: false,
      message: 'An error occurred while fetching reviews',
    };
  }
};

/**
 * Update an existing review
 */
export const updateReview = async (
  reviewId: string,
  rating?: number,
  title?: string,
  comment?: string
): Promise<{ success: boolean; message: string; review?: Review }> => {
  try {
    const response = await axios.put(
      `${API_ROUTES.REVIEWS}/${reviewId}`,
      {
        rating,
        title,
        comment,
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'An error occurred while updating the review',
      };
    }
    return {
      success: false,
      message: 'An error occurred while updating the review',
    };
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (
  reviewId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`${API_ROUTES.REVIEWS}/${reviewId}`, {
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'An error occurred while deleting the review',
      };
    }
    return {
      success: false,
      message: 'An error occurred while deleting the review',
    };
  }
};

/**
 * Check if user can review a specific product from a specific order
 */
export const canUserReviewProduct = async (
  productId: string,
  orderId: string
): Promise<{ success: boolean; canReview: boolean; message: string }> => {
  try {
    const response = await axios.get(`${API_ROUTES.REVIEWS}/can-review/${productId}/${orderId}`, {
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error('Error checking if user can review product:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        canReview: false,
        message: error.response?.data?.message || error.message || 'An error occurred while checking if you can review the product',
      };
    }
    return {
      success: false,
      canReview: false,
      message: 'An error occurred while checking if you can review the product',
    };
  }
};