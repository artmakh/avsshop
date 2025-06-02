export interface Product {
  id: number;
  name: string;
  short_description: string;
  long_description: string;
  price: number;
  stock: number;
  seller_id: number;
  seller_name?: string;
  category: string | null;
  primary_image?: string;
  status: 'available' | 'sold';
  buyer_id: number | null;
  listing_type: 'fixed' | 'auction';
  starting_price: number | null;
  current_bid: number | null;
  auction_end: string | null;
  min_bid_step: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: number;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  is_admin?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface Purchase {
  id: number;
  product_id: number;
  buyer_id: number;
  buyer_contact: string;
  contact_type: 'telegram' | 'slack';
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  data?: string;
  is_read: number;
  created_at: string;
}

export interface Bid {
  id: number;
  product_id: number;
  bidder_id: number;
  bidder_name?: string;
  amount: number;
  created_at: string;
}