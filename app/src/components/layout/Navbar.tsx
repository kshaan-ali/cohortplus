import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, GraduationCap, LayoutDashboard, BookOpen, Video, LogOut, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isAuthenticated, isTutor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { to: '/courses', label: 'All Courses', icon: BookOpen },
  ];

  const studentLinks = [
    { to: '/my-enrollments', label: 'My Learning', icon: GraduationCap },
    { to: '/my-recordings', label: 'My Recordings', icon: Video },
  ];

  const tutorLinks = [
    { to: '/tutor-dashboard', label: 'Tutor Dashboard', icon: LayoutDashboard },
  ];

  const NavItem = ({ to, label, icon: Icon, mobile = false }: { to: string, label: string, icon: React.ElementType, mobile?: boolean }) => {
    const isActive = location.pathname === to;

    if (mobile) {
      return (
        <Link
          to={to}
          className={cn(
            "flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-medium transition-all",
            isActive
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
          )}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Icon className={cn("h-6 w-6", isActive ? "text-indigo-600" : "text-gray-400")} />
          <span>{label}</span>
          {isActive && <ChevronRight className="h-5 w-5 ml-auto text-indigo-600" />}
        </Link>
      );
    }

    return (
      <Link
        to={to}
        className={cn(
          "relative flex items-center space-x-2 px-3 py-2 text-lg font-semibold transition-all group rounded-lg",
          isActive
            ? "text-indigo-600 bg-indigo-50/50"
            : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
        )}
      >
        <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600")} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Brand and Desktop Nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group transition-transform hover:scale-105">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-100">
                <GraduationCap className="h-9 w-9 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">CohortPlus</span>
            </Link>

            <div className="flex items-center gap-1 ml-4 lg:ml-8 max-sm:hidden">
              {navLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}

              {isAuthenticated && isTutor && tutorLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}

              {isAuthenticated && !isTutor && studentLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}
            </div>
          </div>

          {/* User Section (Desktop) */}
          <div className="flex items-center space-x-6 max-md:hidden">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 h-12 px-4 hover:bg-gray-50 rounded-xl transition-all">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-base font-semibold text-gray-900 truncate max-w-[150px]">
                        {user?.email?.split('@')[0]}
                      </span>
                      <span className="text-xs text-indigo-600 font-medium capitalize mt-1">
                        {user?.role}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-gray-100">
                  <div className="px-3 py-3 mb-1">
                    <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Account</p>
                    <p className="text-sm font-medium text-gray-900 truncate mt-1">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 text-red-600 focus:text-white focus:bg-red-600 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-base font-semibold">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" className="text-lg font-semibold px-6 h-12 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold px-8 h-12 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-7 w-7 text-gray-900" />
              ) : (
                <Menu className="h-7 w-7 text-gray-900" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold">CohortPlus</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-xl">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="space-y-2 flex-grow">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">Navigation</p>
              {navLinks.map((link) => (
                <NavItem key={link.to} {...link} mobile />
              ))}

              {isAuthenticated && isTutor && tutorLinks.map((link) => (
                <NavItem key={link.to} {...link} mobile />
              ))}

              {isAuthenticated && !isTutor && studentLinks.map((link) => (
                <NavItem key={link.to} {...link} mobile />
              ))}
            </div>

            <div className="pt-6 border-t space-y-4">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{user?.email}</span>
                      <span className="text-xs font-semibold text-indigo-600 capitalize">{user?.role}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-14 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 text-lg font-bold"
                  >
                    <LogOut className="h-6 w-6" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-14 rounded-xl text-lg font-bold border-2">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full h-14 rounded-xl text-lg font-bold bg-indigo-600 text-white shadow-lg">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
