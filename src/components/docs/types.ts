export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export function generateToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const toc: TocItem[] = [];
  lines.forEach((line) => {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const title = match[2].replace(/[`*_~]/g, "");
      const id = title
        .toLowerCase()
        .replace(/[^\w\s\u0E00-\u0E7F-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
      toc.push({ id, title, level });
    }
  });
  return toc;
}

export function countMatches(markdown: string, query: string): number {
  if (!query.trim()) return 0;
  const lower = markdown.toLowerCase();
  const q = query.toLowerCase();
  let count = 0;
  let idx = 0;
  while ((idx = lower.indexOf(q, idx)) !== -1) {
    count++;
    idx += q.length;
  }
  return count;
}
