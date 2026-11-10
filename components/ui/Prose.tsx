import Link from "next/link";
import clsx from "clsx";
import { Fragment } from "react";

/** Inline markup: **bold** and [text](href). Everything else is plain text (no HTML injection). */
export function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={i++}>{m[1]}</strong>);
    else {
      const href = m[3];
      const safe = /^(\/|#|https?:\/\/|mailto:|tel:)/.test(href) ? href : "#";
      parts.push(
        safe.startsWith("/") ? (
          <Link key={i++} href={safe} className="font-semibold underline decoration-accent decoration-2 underline-offset-4">{m[2]}</Link>
        ) : (
          <a key={i++} href={safe} className="font-semibold underline decoration-accent decoration-2 underline-offset-4" rel="noopener noreferrer" target={safe.startsWith("http") ? "_blank" : undefined}>{m[2]}</a>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, k) => <Fragment key={k}>{p}</Fragment>)}</>;
}

/** Paragraph list where consecutive "- " lines become a bullet list. */
export function Prose({ body, className }: { body: string[]; className?: string }) {
  const blocks: ({ type: "p"; text: string } | { type: "ul"; items: string[] })[] = [];
  for (const para of body) {
    const lines = para.split("\n");
    for (const line of lines) {
      if (line.startsWith("- ")) {
        const prev = blocks.at(-1);
        if (prev?.type === "ul") prev.items.push(line.slice(2));
        else blocks.push({ type: "ul", items: [line.slice(2)] });
      } else if (line.trim()) blocks.push({ type: "p", text: line });
    }
  }
  return (
    <div className={clsx("space-y-4 text-lg leading-relaxed text-ink/85", className)}>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i}><Inline text={b.text} /></p>
        ) : (
          <ul key={i} className="space-y-2">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-3"><span aria-hidden className="mt-2.5 size-2 shrink-0 rounded-full bg-accent" /><span><Inline text={it} /></span></li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
