// 'use client';

// export default function Footer() {
//   return (
//     // Dark background, white text, centered, padding, top margin
//     <footer className="bg-gray-800 text-white text-center py-6 mt-12 text-sm">
//       &copy; {new Date().getFullYear()} CuratedShop. All rights reserved.
//     </footer>
//   );
// }

'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    // Dark background, white text, centered, padding, top margin
    <footer className="bg-gray-900 text-white text-center py-8 mt-10">
      <div className="container mx-auto px-4">
        
        {/* Policy links section */}
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 text-sm">
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:underline">
            Terms & Conditions
          </Link>
          <Link href="/return-policy" className="hover:underline">
            Return/Refund Policy
          </Link>
          <Link href="/shipping-policy" className="hover:underline">
            Shipping/Service Policy
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact Us
          </Link>
        </div>

        {/* Copyright notice */}
        <p className="mt-6 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Curated Shop Australia. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
