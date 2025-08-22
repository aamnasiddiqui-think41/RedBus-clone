import { create } from 'zustand';
import * as Api from '../services/Api';

interface AppState {
  user: Api.User | null;
  userProfile: Api.UserProfile | null;
  token: string | null;
  otp_id: string | null; // Add otp_id to state
  cities: Api.City[];
  buses: Api.Bus[];
  selectedBus: Api.Bus | null;
  seats: Api.Seat[];
  selectedSeats: string[]; // Add selectedSeats state
  booking: Api.BookResponse | null;  // Changed from Api.Booking to Api.BookResponse
  myBookings: Api.Booking[];
  loading: boolean;
  isInitializing: boolean; // Separate state for auth initialization
  error: string | null;
  searchParams: { from: string; to: string; date: string } | null;
  searchMessage: string | null;  // Add this for bus search messages

  // Auth
  requestOtp: (country_code: string, phone: string) => Promise<void>; // Update signature
  verifyOtp: (otp: string) => Promise<void>; // Update signature
  logout: () => void;
  getMe: (token: string) => Promise<void>;
  getMyProfile: (token: string) => Promise<void>;
  updateMe: (token: string, data: Api.UpdateMeRequest) => Promise<void>;
  initializeAuth: () => Promise<void>; // Add this to restore session on startup

  // Data fetching
  fetchCities: () => Promise<void>;
  searchBuses: (data: Api.SearchBusesRequest) => Promise<void>;
  fetchBusSeats: (busId: string, travelDate?: string) => Promise<void>;
  fetchBookings: () => Promise<void>;

  // Booking process
  selectBus: (bus: Api.Bus) => void;
  createBooking: (data: Api.BookRequest) => Promise<void>;
  setSearchParams: (params: { from: string; to: string; date: string }) => void;
  selectSeat: (seatId: string) => void; // Add seat selection function
  clearSelectedSeats: () => void; // Add function to clear selected seats
  resetBookingState: () => void; // Add function to reset entire booking state
  startNewBookingSession: (bus: Api.Bus) => void; // Add function to start new booking session
  refreshSeatData: (busId: string, travelDate?: string) => Promise<void>; // Add function to refresh seat data

  // Debug function to check token status
  debugTokenStatus: () => void;
  resetLoadingState: () => void; // Add this to manually reset loading state
  checkBackendHealth: () => Promise<boolean>; // Add this to the interface
  testTokenStorage: () => boolean; // Add this to the interface
  syncTokenWithLocalStorage: () => void; // Add this to the interface
}

