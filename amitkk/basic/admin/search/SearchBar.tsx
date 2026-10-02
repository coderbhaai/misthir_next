import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { setCookie } from 'hooks/CookieHook';
import { useRouter } from 'next/router';
import { useState, useEffect, KeyboardEvent } from 'react';

import { Search } from "lucide-react";
import { Button } from "@amitkk/components/button/button";
import { Input } from "@amitkk/components/basic/input";

interface SearchResult {
  name: string;
  url: string;
  module?: string;
  module_id?: string;
}

export default function SearchBar() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!term) { setResults([]); return; }
        await apiRequest("POST", basic/page", { function: "get_search_pages", term });

        setResults(res?.data || []);
        setOpen(true);
      } catch (err) { clo(err); }
    };

    const delayDebounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [term]);

  const handleSearchAction = async (action: 'select' | 'search', data?: { module?: string; module_id?: string; url?: string }) => {
    if (!term.trim()) return;

    try {
      "basic/page", { function: "create_update_search", module: data?.module || null, module_id: data?.module_id || null, term });
      
      if (action === 'select' && data?.url) {
        let redirectUrl = data.url;
        router.push(redirectUrl);
      } else if (action === 'search') {
        setCookie('search', term);
        router.push('/search');
      }

      setOpen(false);
      setTerm("");

    } catch (error) { clo(error); }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { handleSearchAction('search'); } };

return (
  <div className="relative flex flex-1 justify-center">
    <div className="flex w-full max-w-[700px] items-center overflow-hidden rounded-md border bg-white">
      <Input
        placeholder="Search here"
        value={term}
        onChange={(e) =>
          setTerm(e.target.value)
        }
        onKeyDown={handleKeyDown}
        className="border-0 text-lg shadow-none focus-visible:ring-0"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() =>
          handleSearchAction("search")
        }
      >
        <Search className="h-5 w-5" />
      </Button>
    </div>

    {open && results.length > 0 && (
      <div className="absolute top-full z-[9999] mt-2 w-full max-w-[700px] overflow-hidden rounded-md border bg-white shadow-lg">
        <div className="max-h-[400px] overflow-y-auto">
          {results.map((i, key) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                handleSearchAction(
                  "select",
                  {
                    module: i.module,
                    module_id:
                      i.module_id,
                    url: i.url,
                  }
                )
              }
              className="block w-full border-b px-4 py-3 text-left transition hover:bg-muted"
            >
              {i.name}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);
}