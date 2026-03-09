import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TocItem } from "./types";

interface TableOfContentsProps {
  items: TocItem[];
  activeId: string;
  searchQuery: string;
  onSelect: (id: string) => void;
}

export const TableOfContents = ({ items, activeId, searchQuery, onSelect }: TableOfContentsProps) => {
  return (
    <Card className="border-primary/20 w-64 shrink-0 hidden md:block">
      <CardContent className="p-0">
        <div className="p-3 border-b border-border">
          <p className="text-xs font-pixel font-semibold text-primary uppercase tracking-wider">
            Table of Contents
            {searchQuery && (
              <span className="text-muted-foreground font-normal ml-1">({items.length})</span>
            )}
          </p>
        </div>
        <ScrollArea className="h-[calc(100vh-240px)]">
          <nav className="p-2 space-y-0.5">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
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
            {items.length === 0 && searchQuery && (
              <p className="text-xs text-muted-foreground text-center py-4">ไม่พบหัวข้อที่ตรงกัน</p>
            )}
          </nav>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
