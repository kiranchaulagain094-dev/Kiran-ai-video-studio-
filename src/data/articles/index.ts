import { Article } from '../../types/index';
import { CORE_15_CREATOR_GUIDES } from '../creatorGuides';
import { articlesGroup1 } from './group1';
import { articlesGroup2 } from './group2';
import { articlesGroup3 } from './group3';

// Combine the 15 Core Creator Guides with remaining deep reference guides
const additionalGuides = [
  ...articlesGroup1,
  ...articlesGroup2,
  ...articlesGroup3
].filter(
  (art) => !CORE_15_CREATOR_GUIDES.some((core) => core.slug === art.slug || core.title === art.title)
);

export const ALL_ARTICLES: Article[] = [
  ...CORE_15_CREATOR_GUIDES,
  ...additionalGuides
];

export { CORE_15_CREATOR_GUIDES };

export const ARTICLE_CATEGORIES: string[] = [
  'All Guides',
  'Script & Storytelling',
  'Titles & Metadata',
  'Thumbnail & Visuals',
  'Shorts & Social',
  'SEO & Growth',
  'Workflow & Strategy',
  'Beginner Guides'
];

export const getArticleBySlug = (slug: string): Article | undefined => {
  const cleanSlug = slug.toLowerCase().trim();
  return ALL_ARTICLES.find(
    (art) => art.slug.toLowerCase() === cleanSlug || art.id.toLowerCase() === cleanSlug
  );
};

export const getArticleById = (id: string): Article | undefined => {
  return ALL_ARTICLES.find((art) => art.id === id);
};

export const getRelatedArticles = (currentSlug: string, limit: number = 3): Article[] => {
  const current = getArticleBySlug(currentSlug);
  if (!current) return ALL_ARTICLES.slice(0, limit);

  // First try explicitly defined related slugs
  const explicit = current.relatedArticleSlugs
    .map((s) => getArticleBySlug(s))
    .filter((a): a is Article => a !== undefined && a.slug !== current.slug);

  if (explicit.length >= limit) {
    return explicit.slice(0, limit);
  }

  // Fallback: match by category
  const sameCategory = ALL_ARTICLES.filter(
    (a) => a.category === current.category && a.slug !== current.slug && !explicit.some((e) => e.slug === a.slug)
  );

  const combined = [...explicit, ...sameCategory];
  if (combined.length >= limit) {
    return combined.slice(0, limit);
  }

  // If still need more, take other articles
  const others = ALL_ARTICLES.filter(
    (a) => a.slug !== current.slug && !combined.some((c) => c.slug === a.slug)
  );

  return [...combined, ...others].slice(0, limit);
};

export const getPreviousAndNextArticles = (
  currentSlug: string
): { previous?: Article; next?: Article } => {
  const index = ALL_ARTICLES.findIndex(
    (art) => art.slug.toLowerCase() === currentSlug.toLowerCase()
  );
  if (index === -1) return {};

  return {
    previous: index > 0 ? ALL_ARTICLES[index - 1] : undefined,
    next: index < ALL_ARTICLES.length - 1 ? ALL_ARTICLES[index + 1] : undefined
  };
};

export const searchArticles = (
  query: string,
  selectedCategory: string = 'All Guides'
): Article[] => {
  const cleanQuery = query.toLowerCase().trim();

  return ALL_ARTICLES.filter((article) => {
    // Category match
    const categoryMatch =
      selectedCategory === 'All Guides' || article.category === selectedCategory;

    if (!categoryMatch) return false;
    if (!cleanQuery) return true;

    // Search query match across multiple fields
    const titleMatch = article.title.toLowerCase().includes(cleanQuery);
    const englishTitleMatch = article.englishTitle.toLowerCase().includes(cleanQuery);
    const descMatch = article.metaDescription.toLowerCase().includes(cleanQuery);
    const introMatch = article.introduction.toLowerCase().includes(cleanQuery);
    const keywordMatch = article.keywords.some((k) =>
      k.toLowerCase().includes(cleanQuery)
    );
    const topicNumberMatch = String(article.topicNumber) === cleanQuery;

    return (
      titleMatch ||
      englishTitleMatch ||
      descMatch ||
      introMatch ||
      keywordMatch ||
      topicNumberMatch
    );
  });
};
