'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { sanityClient } from '@/lib/sanity';
import { getContentBlocks, ContentBlock, getCategories, Category, getFeaturedProducts, Product } from '@/lib/api';
import { PortableText } from '@portabletext/react';
import ContentBlockComponent from '@/components/ContentBlock';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        
        const [blocksData, categoriesData, featuredData] = await Promise.all([
        getContentBlocks().catch(e => { console.error("Failed to fetch content blocks:", e); return []; }),
        getCategories().catch(e => { console.error("Failed to fetch categories:", e); return []; }),
        getFeaturedProducts().catch(e => { console.error("Failed to fetch featured products:", e); return []; }),
      ]);


        // setBenefitsSection(benefitsData);
        setContentBlocks(blocksData);
        setCategories(categoriesData);
        setFeaturedProducts(featuredData);
      } catch (error) {
        console.error("An unexpected error occurred while fetching page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, []);

  return (
    <>
      <section className="relative h-[60vh] flex justify-center items-end text-white overflow-hidden">
        <Image
          src="/images/hero-main.jpg"
          alt="A vibrant hero image showcasing our products"
          fill
          quality={90}
          priority={true}
          className="z-0 filter saturate-125 contrast-110 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
        <div className="relative z-20 text-center p-4 pb-16 md:pb-20">
          <Link
            href="/products"
            className="inline-block px-8 py-3 font-semibold text-white text-lg bg-white/10 border border-white/30 rounded-lg shadow-lg backdrop-blur-md hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Shop By Category</h2>
          {isLoading ? (
            <p>Loading categories...</p>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          ) : (
            <p>No categories found.</p>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          {isLoading ? (
            <p>Loading featured products...</p>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p>No featured products found.</p>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Merchandise Collection</h2>
          {isLoading ? (
            <p className="text-center">Loading content...</p>
          ) : contentBlocks.length > 0 ? (
            <div className="space-y-12">
              {contentBlocks.map((block) => (
                <ContentBlockComponent key={block._id} data={block} />
              ))}
            </div>
          ) : (
            <p className="text-center">No additional content found.</p>
          )}
        </div>
      </section>


    </>
  );
}

export const dynamic = 'force-dynamic'; 