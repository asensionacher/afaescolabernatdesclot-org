import { defineField, defineType } from 'sanity'

export const localeString = {
  name: 'localeString',
  title: 'Localized String',
  type: 'object',
  fields: [
    { name: 'ca', type: 'string', title: 'Català' },
    { name: 'es', type: 'string', title: 'Castellà' },
    { name: 'en', type: 'string', title: 'Anglès' },
    { name: 'ar', type: 'string', title: 'Àrab' },
    { name: 'ur', type: 'string', title: 'Urdú' },
  ],
}

export const localeText = {
  name: 'localeText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    { name: 'ca', type: 'text', title: 'Català', rows: 4 },
    { name: 'es', type: 'text', title: 'Castellà', rows: 4 },
    { name: 'en', type: 'text', title: 'Anglès', rows: 4 },
    { name: 'ar', type: 'text', title: 'Àrab', rows: 4 },
    { name: 'ur', type: 'text', title: 'Urdú', rows: 4 },
  ],
}

export const localeBlockContent = {
  name: 'localeBlockContent',
  title: 'Localized Block Content',
  type: 'object',
  fields: [
    {
      name: 'ca',
      type: 'array',
      title: 'Català',
      of: [
        { type: 'block' },
        { type: 'inlineImage' },
        { type: 'youtube' },
      ],
    },
    {
      name: 'es',
      type: 'array',
      title: 'Castellà',
      of: [
        { type: 'block' },
        { type: 'inlineImage' },
        { type: 'youtube' },
      ],
    },
    {
      name: 'en',
      type: 'array',
      title: 'Anglès',
      of: [
        { type: 'block' },
        { type: 'inlineImage' },
        { type: 'youtube' },
      ],
    },
    {
      name: 'ar',
      type: 'array',
      title: 'Àrab',
      of: [
        { type: 'block' },
        { type: 'inlineImage' },
        { type: 'youtube' },
      ],
    },
    {
      name: 'ur',
      type: 'array',
      title: 'Urdú',
      of: [
        { type: 'block' },
        { type: 'inlineImage' },
        { type: 'youtube' },
      ],
    },
  ],
}

export default defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.ca',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'startDate',
      title: 'Fecha de inicio',
      type: 'datetime',
      description: 'Fecha y hora de inicio del evento',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Fecha de fin',
      type: 'datetime',
      description: 'Fecha y hora de finalización del evento. Si es igual a la fecha de inicio, se mostrará como evento de todo el día.',
      validation: (Rule) => Rule.required().custom((endDate, context) => {
        const startDate = (context.document as any)?.startDate;
        if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
          return 'La fecha de fin debe ser igual o posterior a la fecha de inicio';
        }
        return true;
      }),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description: 'Fecha de publicación del evento (para control interno)',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'localeText',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description: 'Link externo para el evento (opcional). Si se proporciona, al hacer clic en el evento se abrirá esta URL en una nueva pestaña.',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https']
      })
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'localeBlockContent',
    }),
  ],
  preview: {
    select: {
      title: 'title.ca',
      media: 'mainImage',
      date: 'startDate',
    },
    prepare(selection) {
      const { title, media, date } = selection
      return {
        title: title,
        subtitle: date ? new Date(date).toLocaleDateString('ca-ES') : 'No date',
        media: media,
      }
    },
  },
})
