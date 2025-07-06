// sanity_studio/ecommerceaiassistant/schemaTypes/product.ts

import { defineType, defineField, PreviewValue, PrepareViewOptions } from 'sanity';

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string', // This should ideally be a reference to your 'category' schema
      options: {
        list: [ // You can hardcode categories here or fetch them dynamically if using a reference
          { title: 'Bottles', value: 'bottles' },
          { title: 'Shilajit', value: 'shilajit' },
          { title: 'Premium Pillows', value: 'premium-pillows' },
          { title: 'Shoe Charms', value: 'shoe-charms' },
          { title: 'TV Brackets', value: 'tv-brackets' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }),
      ],
    }),
    defineField({
      name: 'stock',
      title: 'Stock Quantity',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).integer(),
      initialValue: 0,
    }),
    // <<<<< ADD THIS NEW FIELD >>>>>
    defineField({
      name: 'isFeatured',
      title: 'Is Featured Product?',
      type: 'boolean',
      description: 'Mark this product to be displayed in the "Featured Products" section on the homepage.',
      initialValue: false,
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Stock Keeping Unit (unique identifier for the product).',
      validation: (Rule) => Rule.required().regex(/^[A-Z0-9-]{3,}$/).error('SKU must be at least 3 characters and contain only uppercase letters, numbers, and hyphens.'),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'mainImage',
    },
    prepare(value: Record<string, any>, viewOptions?: PrepareViewOptions): PreviewValue {
      const { title, subtitle, media } = value;
      return {
        title: title,
        subtitle: subtitle,
        media: media,
      };
    },
  },
});
