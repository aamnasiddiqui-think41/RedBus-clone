import { create } from 'zustand';
import * as Api from '../services/Api';

interface AppState {
  user: Api.User | null;
  token: string | null;
  otp_id: string | null; // Add otp_id to state
  cities: Api.City[];
  buses: Api.Bus[];
  selectedBus: Api.Bus | null;
  seats: Api.Seat[];
  booking: Api.BookResponse | null;  // Changed from Api.Booking to Api.BookResponse
  myBookings: Api.Booking[];
  loading: boolean;
  error: string | null;
  searchParams: { from: string; to: string; date: string } | null;
  searchMessage: string | null;  // Add this for bus search messages

  // Auth
  requestOtp: (country_code: string, phone: string) => Promise<void>; // Update signature
  verifyOtp: (otp: string) => Promise<void>; // Update signature
  logout: () => void;
  getMe: (token: string) => Promise<void>;
  updateMe: (token: string, data: Api.UpdateMeRequest) => Promise<void>;

  // Data fetching
  fetchCities: () => Promise<void>;
  searchBuses: (data: Api.SearchBusesRequest) => Promise<void>;
  fetchBusSeats: (busId: string, travelDate?: string) => Promise<void>;
  fetchBookings: () => Promise<void>;

  // Booking process
  selectBus: (bus: Api.Bus) => void;
  createBooking: (data: Api.BookRequest) => Promise<void>;
  setSearchParams: (params: { from: string; to: string; date: string }) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  otp_id: null, // Initialize otp_id
  cities: [],
  buses: [],
  selectedBus: null,
  seats: [],
  booking: null,
  myBookings: [],
  loading: false,
  error: null,
  searchParams: null,
  searchMessage: null,

  // --- ACTIONS ---

  // Auth
  requestOtp: async (country_code, phone) => {
    set({ loading: true, error: null });
    try {
      const { otp_id } = await Api.api.requestOtp({ country_code, phone });
      set({ otp_id });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (otp) => {
    const otp_id = get().otp_id;
    if (!otp_id) {
      set({ error: "OTP not requested" });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { token, user } = await Api.api.verifyOtp({ otp_id, otp });
      set({ token, user, otp_id: null }); // Clear otp_id after verification
      localStorage.setItem('token', token);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ user: null, token: null, otp_id: null });
    localStorage.removeItem('token');
  },

  getMe: async (token) => {
    set({ loading: true, error: null });
    try {
      const user = await Api.api.getMe(token);
      set({ user });
    } catch (error: any) {
      set({ error: error.message, token: null }); // Clear token on auth error
      localStorage.removeItem('token');
    } finally {
      set({ loading: false });
    }
  },

  updateMe: async (token, data) => {
    set({ loading: true, error: null });
    try {
      const user = await Api.api.updateMe(token, data);
      set({ user });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Data fetching
  fetchCities: async () => {
    set({ loading: true, error: null });
    try {
      const { cities } = await Api.api.getCities();
      set({ cities });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  searchBuses: async (data) => {
    set({ loading: true, error: null });
    try {
      console.log('Store: Searching buses with data:', data);
      const { buses, message } = await Api.api.searchBuses(data);
      console.log('Store: Buses found:', buses);
      set({ buses, searchMessage: message });
    } catch (error: any) {
      console.error('Store: Error searching buses:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchBusSeats: async (busId: string, travelDate?: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Store: Fetching bus seats for bus:', busId, 'date:', travelDate);
      const response = await Api.api.getBusSeats(busId, travelDate);
      console.log('Store: Bus seats response:', response);
      
      if (response && response.seats) {
        console.log('Store: Setting seats in store:', response.seats);
        console.log('Store: Number of seats:', response.seats.length);
        console.log('Store: First seat sample:', response.seats[0]);
        set({ seats: response.seats });
        
        // Verify the seats were set
        setTimeout(() => {
          const currentState = get();
          console.log('Store: Current seats after set:', currentState.seats);
          console.log('Store: Current seats length:', currentState.seats.length);
        }, 100);
      } else {
        console.error('Store: Invalid response format:', response);
        set({ seats: [], error: 'Invalid response format from server' });
      }
    } catch (error: any) {
      console.error('Store: Error fetching bus seats:', error);
      set({ error: error.message, seats: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchBookings: async () => {
    const token = get().token;
    const user = get().user;
    
    console.log('=== STORE: fetchBookings called ===');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('User ID:', user?.id);
    
    if (!token) {
      console.log('No token available, cannot fetch bookings');
      return;
    }
    
    if (!user) {
      console.log('No user available, cannot fetch bookings');
      return;
    }
    
    set({ loading: true, error: null });
    try {
      console.log('Calling API to fetch bookings for user:', user.id);
      const { bookings } = await Api.api.getBookings(token);
      console.log('Bookings received from API:', bookings);
      set({ myBookings: bookings });
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Booking process
  selectBus: (bus) => {
    set({ selectedBus: bus }); // Don't reset seats - let SeatLayout fetch them
  },

  createBooking: async (data) => {
    const token = get().token;
    set({ loading: true, error: null });
    try {
      const booking = await Api.api.book(data, token || undefined);
      set({ booking });
      
      // After successful booking, refresh the bookings list
      if (token) {
        const { bookings } = await Api.api.getBookings(token);
        set({ myBookings: bookings });
      }
      
      // Refresh seat availability to show newly booked seats as unavailable
      if (data.bus_id && data.travel_date) {
        console.log('=== STORE: Refreshing seats after booking ===');
        await get().fetchBusSeats(data.bus_id, data.travel_date);
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  setSearchParams: (params) => {
    set({ searchParams: params });
  },
}));

// Auto-fetch user if token exists
const token = localStorage.getItem('token');
if (token) {
  useStore.getState().getMe(token);
}