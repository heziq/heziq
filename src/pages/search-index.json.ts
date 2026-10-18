import { getCollection } from 'astro:content';
import { noteHref } from '../lib/site';

export async function GET() {
  const notes = await getCollection('notes');
  const index = notes.map((note) => ({
    title: note.data.title,
    description: note.data.description,
    category: note.data.category,
    tags: note.data.tags,
    url: noteHref(note),
    text: (note.body ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]*>|[#*_`|>[\](){}]/g, ' ').replace(/\s+/g, ' ').trim(),
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
