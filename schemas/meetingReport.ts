import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'meetingReport',
  title: 'Partes de Reunión',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título de la reunión',
      type: 'string',
      description: 'Ej: REUNIÓ PROPOSTES I VOTACIÓ DISFRESSA',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Ubicación',
      type: 'string',
      description: 'Ej: RUA CARNAVAL 2026',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'meetingDate',
      title: 'Fecha de la reunión',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'meetingTime',
      title: 'Hora de la reunión',
      type: 'string',
      description: 'Ej: 16:45',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'meetingPlace',
      title: 'Lugar de la reunión',
      type: 'string',
      description: 'Ej: biblioteca de l\'Escola Bernat Desclot',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attendees',
      title: 'Asistentes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'studentName', type: 'string', title: 'Nombre del alumno/a' },
            { name: 'course', type: 'string', title: 'Curso' },
            { name: 'attendantName', type: 'string', title: 'Nombre del asistente' },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'convocationInfo',
      title: 'Información de convocatoria',
      type: 'text',
      description: 'Texto de convocatoria previa',
      rows: 3,
    }),
    defineField({
      name: 'welcomeMessage',
      title: 'Mensaje de bienvenida',
      type: 'text',
      description: 'Mensaje inicial en cursiva',
      rows: 3,
    }),
    defineField({
      name: 'topics',
      title: 'Temas de disfressa',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Lista de temas valorados para disfressa',
    }),
    defineField({
      name: 'content',
      title: 'Contenido de la reunión',
      type: 'text',
      description: 'Desarrollo de la reunión',
      rows: 10,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'questions',
      title: '¿Hubo preguntas?',
      type: 'boolean',
      description: 'Marcar si hubo preguntas por parte de los asistentes',
      initialValue: false,
    }),
    defineField({
      name: 'signerName',
      title: 'Nombre del firmante',
      type: 'string',
      description: 'Ej: Elena Gómez',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'signerRole',
      title: 'Rol del firmante',
      type: 'string',
      description: 'Ej: Vicepresidenta AMPA',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Borrador', value: 'draft' },
          { title: 'Cerrado', value: 'closed' },
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Fecha de creación',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'closedAt',
      title: 'Fecha de cierre',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'meetingDate',
      status: 'status',
    },
    prepare(selection) {
      const { title, date, status } = selection
      return {
        title: title,
        subtitle: `${date ? new Date(date).toLocaleDateString('ca-ES') : 'Sin fecha'} - ${status === 'draft' ? '📝 Borrador' : '✅ Cerrado'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Fecha de reunión (más reciente primero)',
      name: 'meetingDateDesc',
      by: [{ field: 'meetingDate', direction: 'desc' }],
    },
    {
      title: 'Fecha de reunión (más antigua primero)',
      name: 'meetingDateAsc',
      by: [{ field: 'meetingDate', direction: 'asc' }],
    },
  ],
})
