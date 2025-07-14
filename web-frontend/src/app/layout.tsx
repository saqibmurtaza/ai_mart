// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import Navbar from '@/components/Navbar';
// import Footer from '@/components/Footer';

// // Load Inter font and make it available as a CSS variable for Tailwind's font-sans
// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// export const metadata: Metadata = {
//   title: 'Hydrogenie - Sustainable Products',
//   description: 'Sustainable, stylish, and smart products for your daily life.',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     // Apply the font variable to the html tag
//     <html lang="en" className={`${inter.variable}`}>
//       {/* Apply custom background color and font-sans utility */}
//       <body className="bg-brandbg font-sans min-h-screen flex flex-col">
//         <Navbar />
//         {/* Max width and auto margins for centered content, consistent padding */}
//         <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
//           {children}
//         </main>
//         <Footer />
//       </body>
//     </html>
//   );
// }


import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast'; // Correct import

// Load Inter font and make it available as a CSS variable for Tailwind's font-sans
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Hydrogenie - Sustainable Products',
  description: 'Sustainable, stylish, and smart products for your daily life.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Apply the font variable to the html tag
    <html lang="en" className={`${inter.variable}`}>
      {/* Apply custom background color and font-sans utility */}
      <body className="bg-brandbg font-sans min-h-screen flex flex-col">
        <Navbar />
        {/* Max width and auto margins for centered content, consistent padding */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <Footer />
        {/* TOASTER COMPONENT ADDED HERE: Ensures it's rendered globally */}
        <Toaster position="bottom-right" reverseOrder={false} />
      </body>
    </html>
  );
}
