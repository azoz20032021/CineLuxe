import Hero from '../shared/Hero';
import MovieRow from '../shared/MovieRow';
import CategoryPills from '../components/CategoryPills';
import { useEffect, useState } from 'react';
import type { Movie } from '../types';
import { fetchTrending, fetchGenres } from '../api/tmdb';
import { sampleMovies } from '../data/movies';

export default function Movies(){
  const [movies, setMovies] = useState<Movie[]>(sampleMovies);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('All');

  useEffect(()=>{
    let mounted = true;
    async function load(){
      setLoading(true);
      try{
        const data = await fetchTrending();
        if(mounted && data && data.length) setMovies(data);
        try{
          const g = await fetchGenres();
          if(mounted) setGenres(['All', ...g.map(x=>x.name)]);
        }catch(e){ console.warn('Failed to load genres', e) }
      }catch(err){
        console.warn('Failed to fetch trending for Movies, falling back to sample data', err);
        if(mounted) setMovies(sampleMovies);
      }finally{ setLoading(false) }
    }
    load();
    return ()=>{ mounted = false }
  },[])

  const visible = selected === 'All' ? movies : movies.filter(m => (m.genre || []).includes(selected));

  return (
    <main className="home-main">
      <Hero movie={movies[0] as Movie} />
      <CategoryPills categories={genres.length?genres:["All","Action","Drama","Sci-Fi","Thriller"]} onSelect={(c)=>setSelected(c)} />

      <section className="section">
        <h2>Trending Movies</h2>
        {loading ? <div>Loading...</div> : <MovieRow movies={visible} useNativeCarousel slidesToShow={5} />}
      </section>
    </main>
  )
}
