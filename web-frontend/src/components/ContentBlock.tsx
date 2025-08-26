'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';                // ★ NEW

import type { ContentBlock as BaseContentBlock } from '@/lib/api';

/* ---------- lazy PortableText (moves 70 kB out of main bundle) ---------- */
const PortableText = dynamic(
  () => import('@portabletext/react').then((m) => m.PortableText),
  { ssr: false, loading: () => <p>Loading…</p> }
);                                                 // ★ NEW

/* ---------- types ------------------------------------------------------- */
interface ExtendedContentBlock extends BaseContentBlock {
  productSlug?: string;            // optional link to a product page
}

interface ContentBlockProps {
  data: ExtendedContentBlock;
}

/* ---------- component --------------------------------------------------- */
export default function ContentBlock({ data }: ContentBlockProps) {
  const {
    title,
    subtitle,
    description,
    imageUrl,
    alt,
    imageLeft,
    callToActionText,
    callToActionUrl,
    productSlug,
  } = data;

  return (
    <section className="flex flex-col md:flex-row items-center mb-16">
      {/* ---------- image ---------- */}
      {imageUrl && (
        <div
          className={`w-full md:w-1/2 mb-8 md:mb-0 ${
            imageLeft ? 'md:order-1 md:pl-8' : 'md:pr-8'
          }`}
        >
          {/* If productSlug is provided, wrap the image in a Link */}
          {productSlug ? (
            <Link href={`/products/${productSlug}`}>
              <Image
                src={imageUrl}
                alt={alt || title}
                width={800}
                height={500}
                className="rounded-xl object-cover hover:opacity-90 transition"
              />
            </Link>
          ) : (
            <Image
              src={imageUrl}
              alt={alt || title}
              width={800}
              height={500}
              className="rounded-xl object-cover"
            />
          )}
        </div>
      )}

      {/* ---------- text ---------- */}
      <div className="w-full md:w-1/2 text-center md:text-left">
        {subtitle && (
          <p className="text-primary font-semibold text-lg mb-2">{subtitle}</p>
        )}

        <h2 className="text-4xl font-bold text-gray-900 mb-6">{title}</h2>

        <div className="text-gray-700 text-lg leading-relaxed mb-6">
          <PortableText value={description} />
        </div>

        {callToActionText && callToActionUrl && (
          <Link
            href={callToActionUrl}
            className="inline-block bg-primary text-white font-semibold px-8 py-4
                       rounded-full shadow-lg hover:bg-opacity-90 transition
                       ease-in-out duration-300 transform hover:scale-105"
          >
            {callToActionText}
          </Link>
        )}
      </div>
    </section>
  );
}
