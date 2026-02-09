import Image from 'next/image';
import { urlFor } from '@/sanity/client';
import styles from './InlineImage.module.css';

interface InlineImageProps {
  value: {
    asset: {
      _ref: string;
    };
    alt?: string;
    caption?: string;
  };
}

export default function InlineImage({ value }: InlineImageProps) {
  if (!value?.asset) {
    return null;
  }

  const imageUrl = urlFor(value)
    .width(1200)
    .quality(85)
    .url();

  return (
    <figure className={styles.figure}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={value.alt || ''}
          width={1200}
          height={800}
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
      </div>
      {value.caption && (
        <figcaption className={styles.caption}>{value.caption}</figcaption>
      )}
    </figure>
  );
}
