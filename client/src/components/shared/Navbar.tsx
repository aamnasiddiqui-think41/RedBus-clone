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
            src="data:image/png;base64,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" 
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
