import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { client, urlFor } from '@/sanity/client';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import type { Metadata } from 'next';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import InlineImage from '@/components/InlineImage';
import Link from 'next/link';

interface Post {
  _id: string;
  title: {
    ca?: string;
    es?: string;
    en?: string;
    ar?: string;
    ur?: string;
  };
  excerpt?: {
    ca?: string;
    es?: string;
    en?: string;
    ar?: string;
    ur?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mainImage?: any;
  publishedAt: string;
  author?: string;
  attachment?: {
    asset?: {
      url?: string;
    };
  };
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const post = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        excerpt,
        body,
        mainImage,
        publishedAt,
        author,
        attachment { asset->{ url } }
      }`,
      { slug }
    );
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const title = post.title?.[locale as keyof typeof post.title] || post.title?.ca || 'AFA Bernat Desclot';
  const description = post.excerpt?.[locale as keyof typeof post.excerpt] || post.excerpt?.ca || 'Asociación de Familias de Alumnos del colegio Bernat Desclot';
  
  // Get image URL from Sanity - ensure it's absolute
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://afaescolabernatdesclot.org';
  let imageUrl = post.mainImage 
    ? urlFor(post.mainImage).width(1200).height(630).format('jpg').quality(90).url()
    : `${baseUrl}/logo.webp`;
  
  // Ensure image URL is absolute for social media
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `${baseUrl}${imageUrl}`;
  }

  const url = `${baseUrl}/${locale}/blog/${slug}`;

  return {
    title: `${title} | AFA Bernat Desclot`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'AFA Bernat Desclot',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@AFABernatDesclot',
    },
    metadataBase: new URL(baseUrl),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  const t = await getTranslations('blog');

  if (!post) {
    notFound();
  }

  const title = post.title?.[locale as keyof typeof post.title] || post.title?.ca || '';
  const rawBody: unknown[] = post.body?.[locale] || post.body?.ca || [];
  // Sanitize body: ensure all span nodes have a text field (required by @portabletext/react)
  const body = rawBody.map((block) => {
    if (
      block !== null &&
      typeof block === 'object' &&
      (block as Record<string, unknown>)._type === 'block' &&
      Array.isArray((block as Record<string, unknown>).children)
    ) {
      const b = block as Record<string, unknown>;
      return {
        ...b,
        children: (b.children as unknown[]).map((child) => {
          if (
            child !== null &&
            typeof child === 'object' &&
            (child as Record<string, unknown>)._type === 'span' &&
            (child as Record<string, unknown>).text === undefined
          ) {
            return { ...(child as Record<string, unknown>), text: '' };
          }
          return child;
        }),
      };
    }
    return block;
  });
  const date = new Date(post.publishedAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const attachmentUrl = post.attachment?.asset?.url;

  // Custom components for PortableText
  const portableTextComponents = {
    types: {
      youtube: YouTubeEmbed,
      inlineImage: InlineImage,
    },
  };

  return (
    <>
      <Navigation locale={locale} />
      <main className={styles.main}>
        <article className={styles.article}>
          <div className={styles.container}>
            <header className={styles.header}>
              <time className={styles.date}>{date}</time>
              <h1>{title}</h1>
            </header>

            {post.mainImage && (
              <div className={styles.imageWrapper}>
                <Image
                  src={urlFor(post.mainImage).width(1200).height(800).url()}
                  alt={title}
                  width={1200}
                  height={800}
                  className={styles.image}
                  priority
                />
              </div>
            )}

            {attachmentUrl && (
              <div className={styles.attachmentBanner}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <Link href={attachmentUrl} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                  {t('downloadPdf')}
                </Link>
              </div>
            )}

            <div className={styles.content}>
              <PortableText value={body as Parameters<typeof PortableText>[0]['value']} components={portableTextComponents} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
