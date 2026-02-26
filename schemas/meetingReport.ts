import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'meetingReport',
  title: 'Actes de Reunió',
  type: 'document',
  fields: [
    defineField({
      name: 'actaNumber',
      title: "Número d'acta",
      type: 'string',
      description: "Identificador únic de l'acta (ex: 001, 2024-A1, etc.)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Títol de la reunió',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'meetingDate',
      title: 'Data de la reunió',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attendees',
      title: 'Assistents',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'studentName', type: 'string', title: "Nom de l'alumne/a" },
            { name: 'course', type: 'string', title: 'Curs' },
            { name: 'attendantName', type: 'string', title: "Nom de l'assistent" },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'content',
      title: 'Contingut de la reunió (HTML)',
      type: 'text',
      description: 'Contingut amb format HTML (negritas, cursivas, llistes, etc.)',
      rows: 15,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'signerName',
      title: 'Nom del signant',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'signerRole',
      title: 'Rol del signant',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Estat',
      type: 'string',
      options: {
        list: [
          { title: 'Esborrany', value: 'draft' },
          { title: 'Tancat', value: 'closed' },
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Data de creació',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'closedAt',
      title: 'Data de tancament',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      actaNumber: 'actaNumber',
      date: 'meetingDate',
      status: 'status',
    },
    prepare(selection) {
      const { title, actaNumber, date, status } = selection
      const numberPrefix = actaNumber ? `[${actaNumber}] ` : ''
      return {
        title: `${numberPrefix}${title}`,
        subtitle: `${date ? new Date(date).toLocaleDateString('ca-ES') : 'Sense data'} - ${status === 'draft' ? '📝 Esborrany' : '✅ Tancat'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Data de reunió (més recent primer)',
      name: 'meetingDateDesc',
      by: [{ field: 'meetingDate', direction: 'desc' }],
    },
  ],
})
