import { defineType } from 'sanity'

export default defineType({
  name: 'inlineImage',
  title: 'Imatge',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'string',
      title: 'Text alternatiu',
      description: 'Descripció de la imatge per a accessibilitat (SEO)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'caption',
      type: 'string',
      title: 'Peu de foto',
      description: 'Text que apareixerà sota la imatge (opcional)',
    },
  ],
  preview: {
    select: {
      alt: 'alt',
      caption: 'caption',
      asset: 'asset',
    },
    prepare({ alt, caption, asset }) {
      return {
        title: alt || 'Imatge sense descripció',
        subtitle: caption || 'Imatge inline',
        media: asset,
      }
    },
  },
})
