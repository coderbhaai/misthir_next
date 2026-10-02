interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({value, onChange, placeholder}: SearchInputProps) {
  return (
    <div className="relative mb-5">
      <input type="text" value={value} placeholder={placeholder || "Search..."} onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border bg-background px-4 pr-12 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"/>
      {value && (
        <button type="button" aria-label="Clear Search" onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
          <img src="/images/icons/static/cross-dark.svg" alt="Previous" className="h-5 w-5" width={20} height={20} loading="lazy"/>
        </button>
      )}
    </div>
  );
}