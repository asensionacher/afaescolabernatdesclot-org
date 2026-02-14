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
  body?: {
    ca?: any[];
    es?: any[];
    en?: any[];
    ar?: any[];
    ur?: any[];
  };
  mainImage?: any;
  publishedAt: string;
  author?: string;
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
        author
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

  if (!post) {
    notFound();
  }

  const title = post.title?.[locale as keyof typeof post.title] || post.title?.ca || '';
  const body = post.body?.[locale as keyof typeof post.body] || post.body?.ca || [];
  const date = new Date(post.publishedAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

            <div className={styles.content}>
              <PortableText value={body} components={portableTextComponents} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
