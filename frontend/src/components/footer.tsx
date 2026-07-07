import Link from 'next/link';

export function Footer() {
  return (
    <footer className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--card)] px-6 py-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="text-xs text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} LogicLens DAM
        </span>
        <div className="flex gap-4">
          <Link href="/contact" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Contact us
          </Link>
          <Link href="/privacy" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}