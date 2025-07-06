import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'promo',
  title: 'Promotional Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'message',
      title: 'Promo Message',
      type: 'string',
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      type: 'url',
    }),
    defineField({
      name: 'active',
      title: 'Is Active',
      type: 'boolean',
    }),
  ],
})
