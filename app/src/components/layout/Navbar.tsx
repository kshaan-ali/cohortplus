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
import { Menu, User, GraduationCap, LayoutDashboard, BookOpen, Video, LogOut, X, ChevronRight, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const auth = useAuth() || {};
  const { user, isAuthenticated, isTutor, logout } = auth;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Use 1024 (lg) for desktop to ensure plenty of room for links
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { to: '/courses', label: 'All Courses', icon: BookOpen },
  ];

  const studentLinks = [
    { to: '/my-enrollments', label: 'My Enrollments', icon: GraduationCap },
    // Removed My Recordings per user request
    { to: '/community', label: 'Community', icon: MessageCircle },
  ];

  const tutorLinks = [
    { to: '/tutor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/community', label: 'Community', icon: MessageCircle },
  ];

  const NavItem = ({ to, label, icon: Icon, mobile = false }: { to: string, label: string, icon: any, mobile?: boolean }) => {
    const currentPath = location?.pathname || '';
    const isActive = currentPath === to;

    if (mobile) {
      return (
        <Link
          to={to}
          className={cn(
            "flex items-center space-x-4 px-5 py-4 rounded-2xl text-[17px] font-bold transition-all",
            isActive
              ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
          )}
          onClick={() => setMobileMenuOpen(false)}
        >
          {Icon && <Icon className={cn("h-6 w-6", isActive ? "text-blue-400" : "text-slate-500")} />}
          <span>{label}</span>
          {isActive && <ChevronRight className="h-5 w-5 ml-auto text-blue-400 opacity-50" />}
        </Link>
      );
    }

    return (
      <Link
        to={to}
        className={cn(
          "relative flex items-center space-x-2.5 px-4 py-2 text-[15px] font-bold transition-all group",
          isActive ? "text-blue-400" : "text-slate-400 hover:text-white"
        )}
      >
        {Icon && <Icon className={cn("h-[18px] w-[18px] transition-all transform group-hover:-translate-y-0.5", isActive ? "text-blue-400" : "text-slate-500")} />}
        <span className="whitespace-nowrap tracking-tight">{label}</span>
        {isActive && (
          <div className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 w-[60%] h-[2.5px] bg-blue-500 shadow-[0_0_15px_#3b82f6] rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <nav
      style={{
        background: 'rgba(2, 4, 8, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(37, 99, 235, 0.2)',
        backgroundImage: 'linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}
      className="sticky top-0 z-[100] w-full h-[88px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo & Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3.5 group">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.45)] group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter" style={{
                fontFamily: 'Syne, sans-serif',
                background: 'linear-gradient(to bottom, #fff, #93C5FD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                CohortPlus
              </span>
            </Link>

            {/* Desktop Links Container */}
            {isDesktop && (
              <div className="flex items-center space-x-1 ml-4">
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
            )}
          </div>

          {/* User / Auth Section */}
          <div className="flex items-center space-x-4">
            {isDesktop ? (
              <div>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-3 h-[52px] px-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all shadow-inner">
                        <div className="bg-blue-600/20 p-1.5 rounded-lg border border-blue-500/30">
                          <User className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                          <span className="text-sm font-black text-white max-w-[130px] truncate tracking-tight">
                            {user?.email?.split('@')[0] || 'Member'}
                          </span>
                          <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.15em] mt-1 opacity-80">
                            {user?.role || 'User'}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl bg-[#060C14] border-blue-500/20 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-3.5 py-4 mb-2 bg-blue-600/5 rounded-xl border border-blue-600/10">
                        <p className="text-[10px] font-black text-blue-400 tracking-[0.15em] uppercase mb-1.5 opacity-70">Active Session</p>
                        <p className="text-[14px] font-bold text-white truncate">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator className="bg-blue-500/10 mb-2" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center space-x-3 p-3.5 text-rose-400 focus:text-white focus:bg-rose-600/90 rounded-xl cursor-pointer font-black transition-all"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout Session</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link to="/login">
                      <Button variant="ghost" className="text-[15px] font-bold px-6 h-[48px] rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="bg-blue-600 hover:bg-blue-500 text-[15px] font-black px-7 h-[48px] rounded-xl text-white shadow-[0_8px_20px_rgba(37,99,235,0.4)] transition-all transform active:scale-95">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* Mobile Toggle Controls */
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-slate-300 rounded-xl hover:bg-white/5 border border-white/5"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {!isDesktop && mobileMenuOpen && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-[#020408] border-l border-blue-500/20 p-8 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>
                  CohortPlus
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-xl text-slate-400 hover:bg-white/5 h-11 w-11">
                <X className="h-7 w-7" />
              </Button>
            </div>

            <div className="flex-grow space-y-3">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 ml-4">Directory</p>
              {navLinks.map((link) => <NavItem key={link.to} {...link} mobile />)}
              {isAuthenticated && (isTutor ? tutorLinks : studentLinks).map((link) => <NavItem key={link.to} {...link} mobile />)}
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              {isAuthenticated ? (
                <div className="space-y-6">
                  <div className="px-5 py-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                    <p className="text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase mb-1.5 opacity-70">Authenticated Profile</p>
                    <div className="text-base font-bold text-white truncate">{user?.email}</div>
                    <div className="text-[11px] text-blue-400 uppercase font-black tracking-widest mt-1 opacity-90">{user?.role}</div>
                  </div>
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-rose-400 font-black h-14 rounded-2xl border border-rose-500/10 hover:bg-rose-500/10 transition-all text-base px-6">
                    <LogOut className="mr-4 h-6 w-6" /> Logout Session
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full border-white/10 text-white font-bold h-14 rounded-2xl bg-white/5">Sign in</Button></Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}><Button className="w-full bg-blue-600 text-white font-black h-14 rounded-2xl shadow-lg shadow-blue-900/40">Open Free Account</Button></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
