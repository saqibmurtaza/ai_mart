'use client';

import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/products' },
  { name: 'Cart', href: '/cart' },
  { name: 'Orders', href: '/orders' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 relative">
        {/* Left Section: Hamburger & Search (Now visible on ALL screens) */}
        {/* REMOVED: md:hidden from this div */}
        <div className="flex items-center gap-4 z-20">
          {/* Hamburger Menu Icon */}
          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 hover:text-primary focus:outline-none cursor-pointer relative"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          {/* Search Icon (This will now be the *only* search icon, visible on all screens) */}
          <button className="text-gray-600 hover:text-primary focus:outline-none cursor-pointer" aria-label="Search">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>

        {/* Center Section: Logo (Always visible, higher z-index) */}
        <div className="absolute left-1/2 -translate-x-1/2 z-30">
          <Link href="/" className="font-bold text-xl text-primary md:text-2xl">Hydrogenie</Link>
        </div>

        {/* Right Section: Login & Basket Icons (Removed duplicate desktop search icon) */}
        <div className="flex items-center gap-4 flex-grow justify-end z-20">
          {/* Removed the 'hidden md:block' search button here, as the left one is now universal */}

          {/* Login Icon (Placeholder) */}
          <button className="text-gray-600 hover:text-primary focus:outline-none cursor-pointer" aria-label="Login">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </button>
          {/* Basket/Cart Icon */}
          <Link href="/cart" className="text-gray-600 hover:text-primary focus:outline-none cursor-pointer" aria-label="Cart">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.769.746 1.769H19.5a2.25 2.25 0 002.25-2.25v-1.5a.75.75 0 00-.75-.75H6.25a.75.75 0 00-.75.75z"></path>
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Drawer (Now acts as the universal menu drawer) */}
      {/* Removed 'md:hidden' from this div as well, so it can be controlled by hamburger on all screens */}
      <div
        className={`bg-white shadow-lg absolute w-full transition-all duration-300 ease-in-out z-10 ${
          isMobileMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-700 hover:text-primary font-semibold text-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
