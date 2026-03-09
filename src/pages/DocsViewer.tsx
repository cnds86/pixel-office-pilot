import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { BookOpen, List, ChevronRight, Search, X, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SYSTEM_ARCHITECTURE_CONTENT } from "@/data/systemArchitectureDoc";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

function generateToc(markdown: string): TocItem[] {
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

const DocsViewer = () => {
  const toc = generateToc(SYSTEM_ARCHITECTURE_CONTENT);
  const [activeId, setActiveId] = useState<string>("");
  const [showToc, setShowToc] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    const headings = contentRef.current?.querySelectorAll("h1, h2, h3");
    headings?.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-pixel text-foreground">Documentation</h1>
              <p className="text-sm text-muted-foreground">System Architecture & Technical Reference</p>
            </div>
          </div>
          <button
            onClick={() => setShowToc(!showToc)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <List className="h-3.5 w-3.5" />
            {showToc ? "Hide" : "Show"} TOC
          </button>
        </div>

        <div className="flex gap-4">
          {/* Table of Contents */}
          {showToc && (
            <Card className="border-primary/20 w-64 shrink-0 hidden md:block">
              <CardContent className="p-0">
                <div className="p-3 border-b border-border">
                  <p className="text-xs font-pixel font-semibold text-primary uppercase tracking-wider">Table of Contents</p>
                </div>
                <ScrollArea className="h-[calc(100vh-240px)]">
                  <nav className="p-2 space-y-0.5">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded text-xs transition-colors truncate flex items-center gap-1",
                          item.level === 1 && "font-semibold",
                          item.level === 2 && "pl-4",
                          item.level === 3 && "pl-7 text-[11px]",
                          activeId === item.id
                            ? "bg-primary/15 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {activeId === item.id && <ChevronRight className="h-3 w-3 shrink-0" />}
                        <span className="truncate">{item.title}</span>
                      </button>
                    ))}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <Card className="border-primary/20 flex-1 min-w-0">
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div ref={contentRef}>
                  <article className="prose prose-invert max-w-none p-6 md:p-10
                    prose-headings:font-pixel prose-headings:text-foreground
                    prose-h1:text-2xl prose-h1:border-b prose-h1:border-border prose-h1:pb-4
                    prose-h2:text-xl prose-h2:text-primary prose-h2:mt-10
                    prose-h3:text-lg prose-h3:text-accent-foreground
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-pixel-body
                    prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg
                    prose-table:border-collapse
                    prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-foreground prose-th:text-sm
                    prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:text-muted-foreground prose-td:text-sm
                    prose-strong:text-foreground
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                    prose-li:text-muted-foreground
                    prose-hr:border-border
                  ">
                    <ReactMarkdown
                      components={{
                        h1: ({ children, ...props }) => {
                          const text = String(children).replace(/[`*_~]/g, "");
                          const id = text.toLowerCase().replace(/[^\w\s\u0E00-\u0E7F-]/g, "").replace(/\s+/g, "-").trim();
                          return <h1 id={id} {...props}>{children}</h1>;
                        },
                        h2: ({ children, ...props }) => {
                          const text = String(children).replace(/[`*_~]/g, "");
                          const id = text.toLowerCase().replace(/[^\w\s\u0E00-\u0E7F-]/g, "").replace(/\s+/g, "-").trim();
                          return <h2 id={id} {...props}>{children}</h2>;
                        },
                        h3: ({ children, ...props }) => {
                          const text = String(children).replace(/[`*_~]/g, "");
                          const id = text.toLowerCase().replace(/[^\w\s\u0E00-\u0E7F-]/g, "").replace(/\s+/g, "-").trim();
                          return <h3 id={id} {...props}>{children}</h3>;
                        },
                      }}
                    >
                      {SYSTEM_ARCHITECTURE_CONTENT}
                    </ReactMarkdown>
                  </article>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DocsViewer;
