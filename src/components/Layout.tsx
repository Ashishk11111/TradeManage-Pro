import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Users, FileText, BarChart3, Menu, X, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/register'); // redirect if not logged in
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/register');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: BarChart3 },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Clients', href: '/clients', icon: Users },
    {name : 'Company', href: '/SetupCompany', icon: BarChart3 },
    { name: 'Invoices', href: '/invoices', icon: FileText },
  ];

  if (!isAuthenticated) return null; // Don't render layout until auth check

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Business Manager</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg">
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-gray-100"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </nav>
        </div>
      )}

      <div className="lg:flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Business Manager</h1>
            </div>
            <nav className="mt-8 flex-1 px-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className="mr-3 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-gray-100"
              >
                <LogOut size={20} className="mr-3 flex-shrink-0" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