// Helper function to track token changes
const logTokenChange = (action: string, token: string | null) => {
  console.log(`🔐 TOKEN ${action}:`, token ? `${token.substring(0, 20)}...` : 'null');
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  userProfile: null,
  token: localStorage.getItem('token'),
  otp_id: null, // Initialize otp_id
  cities: [],
  buses: [],
  selectedBus: null,
  seats: [],
  selectedSeats: [], // Initialize selectedSeats
  booking: null,
  myBookings: [],
  loading: false,
  isInitializing: true, // Start with true to show we're initializing
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
    console.log('=== STORE: verifyOtp called ===');
    const otp_id = get().otp_id;
    console.log('OTP ID from store:', otp_id);
    
    if (!otp_id) {
      console.log('No OTP ID found, setting error');
      set({ error: "OTP not requested" });
      return;
    }
    
    set({ loading: true, error: null });
    try {
      console.log('Calling API to verify OTP...');
      const { token, user } = await Api.api.verifyOtp({ otp_id, otp });
      console.log('API response received:', { token: token ? 'Present' : 'Missing', user: user ? 'Present' : 'Missing' });
      
      if (token) {
        console.log('Token received, storing in localStorage and state');
        logTokenChange('STORING', token);
        
        // Store in localStorage FIRST
        localStorage.setItem('token', token);
        console.log('Token stored in localStorage');
        
        // Verify it was stored
        const storedToken = localStorage.getItem('token');
        console.log('Verification - localStorage now contains:', storedToken ? 'Token' : 'Nothing');
        
        // Then update store state
        set({ token, user, otp_id: null }); // Clear otp_id after verification
        console.log('Token stored successfully in store state');
        
        // Ensure tokens are in sync
        setTimeout(() => {
          get().syncTokenWithLocalStorage();
        }, 50);
        
        // Debug: Verify token was stored correctly
        setTimeout(() => {
          get().debugTokenStatus();
        }, 100);
      } else {
        console.log('No token received from API');
        set({ error: "No token received from server" });
      }
    } catch (error: any) {
      console.log('Error during OTP verification:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    const currentToken = get().token;
    logTokenChange('CLEARING (logout)', currentToken);
    set({ user: null, token: null, otp_id: null });
    localStorage.removeItem('token');
  },

  getMe: async (token) => {
    console.log('=== STORE: getMe called ===');
    console.log('Token received:', token ? token.substring(0, 20) + '...' : 'No token');
    
    set({ loading: true, error: null });
    try {
      console.log('Calling API to fetch user data...');
      const user = await Api.api.getMe(token);
      console.log('User data received:', user);
      console.log('Setting user and token in store...');
      set({ user, token }); // Set both user and token
      console.log('User and token set successfully');
    } catch (error: any) {
      console.log('getMe failed:', error.message);
      console.error('Error details:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('Not authenticated') || 
          error.message.includes('401') || 
          error.message.includes('403') || 
          error.message.includes('Unauthorized')) {
        console.log('Authentication error detected, automatically clearing invalid token');
        logTokenChange('CLEARING (auth error)', token);
        
        // Automatically clear invalid token and redirect to login
        set({ error: null, token: null, user: null });
        localStorage.removeItem('token');
        
        // Redirect to login after a short delay to allow state update
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      } else {
        // Network or server errors - keep the token but show the error
        set({ error: error.message });
      }
    } finally {
      console.log('Setting loading to false...');
      set({ loading: false });
      console.log('Loading state set to false');
    }
  },

  getMyProfile: async (token) => {
    console.log('=== STORE: getMyProfile called ===');
    console.log('Token received:', token ? token.substring(0, 20) + '...' : 'No token');
    console.log('Current loading state:', get().loading);
    
    console.log('Setting loading to true...');
    set({ loading: true, error: null });
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('=== STORE: getMyProfile timeout reached ===');
      set({ loading: false, error: 'Request timeout - please try again' });
    }, 10000); // 10 second timeout
    
    try {
      console.log('Calling API to fetch user profile...');
      console.log('API endpoint: /api/me/profile');
      const userProfile = await Api.api.getMyProfile(token);
      console.log('User profile received from API:', userProfile);
      console.log('Setting userProfile in store...');
      set({ userProfile });
      console.log('User profile set successfully');
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      set({ error: error.message });
    } finally {
      clearTimeout(timeoutId); // Clear the timeout
      console.log('Setting loading to false...');
      set({ loading: false });
      console.log('Loading state set to false');
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

  initializeAuth: async () => {
    console.log('=== STORE: initializeAuth called ===');
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Found' : 'Not found');
    
    if (token) {
      console.log('Token found, attempting to restore session...');
      try {
        console.log('Calling getMe function...');
        // Use the store's getMe function instead of calling API directly
        await get().getMe(token);
        console.log('getMe function completed successfully');
        
        // Also fetch user profile for enhanced data
        try {
          console.log('Fetching user profile...');
          const userProfile = await Api.api.getMyProfile(token);
          set({ userProfile });
          console.log('User profile loaded:', userProfile.total_bookings, 'bookings');
        } catch (profileError) {
          // Profile fetch might fail, but don't break the session
          console.log('Profile fetch failed, but session restored:', profileError);
        }
      } catch (error: any) {
        console.log('Session restoration failed:', error.message);
        console.log('Error type:', typeof error);
        console.log('Error details:', error);
        
        // The getMe function should have already cleared the token if it was an auth error
        // and redirected to login. If we get here, it means it's a different type of error.
        console.log('Session restoration failed, app will redirect to login');
        
        // Ensure we clear any remaining invalid state
        set({ token: null, user: null, userProfile: null });
        localStorage.removeItem('token');
        
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    } else {
      console.log('No token found in localStorage');
    }
    
    // Always set isInitializing to false when done
    console.log('=== STORE: Setting isInitializing to false ===');
    set({ isInitializing: false });
  },

  // Debug function to check token status
  debugTokenStatus: () => {
    const storeToken = get().token;
    const localStorageToken = localStorage.getItem('token');
    console.log('🔍 TOKEN DEBUG STATUS:');
    console.log('  Store token:', storeToken ? 'Present' : 'Missing');
    console.log('  localStorage token:', localStorageToken ? 'Present' : 'Missing');
    console.log('  Tokens match:', storeToken === localStorageToken);
    if (storeToken && localStorageToken) {
      console.log('  Store token starts with:', storeToken.substring(0, 20));
      console.log('  localStorage token starts with:', localStorageToken.substring(0, 20));
    }
  },

  // Debug function to reset loading state
  resetLoadingState: () => {
    console.log('=== STORE: Manually resetting loading state ===');
    set({ loading: false, error: null });
    console.log('Loading state reset to false');
  },

  // Health check function to test backend connectivity
  checkBackendHealth: async () => {
    console.log('🏥 Checking backend health...');
    try {
      const response = await fetch('/api/cities');
      console.log('Backend health check response:', response.status, response.ok);
      if (response.ok) {
        console.log('✅ Backend is reachable');
        return true;
      } else {
        console.log('❌ Backend returned error status:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Backend health check failed:', error);
      return false;
    }
  },

  // Test token storage manually
  testTokenStorage: () => {
    console.log('🧪 Testing token storage...');
    
    // Test 1: Set a test token
    const testToken = 'test_token_12345';
    localStorage.setItem('token', testToken);
    console.log('Test token set:', testToken);
    
    // Test 2: Retrieve it
    const retrievedToken = localStorage.getItem('token');
    console.log('Retrieved token:', retrievedToken);
    
    // Test 3: Check if they match
    const matches = testToken === retrievedToken;
    console.log('Tokens match:', matches);
    
    // Test 4: Clear test token
    localStorage.removeItem('token');
    console.log('Test token cleared');
    
    // Test 5: Verify it's gone
    const finalCheck = localStorage.getItem('token');
    console.log('Final check (should be null):', finalCheck);
    
    return matches;
  },

  // Sync store state with localStorage
  syncTokenWithLocalStorage: () => {
    const storeToken = get().token;
    const localStorageToken = localStorage.getItem('token');
    
    console.log('🔄 Syncing tokens...');
    console.log('  Store token:', storeToken ? 'Present' : 'Missing');
    console.log('  localStorage token:', localStorageToken ? 'Present' : 'Missing');
    
    if (storeToken && !localStorageToken) {
      console.log('  Store has token but localStorage is empty - syncing to localStorage');
      localStorage.setItem('token', storeToken);
    } else if (!storeToken && localStorageToken) {
      console.log('  localStorage has token but store is empty - syncing to store');
      set({ token: localStorageToken });
    } else if (storeToken && localStorageToken && storeToken !== localStorageToken) {
      console.log('  Tokens don\'t match - updating localStorage to match store');
      localStorage.setItem('token', storeToken);
    }
    
    // Final verification
    get().debugTokenStatus();
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
    console.log('Current loading state:', get().loading);
    
    if (!token) {
      console.log('No token available, cannot fetch bookings');
      return;
    }
    
    if (!user) {
      console.log('No user available, cannot fetch bookings');
      return;
    }
    
    console.log('Setting loading to true...');
    set({ loading: true, error: null });
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('=== STORE: fetchBookings timeout reached ===');
      set({ loading: false, error: 'Request timeout - please try again' });
    }, 10000); // 10 second timeout
    
    try {
      console.log('Calling API to fetch bookings for user:', user.id);
      console.log('API endpoint: /api/bookings');
      console.log('Token being sent:', token.substring(0, 20) + '...');
      
      const { bookings } = await Api.api.getBookings(token);
      console.log('Bookings received from API:', bookings);
      console.log('Setting myBookings in store...');
      set({ myBookings: bookings });
      console.log('Bookings set successfully');
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      set({ error: error.message });
    } finally {
      clearTimeout(timeoutId); // Clear the timeout
      console.log('Setting loading to false...');
      set({ loading: false });
      console.log('Loading state set to false');
    }
  },

  // Booking process
  selectBus: (bus) => {
    console.log('=== STORE: selectBus called ===');
    console.log('Previous bus:', get().selectedBus?.id);
    console.log('New bus:', bus.id);
    
    // Always clear selected seats when selecting a bus (even if same bus - new booking session)
    set({ selectedBus: bus, selectedSeats: [] });
    console.log('Selected seats cleared for new booking session');
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
      
      // Clear selected seats after successful booking
      set({ selectedSeats: [] });
      console.log('=== STORE: Selected seats cleared after booking ===');
      
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

  selectSeat: (seatId) => {
    set((state) => ({
      selectedSeats: [...state.selectedSeats, seatId],
    }));
  },

  clearSelectedSeats: () => {
    set({ selectedSeats: [] });
  },

  // Reset entire booking state (useful for new booking sessions)
  resetBookingState: () => {
    console.log('=== STORE: Resetting booking state ===');
    set({ 
      selectedBus: null, 
      selectedSeats: [], 
      seats: [],
      booking: null 
    });
    console.log('Booking state reset complete');
  },

  // Start new booking session (clears selected seats even for same bus)
  startNewBookingSession: (bus: Api.Bus) => {
    console.log('=== STORE: Starting new booking session ===');
    console.log('Bus:', bus.id, bus.operator);
    
    // Clear selected seats and set the bus (even if it's the same bus)
    set({ 
      selectedBus: bus, 
      selectedSeats: [],
      seats: [] // Clear seats to force fresh fetch
    });
    console.log('New booking session started - selected seats cleared');
  },

  // Force refresh seat data
  refreshSeatData: async (busId: string, travelDate?: string) => {
    console.log('=== STORE: Force refreshing seat data ===');
    console.log('Bus ID:', busId);
    console.log('Travel Date:', travelDate);
    
    // Clear selected seats first
    set({ selectedSeats: [] });
    
    // Then fetch fresh seat data
    if (busId) {
      await get().fetchBusSeats(busId, travelDate);
    }
  },
}));

// Auto-fetch user if token exists
const token = localStorage.getItem('token');
if (token) {
  useStore.getState().getMe(token);
}