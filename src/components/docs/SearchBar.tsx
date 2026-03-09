import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, ArrowUp, ArrowDown } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentMatch: number;
  matchCount: number;
  onNext: () => void;
  onPrev: () => void;
  onClear: () => void;
}

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  currentMatch,
  matchCount,
  onNext,
  onPrev,
  onClear,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Card className="border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาในเอกสาร... (Ctrl+F)"
            className="h-8 text-sm border-none bg-transparent focus-visible:ring-0 px-0"
          />
          {searchQuery && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : "0 results"}
              </Badge>
              <button onClick={onPrev} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Previous (Shift+Enter)">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button onClick={onNext} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Next (Enter)">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button onClick={onClear} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
