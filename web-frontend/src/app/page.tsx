import Link from 'next/link';
import Image from 'next/image';
import { getContentBlocks, getCategories, getFeaturedProducts } from '@/lib/api';
import ContentBlockComponent from '@/components/ContentBlock';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import { Metadata } from 'next';
import { getSiteSettings } from "@/lib/api"; // create this helper

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const ogImageUrl =
    settings?.seoImage ||
    "https://curated-shop-australia.vercel.app/images/default-thumbnail.jpg";

  return {
    title: settings?.title || "Curated Shop Australia",
    description: settings?.description || "Discover curated products.",
    openGraph: {
      title: settings?.title || "Curated Shop Australia",
      description: settings?.description || "Discover curated products.",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 628,
          alt: "Curated Shop Banner",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.title || "Curated Shop Australia",
      description: settings?.description || "Discover curated products.",
      images: [ogImageUrl],
    },
  };
}



export default async function HomePage() {
  const [contentBlocks, categories, featuredProducts] = await Promise.all([
    getContentBlocks().catch(e => { console.error("Failed to fetch content blocks:", e); return []; }),
    getCategories().catch(e => { console.error("Failed to fetch categories:", e); return []; }),
    getFeaturedProducts().catch(e => { console.error("Failed to fetch featured products:", e); return []; }),
  ]);

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
          {categories.length > 0 ? (
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
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} isPriority={index < 4} />
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
          {contentBlocks.length > 0 ? (
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
