import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const router = useRouter()

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <main className={styles.postContainer}>
        <img src={post.data.banner.url} alt="banner post" />

        <section>
          <header>
            <h1>{post.data.title}</h1>
            <div className={styles.postInfo}>
              <span>
                <FiCalendar />
                {format(new Date(post.first_publication_date),
                  'dd MMM uuuu',
                  {
                    locale: ptBR
                  }
                )}
              </span>
              <span>
                <FiUser />
                {post.data.author}
              </span>
              <span>
                <FiClock />
                4 min
              </span>
            </div>
          </header>

          <div className={styles.postContent}>

            {post.data.content.map(content => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                <div className={styles.postContentParagraphs}>
                  <div dangerouslySetInnerHTML={{ __html: String(content.body) }} />
                  <div>{RichText.asText(content.body)}</div>
                </div>
              </div>
            ))}

          </div>
        </section>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post', {
    pageSize: 4
  });

  const paths = await posts.results.map((post) => ({
    params: { slug: post.uid }
  }))

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(params.slug))

  // const post = {
  //   first_publication_date: format(
  //     new Date(response.first_publication_date),
  //     'dd MMM uuuu',
  //     {
  //       locale: ptBR
  //     }
  //   ),
  //   data: {
  //     title: RichText.asText(response.data.title),
  //     banner: {
  //       url: response.data.banner.url,
  //     },
  //     author: RichText.asText(response.data.author),
  //     content: response.data.content.map(teste => {
  //       return {
  //         heading: RichText.asText(teste.heading),
  //         body: RichText.asHtml(teste.body)
  //       }
  //     })
  //   },
  // }

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(teste => {
        return {
          heading: teste.heading,
          body: teste.body
        }
      })
    },
  }

  return {
    props: {
      post
    },
    revalidate: 1 // 24 hours
  }
};