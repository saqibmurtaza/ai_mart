import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext';
import DOMCleanup from '@/components/DOMCleanup';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AI Mart - Intelligent Products',
  description: 'Intelligent, stylish, and smart products for your modern life.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
          <DOMCleanup />
          <Toaster position="top-center" reverseOrder={false} />

          <CartProvider>
            <div className="flex flex-col min-h-screen">

              {/* Navbar with Clerk authentication controls */}
              <header>
                <Navbar />
                <div className="flex space-x-4 justify-end p-4">
                  <SignedOut>
                    <SignInButton>
                      <button className="btn">Sign In</button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="btn">Sign Up</button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </header>

              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
