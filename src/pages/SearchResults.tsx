import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieRow from '../shared/MovieRow';
import { searchMulti } from '../api/tmdb';
import type { Movie } from '../types';

export default function SearchResults(){
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      if(!q) return setResults([]);
      setLoading(true);
      try{
        const res = await searchMulti(q);
        if(mounted) setResults(res.slice(0,50));
      }catch(err){ console.warn('Search failed', err); }
      finally{ setLoading(false) }
    }
    load();
    return ()=>{ mounted = false }
  },[q])

  return (
    <main className="home-main">
      <section className="section">
        <h2>{q ? `Search results for "${q}"` : 'Search'}</h2>
        {loading ? <div>Loading...</div> : <MovieRow movies={results} useNativeCarousel slidesToShow={5} />}
      </section>
    </main>
  )
}
