// 'use client';

// import Link from 'next/link';
// import { useState, useEffect } from 'react';
// import { useCart } from '@/context/CartContext';
// import { createClient } from '@/utils/supabase/client';
// import Image from 'next/image';

// const navLinks = [
//   { name: 'Home', href: '/' },
//   { name: 'Shop', href: '/products' },
//   { name: 'Cart', href: '/cart' },
//   { name: 'Orders', href: '/orders' },
// ];

// export default function Navbar() {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const { cartItemCount, loadingCart } = useCart();
//   const [user, setUser] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const supabase = createClient();
//     const fetchUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       setUser(user);
//       setIsLoading(false);
//     };
//     fetchUser();
//   }, []);

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const handleLogout = async () => {
//     const supabase = createClient();
//     await supabase.auth.signOut();
//     setUser(null);
//   };

//   const handleLogin = async () => {
//     const supabase = createClient();
//     const currentPath = window.location.pathname + (window.location.search || '');
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: `http://localhost:3000${currentPath}`,
//       },
//     });
//     if (error) {
//       console.error('Login error:', error.message);
//     } else if (data.url) {
//       window.location.href = data.url; // Redirect to OAuth URL
//     }
//   };

//   return (
//     <nav className="bg-white shadow sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 relative">
//         <div className="flex items-center gap-4 z-20">
//           <button
//             onClick={toggleMobileMenu}
//             className="text-gray-600 hover:text-primary focus:outline-none cursor-pointer relative"
//             aria-label="Toggle menu"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
//             </svg>
//           </button>
//           <button className="text-gray-600 hover:text-primary focus:outline-none cursor-pointer" aria-label="Search">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
//             </svg>
//           </button>
//         </div>
//         <div className="absolute left-1/2 -translate-x-1/2 z-30">
//           <Link href="/" className="font-bold text-xl text-blue-600 md:text-2xl">Hydrogenie</Link>
//         </div>
//         <div className="flex items-center gap-4 flex-grow justify-end z-20">
//           <div className="h-6 w-6">
//             {isLoading ? (
//               <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
//             ) : user ? (
//               <div className="flex items-center gap-2">
//                 <Link href="/orders" aria-label="View Orders">
//                   <Image
//                     src={user.user_metadata?.picture || '/default-avatar.png'}
//                     alt="User profile"
//                     width={24}
//                     height={24}
//                     className="rounded-full"
//                   />
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className="text-gray-600 hover:text-primary text-sm"
//                   aria-label="Logout"
//                 >
//                   Logout
//                 </button>
//               </div>
//             ) : (
//               <button onClick={handleLogin} className="text-gray-600 hover:text-primary" aria-label="Login">
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                 </svg>
//               </button>
//             )}
//           </div>
//           <Link href="/cart" className="relative text-gray-600 hover:text-primary focus:outline-none cursor-pointer" aria-label="Cart">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.769.746 1.769H19.5a2.25 2.25 0 002.25-2.25v-1.5a.75.75 0 00-.75-.75H6.25a.75.75 0 00-.75.75z"></path>
//             </svg>
//             {!loadingCart && cartItemCount > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                 {cartItemCount}
//               </span>
//             )}
//           </Link>
//         </div>
//       </div>
//       <div
//         className={`bg-white shadow-lg absolute w-full transition-all duration-300 ease-in-out z-10 ${
//           isMobileMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'
//         }`}
//       >
//         <div className="flex flex-col items-center space-y-4">
//           {navLinks.map(link => (
//             <Link
//               key={link.name}
//               href={link.href}
//               className="text-gray-700 hover:text-blue-600 font-semibold text-lg"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               {link.name}
//             </Link>
//           ))}
//           {user ? (
//             <button
//               onClick={handleLogout}
//               className="text-gray-700 hover:text-blue-600 font-semibold text-lg"
//             >
//               Logout
//             </button>
//           ) : (
//             <button
//               onClick={handleLogin}
//               className="text-gray-700 hover:text-blue-600 font-semibold text-lg"
//             >
//               Login
//             </button>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/products' },
  { name: 'Cart', href: '/cart' },
  { name: 'Orders', href: '/orders' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItemCount, loadingCart } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Remove all user and auth related state and handlers

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 relative">
        <div className="flex items-center gap-4 z-20">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 hover:text-primary focus:outline-none cursor-pointer relative"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <button
            className="text-gray-600 hover:text-primary focus:outline-none cursor-pointer"
            aria-label="Search"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 z-30">
          <Link
            href="/"
            className="font-bold text-xl text-blue-600 md:text-2xl"
          >
            Hydrogenie
          </Link>
        </div>
        <div className="flex items-center gap-4 flex-grow justify-end z-20">
          {/* Remove user avatar/login/logout */}
          <Link
            href="/cart"
            className="relative text-gray-600 hover:text-primary focus:outline-none cursor-pointer"
            aria-label="Cart"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.769.746 1.769H19.5a2.25 2.25 0 002.25-2.25v-1.5a.75.75 0 00-.75-.75H6.25a.75.75 0 00-.75.75z"
              ></path>
            </svg>
            {!loadingCart && cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div
        className={`bg-white shadow-lg absolute w-full transition-all duration-300 ease-in-out z-10 ${
          isMobileMenuOpen
            ? 'max-h-screen opacity-100 py-4'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-700 hover:text-blue-600 font-semibold text-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {/* Remove login/logout buttons completely */}
        </div>
      </div>
    </nav>
  );
}
