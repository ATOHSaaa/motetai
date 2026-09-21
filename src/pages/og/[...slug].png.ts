import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../../config/site';
import { categories, getCategoryName } from '../../utils/category';
import { generateOgImage, type OgImageInput } from '../../utils/og-image';

export const GET: APIRoute = async ({ props }) => {
  const input = props as OgImageInput;
  const png = await generateOgImage(input);

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

export async function getStaticPaths() {
  const articles = await getCollection('articles');

  const pages: Array<{ slug: string; props: OgImageInput }> = [
    {
      slug: 'default',
      props: {
        title: siteConfig.name,
        description: siteConfig.description,
      },
    },
    {
      slug: 'about',
      props: {
        title: '運営者情報',
        description: 'motetaiの運営者情報・編集方針について',
      },
    },
    {
      slug: 'articles',
      props: {
        title: '記事一覧',
        description: '婚活・恋愛・マッチングアプリ・見た目改善の記事一覧。男性向けにわかりやすく解説しています。',
        label: '記事',
      },
    },
    {
      slug: 'ranking',
      props: {
        title: '人気記事ランキング',
        description: 'motetaiの人気記事ランキング。マッチングアプリ・婚活・見た目改善のおすすめ記事をまとめました。',
        label: 'ランキング',
      },
    },
    {
      slug: 'diagnosis/maiari',
      props: {
        title: '脈あり度診断',
        description:
          '10個の質問に答えるだけで、気になる相手の脈あり度を診断。LINE・デート・会話のサインをもとに、論理的に好意度をチェックできます。',
        label: '無料診断',
      },
    },
    ...categories.map((category) => ({
      slug: `category/${category.slug}`,
      props: {
        title: category.name,
        description: category.description,
        label: category.name,
      },
    })),
    ...articles.map((article) => ({
      slug: `articles/${article.id}`,
      props: {
        title: article.data.title,
        description: article.data.description,
        label: getCategoryName(article.data.category),
      },
    })),
  ];

  return pages.map(({ slug, props }) => ({
    params: { slug },
    props,
  }));
}
