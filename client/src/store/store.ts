import { create } from 'zustand';
import * as Api from '../services/Api';

interface AppState {
  user: Api.User | null;
  token: string | null;
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
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
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
  requestOtp: async (phone) => {
    set({ loading: true, error: null });
    try {
      await Api.api.requestOtp({ phone });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (phone, otp) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await Api.api.verifyOtp({ phone, otp });
      set({ token, user });
      localStorage.setItem('token', token);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },

  getMe: async (token) => {
    set({ loading: true, error: null });
    try {
      const user = await Api.api.getMe(token);
      set({ user });
    } catch (error: any) {
      set({ error: error.message });
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