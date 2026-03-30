'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, Globe } from 'lucide-react';
import { getUser, clearAuth, isAuthenticated } from '../lib/auth';
import { getStoredLocale, setStoredLocale, Locale } from '../lib/i18n';
import { Button } from '@boulot/ui';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setLocale(getStoredLocale());

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    router.push('/login');
  };

  const toggleLocale = () => {
    const next: Locale = locale === 'en' ? 'rw' : 'en';
    setStoredLocale(next);
    setLocale(next);
    window.location.reload();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm transition-transform group-hover:scale-105">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-black">BOULOT</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/projects" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
            Available Projects
          </Link>
          <Link href="/register" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
            Hire Talent
          </Link>
          <Link href="/register" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
            Become a Talent
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            title={locale === 'en' ? 'Switch to Kinyarwanda' : 'Switch to English'}
          >
            <Globe size={16} />
            {locale === 'en' ? 'EN' : 'RW'}
          </button>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-black">
                Dashboard
              </Link>
              <Button 
                variant="secondary" 
                onClick={handleLogout}
                className="rounded-full px-6 py-2 text-sm"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black">
                Sign In
              </Link>
              <Link href="/register">
                <button className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-1 group">
                  Join Now
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-black"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 md:hidden flex flex-col gap-6"
          >
            <Link href="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Explore</Link>
            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Hire Talent</Link>
            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Become a Talent</Link>
            <hr className="border-gray-100" />
            {isLoggedIn ? (
              <Button onClick={handleLogout} className="w-full">Logout</Button>
            ) : (
              <div className="flex flex-col gap-4">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center font-medium">Sign In</Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Join Now</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
