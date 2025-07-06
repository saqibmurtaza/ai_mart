// sanity_studio/ecommerceaiassistant/schemaTypes/homepageSection.ts

// Import the specific Rule type from Sanity's client
// You might need to install this if you haven't already: npm install @sanity/types
// (Though typically it comes with your Sanity project's node_modules)

import { defineType, defineField, PreviewValue, PrepareViewOptions } from 'sanity';


export default defineType({
  name: 'homepageSection',
  title: 'Homepage Section',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      // Explicitly type 'Rule'
      validation: (Rule) => Rule.required(),
    }),
    {
      name: 'description',
      title: 'Description',
      type: 'array', // Use 'array' for Portable Text
      of: [
        {
          type: 'block', // Standard Portable Text block
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            // Add other styles if needed
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }],
            annotations: [],
          },
        },
      ],
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true, // Allows cropping
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
        }),
      ],
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title', // Generate slug from the title
        maxLength: 96,
      },
      // Explicitly type 'Rule'
      validation: (Rule) => Rule.required(),
    },
  ],

preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare(value: Record<string, any>, viewOptions?: PrepareViewOptions): PreviewValue {
      const { title, media } = value; // <<<< DESTRUCTURE HERE
      return {
        title: title,
        media: media,
      };
    },
  },
});

