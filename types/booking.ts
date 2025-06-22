export interface Booking {
  id: string;
  restaurantId: string;
  restaurantName: string;
  date: string; // ISO string
  time: string; // Format: "19:00"
  guests: number;
  status: "confirmed" | "pending" | "cancelled";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  comment?: string;
  isPaid?: boolean; // Payment status
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
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
