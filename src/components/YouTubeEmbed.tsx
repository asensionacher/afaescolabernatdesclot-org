import styles from './YouTubeEmbed.module.css';

interface YouTubeEmbedProps {
  value: {
    url: string;
  };
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Handle youtube.com/watch?v=... format
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId || null;
  }
  
  // Handle youtu.be/... format
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId || null;
  }
  
  return null;
}

export default function YouTubeEmbed({ value }: YouTubeEmbedProps) {
  const videoId = getYouTubeVideoId(value.url);

  if (!videoId) {
    return (
      <div className={styles.error}>
        <p>⚠️ Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.videoWrapper}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
