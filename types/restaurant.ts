export interface RestaurantTag {
  id: string;
  label: string;
  isPrimary?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  tags: RestaurantTag[];
  description?: string;
  deliveryTime?: string;
  priceRange?: "low" | "medium" | "high";
}

export interface FilterChip {
  id: string;
  label: string;
  isSelected?: boolean;
  category?: string;
}
