export interface Booking {
  id: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
  };
  user_name: string;
  guest_name: string | null;
  booking_date: string; // YYYY-MM-DD format
  booking_time: string; // HH:MM:SS format
  number_of_guests: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  created_at: string;
  // Legacy fields for backward compatibility
  restaurantId?: string;
  restaurantName?: string;
  date?: string;
  time?: string;
  guests?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  comment?: string;
  isPaid?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingRequest {
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  customerName: string;
  customerPhone: string;
  comment?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  maxGuests?: number;
}

export interface AvailableDate {
  date: string;
  label: string;
  timeSlots: TimeSlot[];
}
