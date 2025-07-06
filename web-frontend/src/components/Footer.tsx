'use client';

export default function Footer() {
  return (
    // Dark background, white text, centered, padding, top margin
    <footer className="bg-gray-800 text-white text-center py-6 mt-12 text-sm">
      &copy; {new Date().getFullYear()} Hydrogenie. All rights reserved.
    </footer>
  );
}
