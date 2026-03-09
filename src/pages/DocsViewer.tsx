import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { BookOpen, List, ChevronRight, Search, X, ArrowUp, ArrowDown, Copy, Check } from "lucide-react";
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

// Search: find all line-based matches
function searchContent(markdown: string, query: string): number {
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

const DocsViewer = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toc = generateToc(SYSTEM_ARCHITECTURE_CONTENT);
  const [activeId, setActiveId] = useState<string>("");
  const [showToc, setShowToc] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const matchCount = useMemo(
    () => searchContent(SYSTEM_ARCHITECTURE_CONTENT, searchQuery),
    [searchQuery]
  );

  // Filter TOC items based on search
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

    // Clear existing highlights
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

  // Scroll to current match
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

  // Keyboard shortcut: Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
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
                if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 50);
                else { setSearchQuery(""); setCurrentMatch(0); }
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                showSearch
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground"
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

        {/* Search Bar */}
        {showSearch && (
          <Card className="border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentMatch(0); }}
                  placeholder="ค้นหาในเอกสาร... (Ctrl+F)"
                  className="h-8 text-sm border-none bg-transparent focus-visible:ring-0 px-0"
                />
                {searchQuery && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : "0 results"}
                    </Badge>
                    <button onClick={goToPrevMatch} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Previous (Shift+Enter)">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={goToNextMatch} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Next (Enter)">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setSearchQuery(""); setCurrentMatch(0); }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          {/* Table of Contents */}
          {showToc && (
            <Card className="border-primary/20 w-64 shrink-0 hidden md:block">
              <CardContent className="p-0">
                <div className="p-3 border-b border-border">
                  <p className="text-xs font-pixel font-semibold text-primary uppercase tracking-wider">
                    Table of Contents
                    {searchQuery && (
                      <span className="text-muted-foreground font-normal ml-1">
                        ({filteredToc.length})
                      </span>
                    )}
                  </p>
                </div>
                <ScrollArea className="h-[calc(100vh-240px)]">
                  <nav className="p-2 space-y-0.5">
                    {filteredToc.map((item) => (
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
                    {filteredToc.length === 0 && searchQuery && (
                      <p className="text-xs text-muted-foreground text-center py-4">ไม่พบหัวข้อที่ตรงกัน</p>
                    )}
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
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeString = String(children).replace(/\n$/, "");
                          if (match) {
                            return (
                              <div className="relative group not-prose my-4">
                                <div className="flex items-center justify-between px-4 py-2 bg-muted border border-border rounded-t-lg">
                                  <span className="text-[11px] font-pixel text-muted-foreground uppercase">{match[1]}</span>
                                  <button
                                    onClick={() => handleCopyCode(codeString)}
                                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {copiedCode === codeString ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    {copiedCode === codeString ? "Copied!" : "Copy"}
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  customStyle={{
                                    margin: 0,
                                    borderTopLeftRadius: 0,
                                    borderTopRightRadius: 0,
                                    borderBottomLeftRadius: "0.5rem",
                                    borderBottomRightRadius: "0.5rem",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }
                          return <code className={className} {...props}>{children}</code>;
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
