import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const createHeading = (Tag: "h1" | "h2" | "h3") => {
    const Component = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = String(children).replace(/[`*_~]/g, "");
      const id = text.toLowerCase().replace(/[^\w\s\u0E00-\u0E7F-]/g, "").replace(/\s+/g, "-").trim();
      return <Tag id={id} {...props}>{children}</Tag>;
    };
    return Component;
  };

  return (
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
          h1: createHeading("h1"),
          h2: createHeading("h2"),
          h3: createHeading("h3"),
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
        {content}
      </ReactMarkdown>
    </article>
  );
};
