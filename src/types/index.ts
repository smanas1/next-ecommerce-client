export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "SUPER_ADMIN";
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  gender: string;
  sizes: string[];
  colors: string[];
  price: number;
  stock: number;
  soldCount: number;
  rating: number | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
}