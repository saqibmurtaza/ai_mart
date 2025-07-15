import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext';

// Load Inter font and make it available as a CSS variable for Tailwind's font-sans
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Hydrogenie - Sustainable Products',
  description: 'Sustainable, stylish, and smart products for your daily life.',
};

// Placeholder for user ID. In a real app, this would come from authentication.
// Define it here to use as a key for CartProvider
const MOCK_USER_ID = 'user_123'; // Make sure this is consistent everywhere

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-brandbg font-sans min-h-screen flex flex-col">
        {/* Wrap the entire application content with CartProvider */}
        {/* Added a key to force remounting of CartProvider on user ID change (future) */}
        <CartProvider key={MOCK_USER_ID}> 
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster position="bottom-right" reverseOrder={false} />
        </CartProvider>
      </body>
    </html>
  );
}
