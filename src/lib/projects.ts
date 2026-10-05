export interface Project {
  title: string;
  description: string;
  tags: string[];
  github?: string;
  image?: string;
  detail?: string;
}

export const projects: Project[] = [
  { title: 'AlgoShelf Cloud', description: 'A home for algorithm practice, patterns, and progress.', tags: ['Software engineering', 'Algorithms'] },
  { title: 'Agent / Runtime Recovery', description: 'Exploring how agents recover from failures in long-running workflows.', tags: ['AI agents', 'Research'] },
  { title: 'Lab Knowledge Platform', description: 'Making research knowledge easier to find, share, and build on.', tags: ['Knowledge systems', 'Full stack'] },
  { title: 'Graphics / Computer Vision', description: 'Selected experiments in rendering and visual understanding.', tags: ['Graphics', 'Computer vision'] },
];
