

// --- Common Types ---

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface City {
  id: string;
  name: string;
}

export interface Bus {
  id: string;
  operator: string;
  bus_type: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  fare: number;
  available_seats: number;
  rating: number;
}

export interface Seat {
  id: string;
  seat_no: string;
  seat_type: string;
  price: number;
  is_available: boolean;
}

export interface Passenger {
  name: string;
  age: number;
  gender: string;
}

export interface Booking {
  booking_id: string;
  bus_id: string;
  operator?: string; // Optional as it is not in all booking responses
  date: string;
  seats: string[];
  status: 'CONFIRMED' | 'CANCELLED';
  total_amount: number;
  passenger_details?: Passenger[]; // Optional as it is not in all booking responses
  contact?: { phone: string; email: string }; // Optional
}

// --- API Request Types ---

export interface RequestOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface UpdateMeRequest {
  name: string;
  email: string;
}

export interface SearchBusesRequest {
  from_city_id: string;
  to_city_id: string;
  date?: string; // Make date optional as per API documentation
}

export interface BookRequest {
  bus_id: string;
  date: string;
  seats: string[];
  passenger_details: Passenger[];
  contact: { phone: string; email: string };
}

// --- API Response Types ---

export interface RequestOtpResponse {
  message: string;
  otp: string; // Mock only
}

export interface VerifyOtpResponse {
  token: string;
  user: User;
}

export interface GetMeResponse extends User {}

export interface UpdateMeResponse extends User {}

export interface GetCitiesResponse {
  cities: City[];
}

export interface SearchBusesResponse {
  buses: Bus[];
  message: string;
}

export interface GetBusSeatsResponse {
  bus_id: string;
  seats: Seat[];
}

export interface BookResponse {
  booking_id: string;
  bus_id: string;
  status: 'CONFIRMED' | 'CANCELLED';
  seats: string[];
  total_amount: number;
  date: string;  // Add the missing date field
}

export interface GetBookingsResponse {
  bookings: Booking[];
}

const API_BASE_URL = '/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API: Making request to:', url, 'with options:', options);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('API: Response status:', response.status);
    console.log('API: Response headers:', response.headers);

    if (!response.ok) {
      const error = await response.json();
      console.error('API: Error response:', error);
      throw new Error(error.message || 'Something went wrong');
    }

    const data = await response.json();
    console.log('API: Success response:', data);
    return data;
  }

  // --- Auth ---

  requestOtp(data: RequestOtpRequest): Promise<RequestOtpResponse> {
    return this.request('/login/request-otp', { method: 'POST', body: JSON.stringify(data) });
  }

  verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return this.request('/login/verify-otp', { method: 'POST', body: JSON.stringify(data) });
  }

  getMe(token: string): Promise<GetMeResponse> {
    return this.request('/me', { headers: { Authorization: `Bearer ${token}` } });
  }

  updateMe(token: string, data: UpdateMeRequest): Promise<UpdateMeResponse> {
    return this.request('/me', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  }

  // --- Bus Search & Booking ---

  getCities(): Promise<GetCitiesResponse> {
    return this.request('/cities');
  }

  searchBuses(data: SearchBusesRequest): Promise<SearchBusesResponse> {
    return this.request('/search-buses', { method: 'POST', body: JSON.stringify(data) });
  }

  getBusSeats(busId: string, travelDate?: string): Promise<GetBusSeatsResponse> {
    const url = travelDate 
      ? `/bus/${busId}/seats?travel_date=${travelDate}`
      : `/bus/${busId}/seats`;
    return this.request(url);
  }

  book(data: BookRequest, token?: string): Promise<BookResponse> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return this.request('/book', { method: 'POST', headers, body: JSON.stringify(data) });
  }

  // --- My Details Section ---

  getBookings(token: string): Promise<GetBookingsResponse> {
    return this.request('/bookings', { headers: { Authorization: `Bearer ${token}` } });
  }
}

export const api = new ApiService();
