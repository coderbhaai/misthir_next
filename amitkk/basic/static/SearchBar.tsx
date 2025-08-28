import { apiRequest, clo } from '@amitkk/basic/utils/utils';
import { Search } from '@mui/icons-material';
import { Box, IconButton, InputBase, List, ListItem, ListItemText, Paper } from '@mui/material';
import { setCookie } from 'hooks/CookieHook';
import { useRouter } from 'next/router';
import { useState, useEffect, KeyboardEvent } from 'react';

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
        const res = await apiRequest("post", "basic/page", { function: "get_search_pages", term });
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
      await apiRequest("post", "basic/page", { function: "create_update_search", module: data?.module || null, module_id: data?.module_id || null, term });
      
      if (action === 'select' && data?.url) {
        router.push(data.url);
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
    <Box sx={{ flex: 1, display: "flex", justifyContent: "center", position: "relative" }}>
      <Paper sx={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 700, border: "1px solid #ccc", borderRadius: 1, overflow: "hidden", backgroundColor: "white", }}>
        <InputBase sx={{ flex: 1, px: 2, fontSize: 18 }} placeholder="Search here" value={term} onChange={(e) => setTerm(e.target.value)} onKeyDown={handleKeyDown}/>
        <IconButton type="submit" sx={{ color: "#1a1a1a", p: 1 }} onClick={() => handleSearchAction('search')}><Search/></IconButton>
      </Paper>

      {open && results.length > 0 && (
        <Paper sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, maxWidth: 700, mx: "auto", }}>
          <List>
            {results.map((i, key) => (
              <ListItem key={key} component="button" onClick={() => handleSearchAction('select', { module: i.module, module_id: i.module_id, url: i.url })} sx={{ textAlign: 'left', display: 'block', width: '100%', cursor: 'pointer' }}>
                <ListItemText primary={i.name}/>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}