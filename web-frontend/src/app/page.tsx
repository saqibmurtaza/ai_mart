'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  getHomepageSection, HomepageSectionContent,
  getContentBlocks, ContentBlockData,
  getCategories, CategoryData,
  getFeaturedProducts, Product
} from '@/lib/api';
import { PortableText } from '@portabletext/react';
import ContentBlock from '@/components/ContentBlock';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [benefitsSection, setBenefitsSection] = useState<HomepageSectionContent | null>(null);
  const [loadingBenefits, setLoadingBenefits] = useState(true);

  const [contentBlocks, setContentBlocks] = useState<ContentBlockData[]>([]);
  const [loadingContentBlocks, setLoadingContentBlocks] = useState(true);

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingFeaturedProducts, setLoadingFeaturedProducts] = useState(true);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true); // This sets hasMounted to true on the client side after initial render

    async function fetchPageData() {
      // Fetch Homepage Section (e.g., Hydrogen Water Benefits)
      setLoadingBenefits(true);
      try {
        const benefitsData = await getHomepageSection('hydrogen-water-benefits');
        setBenefitsSection(benefitsData || null);
        console.log("Frontend: Fetched benefits section data:", benefitsData);
      } catch (error) {
        console.error("Frontend: Failed to load homepage benefits section:", error);
        setBenefitsSection(null);
      } finally {
        setLoadingBenefits(false);
      }

      // Fetch Dynamic Content Blocks
      setLoadingContentBlocks(true);
      try {
        const blocksData = await getContentBlocks();
        setContentBlocks(blocksData || []);
        console.log("Frontend: Fetched content blocks data:", blocksData);
      } catch (error) {
        console.error("Frontend: Failed to load content blocks:", error);
        setContentBlocks([]);
      } finally {
        setLoadingContentBlocks(false);
      }

      // Fetch Categories for the "Shop By Category" section
      setLoadingCategories(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
        console.log("Frontend: Fetched categories data:", categoriesData);
      } catch (error) {
        console.error("Frontend: Failed to load categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }

      // Fetch Featured Products
      setLoadingFeaturedProducts(true);
      try {
        const featuredProductsData = await getFeaturedProducts();
        setFeaturedProducts(featuredProductsData || []);
        console.log("Frontend: Fetched featured products data:", featuredProductsData);
      } catch (error) {
        console.error("Frontend: Failed to load featured products:", error);
        setFeaturedProducts([]);
      } finally {
        setLoadingFeaturedProducts(false);
      }
    }
    fetchPageData();
  }, []);

  // Remove the !hasMounted check here. The content should always be rendered.
  // The hydration mismatch is likely coming from something else, or this pattern
  // itself is causing it if the server-rendered HTML for the hero is different
  // from the client-rendered HTML.
  // For now, let's ensure the content is always present.

  return (
    <>
      {/* Hero Section - This will be the first thing users see */}
      <div className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center text-white overflow-hidden">
        <Image
          src="/images/hero-main.jpg"
          alt="Hydrogenie Hero"
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="absolute inset-0 z-0"
        />
        {/* Content overlay for text and button - THIS IS WHERE THE CONTENT GOES NOW */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center justify-center">
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-4 drop-shadow-lg">
            Feel the Difference in Every Drop
          </h1>
          <p className="text-base md:text-lg mb-6 drop-shadow-md">
            Experience the pure power of hydrogen-infused water for enhanced wellness and vitality.
          </p>
          <Link
            href="/products" // Link to the main shop page
            className="inline-block bg-accent text-white text-lg md:text-xl font-semibold px-10 py-5 rounded-full shadow-xl hover:bg-opacity-90 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Category Showcase Section - Displays product categories */}
      <section className="max-w-7xl mx-auto py-16 px-4 my-12 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-10">Shop By Category</h2>
        {loadingCategories ? (
          <div className="text-center py-8 text-gray-600 text-lg">Loading categories...</div>
        ) : categories.length > 0 ? (
          <div className="
            grid grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-3
            xl:grid-cols-3
            gap-6
          ">
            {categories.map((category) => (
              // CategoryCard already links to /products?category={slug}
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 text-lg">No categories found.</div>
        )}
      </section>

      {/* Featured Products Section - Displays a selection of popular products */}
      <section className="max-w-7xl mx-auto py-16 px-4 my-12 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-10">Featured Products</h2>
        {loadingFeaturedProducts ? (
          <div className="text-center py-8 text-gray-600 text-lg">Loading featured products...</div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              // ProductCard already links to /products/{slug}
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 text-lg">No featured products found.</div>
        )}
      </section>

      {/* Dynamic Content Blocks Section - Renders various content blocks from Sanity */}
      {loadingContentBlocks ? (
        <div className="text-center py-12 text-gray-600 text-lg">Loading additional content blocks...</div>
      ) : contentBlocks.length > 0 ? (
        contentBlocks.map((block) => (
          <ContentBlock key={block._id} data={block} />
        ))
      ) : (
        <div className="text-center py-12 text-gray-600 text-lg">No additional content blocks found.</div>
      )}

      {/* Hydrogen Water Benefits Section - Specific section, can be ordered dynamically or kept static */}
      {loadingBenefits ? (
        <div className="text-center py-12 text-gray-600 text-lg">Loading benefits section...</div>
      ) : benefitsSection ? (
        <section className="max-w-7xl mx-auto py-16 px-4 bg-white rounded-lg shadow-lg my-12 flex flex-col md:flex-row items-center gap-12">
          {benefitsSection.imageUrl && (
            <div className="w-full md:w-1/2 flex justify-center">
              <Image
                src={benefitsSection.imageUrl}
                alt={benefitsSection.alt || benefitsSection.title || "Hydrogen Water Benefits Image"}
                width={500}
                height={500}
                className="rounded-lg shadow-md object-contain"
              />
            </div>
          )}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{benefitsSection.title}</h2>
            <div className="text-gray-700 text-lg leading-relaxed">
              <PortableText value={benefitsSection.description} />
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center py-12 text-gray-600 text-lg">Benefits section could not be loaded.</div>
      )}
    </>
  );
}
