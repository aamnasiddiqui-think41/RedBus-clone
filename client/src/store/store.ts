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
  booking: Api.Booking | null;
  myBookings: Api.Booking[];
  loading: boolean;
  error: string | null;
  searchParams: { from: string; to: string; date: string } | null;

  // Auth
  requestOtp: (country_code: string, phone: string) => Promise<void>; // Update signature
  verifyOtp: (otp: string) => Promise<void>; // Update signature
  logout: () => void;
  getMe: (token: string) => Promise<void>;
  updateMe: (token: string, data: Api.UpdateMeRequest) => Promise<void>;

  // Data fetching
  fetchCities: () => Promise<void>;
  searchBuses: (data: Api.SearchBusesRequest) => Promise<void>;
  fetchBusSeats: (busId: string) => Promise<void>;
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
      const { buses } = await Api.api.searchBuses(data);
      set({ buses });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchBusSeats: async (busId) => {
    set({ loading: true, error: null });
    try {
      const { seats } = await Api.api.getBusSeats(busId);
      set({ seats });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchBookings: async () => {
    const token = get().token;
    if (!token) return;
    set({ loading: true, error: null });
    try {
      const { bookings } = await Api.api.getBookings(token);
      set({ myBookings: bookings });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Booking process
  selectBus: (bus) => {
    set({ selectedBus: bus, seats: [] }); // Reset seats when selecting a new bus
  },

  createBooking: async (data) => {
    const token = get().token;
    set({ loading: true, error: null });
    try {
      const booking = await Api.api.book(data, token || undefined);
      set({ booking });
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