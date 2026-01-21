import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { client, urlFor } from '@/sanity/client';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import styles from './page.module.css';
import type { Metadata } from 'next';

interface Post {
  _id: string;
  title: {
    ca?: string;
    es?: string;
    en?: string;
    ar?: string;
    ur?: string;
  };
  slug: {
    current: string;
  };
  excerpt?: {
    ca?: string;
    es?: string;
    en?: string;
    ar?: string;
    ur?: string;
  };
  mainImage?: any;
  publishedAt: string;
  author?: string;
}

async function getPosts(): Promise<Post[]> {
  try {
    const posts = await client.fetch(
      `*[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        mainImage,
        publishedAt,
        author
      }`
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  const titles: Record<string, string> = {
    ca: 'Blog - AMPA Bernat Desclot',
    es: 'Blog - AMPA Bernat Desclot',
    en: 'Blog - AMPA Bernat Desclot',
    ar: 'المدونة - AMPA Bernat Desclot',
    ur: 'بلاگ - AMPA Bernat Desclot',
  };

  const descriptions: Record<string, string> = {
    ca: 'Notícies, activitats i esdeveniments de l\'AMPA Bernat Desclot. Mantén-te informat de tot el que passa a la nostra associació!',
    es: 'Noticias, actividades y eventos de la AMPA Bernat Desclot. ¡Mantente informado de todo lo que pasa en nuestra asociación!',
    en: 'News, activities and events from AMPA Bernat Desclot. Stay informed about everything happening in our association!',
    ar: 'أخبار وأنشطة وفعاليات AMPA Bernat Desclot. ابق على اطلاع بكل ما يحدث في جمعيتنا!',
    ur: 'AMPA Bernat Desclot کی خبریں، سرگرمیاں اور تقریبات۔ اپنی انجمن میں ہونے والی ہر چیز سے باخبر رہیں!',
  };

  const title = titles[locale] || titles.ca;
  const description = descriptions[locale] || descriptions.ca;
  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.png`;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${locale}/blog`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'AMPA Bernat Desclot',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'AMPA Bernat Desclot',
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('blog');
  const posts = await getPosts();

  return (
    <>
      <Navigation locale={locale} />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1>{t('title')}</h1>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            {/* <div className={styles.schoolBlogLink}>
              <a
                href="https://agora.xtec.cat/ceip-bernatdesclot/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                🏫 {t('schoolBlog')}
              </a>
            </div> */}

            {posts.length === 0 ? (
              <p className={styles.noEvents}>{t('noEvents')}</p>
            ) : (
              <div className={styles.grid}>
                {posts.map((post) => {
                  const title = post.title?.[locale as keyof typeof post.title] || post.title?.ca || '';
                  const excerpt = post.excerpt?.[locale as keyof typeof post.excerpt] || post.excerpt?.ca || '';
                  const date = new Date(post.publishedAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });

                  return (
                    <article key={post._id} className={styles.eventCard}>
                      {post.mainImage && (
                        <Link href={`/blog/${post.slug.current}`} className={styles.imageWrapper}>
                          <Image
                            src={urlFor(post.mainImage).width(600).height(400).url()}
                            alt={title}
                            width={600}
                            height={400}
                            className={styles.image}
                          />
                        </Link>
                      )}
                      <div className={styles.content}>
                        <time className={styles.date}>{date}</time>
                        <Link href={`/blog/${post.slug.current}`} className={styles.titleLink}>
                          <h2>{title}</h2>
                        </Link>
                        {excerpt && <p>{excerpt}</p>}
                        <Link href={`/blog/${post.slug.current}`} className={styles.readMore}>
                          {t('readMore')} →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
