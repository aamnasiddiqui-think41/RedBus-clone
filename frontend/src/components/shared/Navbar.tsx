import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';

interface NavbarProps {
  showNavigation?: boolean; // For login page, we might not want navigation links
}

export const Navbar = ({ showNavigation = true }: NavbarProps) => {
  const navigate = useNavigate();
  const { logout } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center py-4">
        <div className="flex items-center space-x-10">
          <img 
            src="https://s3.rdbuz.com/web/images/logo/redbus-logo.png" 
            alt="RedBus Logo" 
            className="h-9 cursor-pointer"
            onClick={() => navigate('/')}
          />
          {showNavigation && (
            <nav className="flex items-center space-x-8">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
                className="tab-active flex flex-col items-center text-red-500 font-semibold"
              >
                <i className="fa-solid fa-bus-simple text-xl mb-1"></i>
                <span>Bus Tickets</span>
              </a>
            </nav>
          )}
        </div>
        
        {showNavigation && (
          <div className="flex items-center space-x-8 text-sm">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/my-details/bookings'); }} 
              className="text-gray-600 hover:text-red-500 transition"
            >
              Bookings
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/my-details/personal-info'); }} 
              className="text-gray-600 hover:text-red-500 transition"
            >
              Account
            </a>
            <button 
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-500 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
