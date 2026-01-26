import { defineType } from 'sanity'

export default defineType({
  name: 'youtube',
  type: 'object',
  title: 'YouTube Video',
  fields: [
    {
      name: 'url',
      type: 'url',
      title: 'YouTube Video URL',
      description: 'Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
      validation: (Rule) =>
        Rule.required().custom((url: string | undefined) => {
          if (!url) return true
          
          // Accept both youtube.com and youtu.be URLs
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/
          
          if (!youtubeRegex.test(url)) {
            return 'Please enter a valid YouTube URL'
          }
          
          return true
        }),
    },
  ],
  preview: {
    select: {
      url: 'url',
    },
    prepare({ url }) {
      if (!url) return { title: 'YouTube Video' }
      
      // Extract video ID for thumbnail
      let videoId = ''
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || ''
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
      }
      
      return {
        title: 'YouTube Video',
        subtitle: videoId ? `Video ID: ${videoId}` : url,
        media: () => '🎥',
      }
    },
  },
})
