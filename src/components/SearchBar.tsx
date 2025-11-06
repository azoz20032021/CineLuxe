import { useEffect, useRef, useState } from 'react';
import './SearchBar.css';
import { searchMulti } from '../api/tmdb';
import type { Movie } from '../types';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

export default function SearchBar({onSearch, hideButton, autoFocus}:{onSearch?:()=>void; hideButton?:boolean; autoFocus?:boolean}){
  const [q,setQ] = useState('');
  const [suggestions,setSuggestions] = useState<Movie[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const nav = useNavigate();
  const timer = useRef<number|undefined>(undefined);

  useEffect(()=>{
    if(timer.current) window.clearTimeout(timer.current);
    if(!q){ setSuggestions([]); return }
    timer.current = window.setTimeout(async ()=>{
      try{
        const res = await searchMulti(q);
        setSuggestions(res.slice(0,6));
        setShowResults(false); // typing shows suggestions but not full results
      }catch{ setSuggestions([]) }
    },300);
    return ()=>{ if(timer.current) window.clearTimeout(timer.current) }
  },[q])

  async function doSearch(){
    if(!q) return;
    setLoadingSearch(true);
    try{
      const res = await searchMulti(q);
      setSuggestions(res.slice(0,12));
      setShowResults(true);
      if(onSearch) onSearch();
      // navigate to search results page
      nav(`/search?q=${encodeURIComponent(q)}`);
    }catch{
      setSuggestions([]);
      setShowResults(true);
      nav(`/search?q=${encodeURIComponent(q)}`);
    }finally{ setLoadingSearch(false) }
  }

  return (
    <div className="searchbar">
      <input
        value={q}
        onChange={e=>setQ(e.target.value)}
        placeholder="Search movies, TV shows..."
        aria-label="Search"
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            doSearch();
          }
        }}
      />
      {!hideButton && (
        <Button
          onClick={()=>{ doSearch() }}
          variant="contained"
          sx={{
            background: "linear-gradient(90deg,#b6912bc8,#ffc422c8)",
            transition: "all 0.3s",
            // color: 'black',
            "&:hover": {
              transform: "scale(0.9)",
              boxShadow: "0 0 15px #d7d7d75b",
            },
          }}
        >
          Search
        </Button>
      )}

      { (loadingSearch || suggestions.length>0) && (
        <ul className={`suggestions ${showResults? 'results' : 'suggest'}`}>
          {loadingSearch && <li key="loading">Loading...</li>}
          {suggestions.map(s => (
            <li key={s.id} onClick={()=>{ 
              // ensure mobile panel can close if parent provided onSearch
              if(onSearch) onSearch();
              setSuggestions([]); setQ(''); setShowResults(false);
              if(s.mediaType === 'tv') nav(`/tv/${s.id}`);
              else nav(`/movie/${s.id}`);
            }}>{s.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
