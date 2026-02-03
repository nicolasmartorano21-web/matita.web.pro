
export enum Category {
  ESCOLAR = 'Escolar',
  OFICINA = 'Oficina',
  TECNICA = 'Técnica',
  MERCERIA = 'Mercería',
  JUGUETERIA = 'Juguetería',
  REGALERIA = 'Regalería'
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  location?: string;
}

export interface Coupon {
  code: string;
  discount: number;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  itemsCount: number;
  itemsDetail: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  curatorNote?: string;
  price: number;
  oldPrice?: number;
  category: Category;
  imageUrl: string;
  gallery?: string[];
  isVideo?: boolean;
  isNew?: boolean;
  reviews: Review[];
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  avatar?: string;
  level?: 'Bronce' | 'Plata' | 'Oro';
}

export type ViewType = 'catalog' | 'news' | 'about' | 'reviews' | 'suggestions' | 'club' | 'favorites';
