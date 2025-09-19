import { getProductBySlug, Product } from '@/lib/api';
import { Metadata } from 'next';
import ProductPageClient from './ProductPageClient';

// This function generates dynamic metadata on the server.
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  // Fallback to a default thumbnail if the product has no image
  const defaultThumbnailUrl = 'https://curated-shop-australia.vercel.app/images/default-thumbnail.jpg';
  const imageUrl = product.imageUrl ? product.imageUrl : defaultThumbnailUrl;

  return {
    title: product.name,
    description: product.description ? product.description : 'No description available.',
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
      type: 'website',
    },
  };
}

// This component fetches the product data and passes it to the client component.
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return <p className="py-10 text-center">Product not found.</p>;
  }

  // Pass the server-fetched data as props to the client component
  return <ProductPageClient product={product} />;
}
