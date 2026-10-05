import type { CollectionEntry } from 'astro:content';

export const categories = ['Algorithms', 'Systems', 'AI / Agents', 'Research', 'Graphics / CV'] as const;

export const categorySlug = (category: string) => category.toLowerCase().replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-');
export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const noteHref = (note: CollectionEntry<'notes'>) => href(`notes/${note.id}/`);
export const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
export const newestFirst = (a: CollectionEntry<'notes'>, b: CollectionEntry<'notes'>) => b.data.date.valueOf() - a.data.date.valueOf();
export const tagSlug = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
