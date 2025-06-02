export interface RestaurantTag {
  id: string;
  label: string;
  isPrimary: boolean;
}

export interface RestaurantLocation {
  address: string;
  city: string;
  district?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface RestaurantWorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface RestaurantContact {
  phone: string;
  email?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    telegram?: string;
  };
}

export interface RestaurantFeatures {
  hasDelivery: boolean;
  hasReservation: boolean;
  hasWifi: boolean;
  hasParking: boolean;
  hasChildMenu: boolean;
  hasVeganOptions: boolean;
  hasAlcohol: boolean;
  acceptsCards: boolean;
  averagePrice: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  tags: RestaurantTag[];
  location: RestaurantLocation;
  workingHours: RestaurantWorkingHours;
  contact: RestaurantContact;
  features: RestaurantFeatures;
  cuisine: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isFavorite?: boolean;
}

export interface FilterChip {
  id: string;
  label: string;
  isSelected: boolean;
  type?: "cuisine" | "feature" | "price" | "district";
}
