'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import type { ContentBlockData } from '@/lib/api'; // Import the interface

interface ContentBlockProps {
  data: ContentBlockData;
}

export default function ContentBlock({ data }: ContentBlockProps) {
  const { title, subtitle, description, imageUrl, alt, imageLeft, callToActionText, callToActionUrl } = data;

  return (
    <section className={`max-w-7xl mx-auto py-16 px-4 bg-white rounded-lg shadow-lg my-12 flex flex-col items-center gap-12 ${imageLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      {/* Image Section */}
      {imageUrl && (
        <div className="w-full md:w-1/2 flex justify-center">
          <Image
            src={imageUrl}
            alt={alt || title || "Content Block Image"}
            width={600} // Adjust width/height as needed for overall block look
            height={400}
            className="rounded-lg shadow-md object-contain"
            sizes="(max-width: 768px) 100vw, 50vw" // Responsive image sizes
            priority={data.order < 30} // Prioritize loading for first few blocks
          />
        </div>
      )}

      {/* Text Content Section */}
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
            className="inline-block bg-primary text-white text-md font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-opacity-90 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {callToActionText}
          </Link>
        )}
      </div>
    </section>
  );
}
