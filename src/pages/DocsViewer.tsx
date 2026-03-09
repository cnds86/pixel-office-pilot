import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, List, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SYSTEM_ARCHITECTURE_CONTENT } from "@/data/systemArchitectureDoc";
import { generateToc, countMatches, TocItem } from "@/components/docs/types";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SearchBar } from "@/components/docs/SearchBar";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer";

const DocsViewer = () => {
  const toc = useMemo(() => generateToc(SYSTEM_ARCHITECTURE_CONTENT), []);
  const [activeId, setActiveId] = useState("");
  const [showToc, setShowToc] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const matchCount = useMemo(() => countMatches(SYSTEM_ARCHITECTURE_CONTENT, searchQuery), [searchQuery]);

  // Build breadcrumb trail from active heading
  const breadcrumbTrail = useMemo(() => {
    if (!activeId) return [];
    const idx = toc.findIndex((item) => item.id === activeId);
    if (idx === -1) return [];
    const trail: TocItem[] = [toc[idx]];
    const currentLevel = toc[idx].level;
    // Walk backwards to find parent headings
    for (let i = idx - 1; i >= 0; i--) {
      if (toc[i].level < (trail[0]?.level ?? currentLevel)) {
        trail.unshift(toc[i]);
      }
      if (trail[0]?.level === 1) break;
    }
    return trail;
  }, [activeId, toc]);

  const filteredToc = useMemo(() => {
    if (!searchQuery.trim()) return toc;
    const q = searchQuery.toLowerCase();
    return toc.filter((item) => item.title.toLowerCase().includes(q));
  }, [toc, searchQuery]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  // Highlight matches in DOM
  const highlightMatches = useCallback(() => {
    if (!contentRef.current) return;

    contentRef.current.querySelectorAll("mark[data-search-highlight]").forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
        parent.normalize();
      }
    });

    if (!searchQuery.trim()) return;

    const walker = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    const q = searchQuery.toLowerCase();
    let globalIdx = 0;

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || "";
      const lower = text.toLowerCase();
      let startIdx = 0;
      const ranges: { start: number; end: number; idx: number }[] = [];

      while ((startIdx = lower.indexOf(q, startIdx)) !== -1) {
        ranges.push({ start: startIdx, end: startIdx + q.length, idx: globalIdx++ });
        startIdx += q.length;
      }

      if (ranges.length === 0) return;

      const frag = document.createDocumentFragment();
      let lastEnd = 0;

      ranges.forEach((r) => {
        if (r.start > lastEnd) {
          frag.appendChild(document.createTextNode(text.slice(lastEnd, r.start)));
        }
        const mark = document.createElement("mark");
        mark.setAttribute("data-search-highlight", "true");
        mark.setAttribute("data-match-index", String(r.idx));
        mark.className =
          r.idx === currentMatch
            ? "bg-primary/40 text-primary-foreground rounded px-0.5"
            : "bg-yellow-500/30 text-foreground rounded px-0.5";
        mark.textContent = text.slice(r.start, r.end);
        frag.appendChild(mark);
        lastEnd = r.end;
      });

      if (lastEnd < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastEnd)));
      }

      textNode.parentNode?.replaceChild(frag, textNode);
    });
  }, [searchQuery, currentMatch]);

  useEffect(() => {
    highlightMatches();
  }, [highlightMatches]);

  useEffect(() => {
    if (!searchQuery.trim() || !contentRef.current) return;
    const active = contentRef.current.querySelector(`mark[data-match-index="${currentMatch}"]`);
    active?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentMatch, searchQuery]);

  const goToNextMatch = () => {
    if (matchCount > 0) setCurrentMatch((prev) => (prev + 1) % matchCount);
  };

  const goToPrevMatch = () => {
    if (matchCount > 0) setCurrentMatch((prev) => (prev - 1 + matchCount) % matchCount);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearchQuery("");
        setCurrentMatch(0);
      }
      if (e.key === "Enter" && showSearch && searchQuery) {
        if (e.shiftKey) goToPrevMatch();
        else goToNextMatch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch, searchQuery, matchCount]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
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
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-pixel text-foreground">Documentation</h1>
              <p className="text-sm text-muted-foreground">System Architecture & Technical Reference</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) { setSearchQuery(""); setCurrentMatch(0); }
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                showSearch ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
            <button
              onClick={() => setShowToc(!showToc)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <List className="h-3.5 w-3.5" />
              {showToc ? "Hide" : "Show"} TOC
            </button>
          </div>
        </div>

        {showSearch && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentMatch(0); }}
            currentMatch={currentMatch}
            matchCount={matchCount}
            onNext={goToNextMatch}
            onPrev={goToPrevMatch}
            onClear={() => { setSearchQuery(""); setCurrentMatch(0); }}
          />
        )}

        <div className="flex gap-4">
          {showToc && (
            <TableOfContents
              items={filteredToc}
              activeId={activeId}
              searchQuery={searchQuery}
              onSelect={scrollToSection}
            />
          )}

          <Card className="border-primary/20 flex-1 min-w-0">
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div ref={contentRef}>
                  <MarkdownRenderer content={SYSTEM_ARCHITECTURE_CONTENT} />
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
