// import { defineType, defineField, PreviewValue, PrepareViewOptions } from 'sanity';

// export default defineType({
//   name: 'contentBlock',
//   title: 'Content Block (Homepage)',
//   type: 'document',
//   fields: [
//     defineField({ // Use defineField for each field
//       name: 'title',
//       title: 'Title',
//       type: 'string',
//       validation: (Rule) => Rule.required(),
//     }),
//     defineField({ name: 'subtitle', title: 'Subtitle (Optional)', type: 'string', description: 'A shorter heading that appears above the main title.' }),
//     defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }], annotations: [{ name: 'link', type: 'object', title: 'Link', fields: [{ name: 'href', type: 'url', title: 'URL' }] }] } }] }),
//     defineField({
//       name: 'image',
//       title: 'Image',
//       type: 'image',
//       options: { hotspot: true },
//       fields: [defineField({ name: 'alt', title: 'Alternative text', type: 'string', description: 'Important for SEO and accessibility.' })],
//     }),
//     defineField({ name: 'imageLeft', title: 'Image on Left?', type: 'boolean', initialValue: true, description: 'If checked, image appears on left; otherwise, image on right.' }),
//     defineField({ name: 'callToActionText', title: 'Call to Action Button Text (Optional)', type: 'string' }),
//     defineField({ name: 'callToActionUrl', title: 'Call to Action URL (Optional)', type: 'url' }),
//     defineField({
//       name: 'order',
//       title: 'Order',
//       type: 'number',
//       description: 'Determines the display order of sections on the homepage.',
//       validation: (Rule) => Rule.required().integer().min(0),
//     }),
//   ],
//   preview: {
//     select: {
//       title: 'title',
//       subtitle: 'subtitle',
//       media: 'image',
//       imageLeft: 'imageLeft',
//       order: 'order',
//     },
//     // <<<<<<<<<<<< CRITICAL FIX IS HERE >>>>>>>>>>>>>
//     // Accept a single 'value' parameter, then destructure inside.
//     prepare(value: Record<string, any>, viewOptions?: PrepareViewOptions): PreviewValue {
//       const { title, subtitle, media, imageLeft, order } = value; // <<<< DESTRUCTURE HERE
//       const layoutText = imageLeft ? 'Image Left' : 'Image Right';
//       return {
//         title: `${order}. ${title}`,
//         subtitle: `${subtitle || ''} [Layout: ${layoutText}]`,
//         media: media,
//       };
//     },
//   },
// });


import { defineType, defineField, PreviewValue, PrepareViewOptions } from 'sanity';

export default defineType({
  name: 'contentBlock',
  title: 'Content Block (Homepage)',
  type: 'document',
  fields: [
    defineField({ // Use defineField for each field
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'subtitle', title: 'Subtitle (Optional)', type: 'string', description: 'A shorter heading that appears above the main title.' }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }], annotations: [{ name: 'link', type: 'object', title: 'Link', fields: [{ name: 'href', type: 'url', title: 'URL' }] }] } }] }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alternative text', type: 'string', description: 'Important for SEO and accessibility.' })],
    }),
    defineField({ name: 'imageLeft', title: 'Image on Left?', type: 'boolean', initialValue: true, description: 'If checked, image appears on left; otherwise, image on right.' }),
    defineField({ name: 'callToActionText', title: 'Call to Action Button Text (Optional)', type: 'string' }),
    defineField({ name: 'callToActionUrl', title: 'Call to Action URL (Optional)', type: 'url' }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Determines the display order of sections on the homepage.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    // --- MINIMAL ADDITION: New field for referencing one product (implies category) ---
    defineField({
      name: 'featuredProduct',
      title: 'Featured Product',
      type: 'reference',
      to: [{ type: 'product' }],  // Assumes your product schema type is 'product' (common; adjust if different)
      description: 'Select one product from a category to feature in this block. Use the description field for a short explanation.',
       // Keeps it non-required for safety
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'image',
      imageLeft: 'imageLeft',
      order: 'order',
    },
    // <<<<<<<<<<<< CRITICAL FIX IS HERE >>>>>>>>>>>>>
    // Accept a single 'value' parameter, then destructure inside.
    prepare(value: Record<string, any>, viewOptions?: PrepareViewOptions): PreviewValue {
      const { title, subtitle, media, imageLeft, order } = value; // <<<< DESTRUCTURE HERE
      const layoutText = imageLeft ? 'Image Left' : 'Image Right';
      return {
        title: `${order}. ${title}`,
        subtitle: `${subtitle || ''} [Layout: ${layoutText}]`,
        media: media,
      };
    },
  },
});
