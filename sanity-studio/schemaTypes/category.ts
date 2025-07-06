import { Rule, defineType, defineField } from 'sanity';
import { PreviewValue, PrepareViewOptions } from 'sanity';

export default defineType({
  name: 'category',
  title: 'Product Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "Bottles", "Shilajit", "Premium Pillows"'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
      description: 'Used in URLs (e.g., /products?category=bottles)'
    }),
    defineField({
      name: 'description',
      title: 'Description (Optional)',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }] } }],
      description: 'A brief description of this category for SEO or display.'
    }),
    defineField({
      name: 'image',
      title: 'Category Image / Icon',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alternative text', description: 'Important for SEO and accessibility (e.g., "Illustration of a water bottle for the Bottles category").' })],
      description: 'An image or icon to represent this category on the homepage.'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Determines the order categories appear on the homepage.',
      validation: (Rule) => Rule.required().integer().min(0),
      initialValue: 0,
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      media: 'image',
      order: 'order'
    },
    // <<<<<<<<<<<< CRITICAL FIX IS HERE >>>>>>>>>>>>>
    // Accept a single 'value' parameter, then destructure inside.
    prepare(value: Record<string, any>, viewOptions?: PrepareViewOptions): PreviewValue {
      const { title, subtitle, media, order } = value; // <<<< DESTRUCTURE HERE
      return {
        title: `${order}. ${title}`,
        subtitle: subtitle,
        media: media,
      };
    },
  },
});
