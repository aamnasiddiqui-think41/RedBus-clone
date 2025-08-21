import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { BusList } from '../components/bus/BusList';
import { Navbar } from '../components/shared/Navbar';
import type { Bus } from '../services/Api';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { cities, fetchCities, searchBuses, selectBus } = useStore();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Fetch cities on component mount
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleSearch = () => {
    if (fromCity && toCity) {
      // Call the search API with correct structure from API.md
      const searchData: any = {
        from_city_id: fromCity,
        to_city_id: toCity
      };
      
      // Only add date if it's provided
      if (date) {
        searchData.date = date;
      }
      
      searchBuses(searchData);
      setShowResults(true);
    }
  };

  const handleSelectBus = (bus: Bus) => {
    selectBus(bus);
    navigate(`/bus/${bus.id}/seats`);
  };

  const setToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    setDate(formattedDate);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    setDate(formattedDate);
  };

  // FAQ functionality
  useEffect(() => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      item.addEventListener('click', () => {
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.fa-chevron-down');
        if (answer && icon) {
          answer.classList.toggle('hidden');
          icon.classList.toggle('rotate-180');
        }
      });
    });

    // Cleanup
    return () => {
      faqItems.forEach(item => {
        item.removeEventListener('click', () => {});
      });
    };
  }, []);

  return (
    <div className="bg-gray-100 text-gray-800 overflow-x-hidden min-w-0">
      {/* Shared Navbar */}
      <Navbar showNavigation={true} />

      {/* Hero Background */}
      <section className="relative bg-gradient-to-br from-[#dedff7] via-[#d6e8ec] to-white py-16">
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          {/* Background elements can be added here */}
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-white font-extrabold text-4xl sm:text-5xl mb-8 drop-shadow text-left">
            India's No. 1 online <br />bus ticket booking site
          </h1>
          
          {/* Search card */}
          <div className="rounded-[28px] shadow-lg bg-white border border-gray-300 flex flex-wrap items-center justify-between py-2 px-2 sm:px-6 min-h-[84px] w-full" style={{boxShadow: '0 4px 24px rgba(44,62,80,0.12)'}}>
            {/* From */}
            <div className="flex items-center flex-1 py-3 px-2 border-r border-gray-300 min-w-[160px]">
              <i className="fa-solid fa-bus text-black text-xl mr-2"></i>
              <select 
                className="w-full text-lg font-semibold bg-transparent focus:outline-none"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                required
              >
                <option value="" disabled>From</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            
            {/* To */}
            <div className="flex items-center flex-1 py-3 px-2 border-r border-gray-300 min-w-[160px]">
              <i className="fa-solid fa-bus text-black text-xl mr-2"></i>
              <select 
                className="w-full text-lg font-semibold bg-transparent focus:outline-none"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                required
              >
                <option value="" disabled>To</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            
            {/* Date */}
            <div className="flex flex-col flex-1 py-3 px-2 border-r border-gray-300 min-w-[180px]">
              <div className="flex items-center">
                <i className="fa-regular fa-calendar text-black text-xl mr-2"></i>
                <span className="text-xs text-gray-500">Date of Journey (Optional)</span>
              </div>
              <input 
                type="date" 
                className="text-lg font-semibold text-black ml-8 -mt-2 bg-transparent focus:outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            {/* Today/Tomorrow */}
            <div className="flex items-center gap-2 py-3 px-2 border-r border-gray-300 min-w-[150px]">
              <button 
                className="bg-[#fdebec] rounded-full px-5 py-2 font-medium text-black border-none"
                onClick={setToday}
              >
                Today
              </button>
              <button 
                className="bg-[#fdebec] rounded-full px-5 py-2 font-medium text-black border-none"
                onClick={setTomorrow}
              >
                Tomorrow
              </button>
            </div>
          </div>
          
          {/* Search Button */}
          <div className="flex justify-center -mt-6">
            <button 
              className="bg-[#d84e55] text-white font-bold py-4 px-16 rounded-full shadow-lg text-lg flex items-center gap-2"
              style={{boxShadow: '0 4px 24px rgba(44,62,80,0.12)'}}
              onClick={handleSearch}
              disabled={!fromCity || !toCity}
            >
              <i className="fa-solid fa-bus-alt mr-2"></i> Search buses
            </button>
          </div>
        </div>
      </section>

      {/* Bus Search Results */}
      {showResults && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-10">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Available Buses</h2>
            <BusList onSelectBus={handleSelectBus} />
          </div>
        </section>
      )}

      {/* Green banner: Bengaluru bookings */}
      <section className="w-full bg-[#cdf5dd] py-8 mt-8 flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center md:justify-center gap-7">
          <img src="https://i.imgur.com/nKqI4Va.png" alt="" className="w-40 h-32 object-contain" />
          <div className="text-xl md:text-2xl font-bold text-green-900 text-center mb-3 md:mb-0">
            25,000+ people booked from Bengaluru <br />
            <span className="text-base font-normal">on redBus last month</span>
          </div>
        </div>
      </section>

      {/* Offers */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Offers for you</h2>
          <a href="#" className="text-red-500 hover:underline text-sm">View more</a>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Offer Cards */}
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-5 shadow w-64">
            <span className="bg-red-100 p-3 rounded-full">
              <i className="fa-solid fa-gift text-2xl text-red-500"></i>
            </span>
            <div className="font-bold mt-2">Save up to ₹500 on bus tickets</div>
            <div className="text-red-500 text-xs mt-1">RED500</div>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-5 shadow w-64">
            <span className="bg-blue-100 p-3 rounded-full">
              <i className="fa-solid fa-bus text-2xl text-blue-500"></i>
            </span>
            <div className="font-bold mt-2">Save up to ₹250 on bus tickets</div>
            <div className="text-blue-500 text-xs mt-1">FIRST</div>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-5 shadow w-64">
            <span className="bg-green-100 p-3 rounded-full">
              <i className="fa-solid fa-bus text-2xl text-green-500"></i>
            </span>
            <div className="font-bold mt-2">Save up to ₹300 on AP & TS buses</div>
            <div className="text-green-500 text-xs mt-1">SUPERHIT</div>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-5 shadow w-64">
            <span className="bg-gray-100 p-3 rounded-full">
              <i className="fa-solid fa-bus text-2xl text-gray-500"></i>
            </span>
            <div className="font-bold mt-2">Save up to ₹300 on South buses</div>
            <div className="text-gray-500 text-xs mt-1">CASH300</div>
          </div>
        </div>
      </section>

      {/* What's new (Promos etc.) */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-14">
        <h2 className="text-lg font-bold mb-2">What's new</h2>
        <div className="flex flex-wrap gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 flex flex-col w-64 shadow">
            <div className="font-bold mb-2">JAW-DROPPING PRICES ON BRAND-NEW CARS</div>
            <div className="text-xs text-gray-600">Know more</div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 flex flex-col w-64 shadow">
            <div className="font-bold mb-2">Free Cancellation</div>
            <div className="text-xs text-gray-600">Get 100% refund on cancellation</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 flex flex-col w-64 shadow">
            <div className="font-bold mb-2">Introducing Bus Cards</div>
            <div className="text-xs text-gray-600">Know more</div>
          </div>
        </div>
      </section>

      {/* Government Buses */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-14">
        <h2 className="text-lg font-bold mb-2">Government Buses</h2>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white rounded-xl shadow p-6 w-64">
            <h3 className="font-bold text-base mb-2">APSRTC</h3>
            <p className="text-xs text-gray-500">TSRTC, KSRTC, Kerala, KTCL. <br />AC, Multi-axle and more</p>
            <div className="mt-3">
              <span className="bg-green-100 text-green-500 rounded-full px-1 py-0.5 text-xs">Official partner</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">Online payments</span>
              <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">24x7 call/chat</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 w-64">
            <h3 className="font-bold text-base mb-2">TSRTC</h3>
            <p className="text-xs text-gray-500">AP, Telangana routes</p>
            <div className="mt-3">
              <span className="bg-blue-100 text-blue-500 rounded-full px-1 py-0.5 text-xs">Official partner</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">Online payments</span>
              <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">24x7 call/chat</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 w-64">
            <h3 className="font-bold text-base mb-2">KERALA RTC</h3>
            <p className="text-xs text-gray-500">Multi-axle, AC, more</p>
            <div className="mt-3">
              <span className="bg-green-100 text-green-500 rounded-full px-1 py-0.5 text-xs">Official partner</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">Online payments</span>
              <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">24x7 call/chat</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 w-64">
            <h3 className="font-bold text-base mb-2">KTCL</h3>
            <p className="text-xs text-gray-500">Goa, AC, new buses</p>
            <div className="mt-3">
              <span className="bg-pink-100 text-pink-500 rounded-full px-1 py-0.5 text-xs">Official partner</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">Online payments</span>
              <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">24x7 call/chat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-14">
        <h2 className="text-lg font-bold mb-2">Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-7">
            <div className="text-lg font-bold">Clean buses. Great experience.</div>
            <div className="mt-2 text-xs text-gray-400">- Karthik Moorty, Redbus user since 2019</div>
          </div>
          <div className="bg-white rounded-xl shadow p-7">
            <div className="text-lg font-bold">Safe and fast travel experience</div>
            <div className="mt-2 text-xs text-gray-400">- Aaswita, Redbus user since 2018</div>
          </div>
          <div className="bg-white rounded-xl shadow p-7">
            <div className="text-lg font-bold">Clean buses. Courteous staff.</div>
            <div className="mt-2 text-xs text-gray-400">- Shiran, Redbus user since 2020</div>
          </div>
        </div>
      </section>

      {/* Get the app banner */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-14">
        <div className="bg-white rounded-2xl shadow flex flex-col md:flex-row items-center justify-between px-8 py-8">
          <div>
            <h2 className="font-bold text-xl mb-2">Get the redBus App</h2>
            <p className="text-sm text-gray-500 mb-5">Book on the go! Download for exciting offers!</p>
          </div>
          <button className="bg-red-500 text-white font-bold px-8 py-3 rounded-full hover:bg-red-600 transition text-lg">Download app</button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-14">
        <h2 className="text-lg font-bold mb-2">FAQs related to Bus Tickets Booking</h2>
        <div className="space-y-4">
          <div className="faq-item bg-white p-6 rounded-xl shadow cursor-pointer">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">What is a bus ticket booking service?</h3>
              <i className="fas fa-chevron-down text-red-500 transition-transform duration-300"></i>
            </div>
            <p className="faq-answer text-sm text-gray-600 mt-2 hidden">A bus ticket booking service allows you to search, compare, and book bus tickets online. It provides a convenient way to plan your travel from anywhere.</p>
          </div>
          <div className="faq-item bg-white p-6 rounded-xl shadow cursor-pointer">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">How can I book a bus ticket on redBus?</h3>
              <i className="fas fa-chevron-down text-red-500 transition-transform duration-300"></i>
            </div>
            <p className="faq-answer text-sm text-gray-600 mt-2 hidden">Booking a bus ticket on redBus is a simple, three-step process: search, select, and pay. Your ticket is sent to your phone instantly.</p>
          </div>
          <div className="faq-item bg-white p-6 rounded-xl shadow cursor-pointer">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Can I cancel or reschedule my ticket?</h3>
              <i className="fas fa-chevron-down text-red-500 transition-transform duration-300"></i>
            </div>
            <p className="faq-answer text-sm text-gray-600 mt-2 hidden">Yes, redBus provides easy cancellation and rescheduling. You can do it directly from your account, subject to operator policies.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-14 mt-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col space-y-2">
            <img src="https://s3.rdbuz.com/web/images/logo/redbus-logo.png" alt="RedBus Logo" className="h-10 mb-4" />
            <p className="text-sm">RedBus is the world's largest online bus ticket booking service.</p>
            <div className="flex space-x-4 mt-4 text-white">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">FAQs</a></li>
              <li><a href="#" className="hover:underline">Terms &amp; Conditions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Top Routes</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:underline">Bengaluru to Chennai</a></li>
              <li><a href="#" className="hover:underline">Mumbai to Pune</a></li>
              <li><a href="#" className="hover:underline">Delhi to Jaipur</a></li>
              <li><a href="#" className="hover:underline">Hyderabad to Vijayawada</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Follow Us</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">Twitter</a></li>
              <li><a href="#" className="hover:underline">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm">&copy; 2025 RedBus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
