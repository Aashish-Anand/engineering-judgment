export type TopicMeta = {
  slug: string;
  category: string;
  categorySlug: string;
  difficulty: string;
  title: string;
  subtitle: string;
  tags: string[];
  readingTime: string;
};

export type TocItem = {
  id: string;
  label: string;
};

export type RelatedTopicData = {
  title: string;
  category: string;
  href?: string;
};

export type TimelinePhaseData = {
  number: string;
  title: string;
  description: string;
  details?: string[];
};

export type LevelData = {
  title: string;
  description: string;
  items: string[];
};

export type ExpandableQA = {
  question: string;
  answer: string;
};
