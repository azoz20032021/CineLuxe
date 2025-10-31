import Hero from '../shared/Hero';
import MovieRow from '../shared/MovieRow';
import CategoryPills from '../components/CategoryPills';
import { useEffect, useState } from 'react';
import type { Movie } from '../types';
import { fetchTrendingTV, fetchGenres } from '../api/tmdb';
import { sampleMovies } from '../data/movies';

export default function TVShows(){
  const [shows, setShows] = useState<Movie[]>(sampleMovies);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('All');

  useEffect(()=>{
    let mounted = true;
    async function load(){
      setLoading(true);
      try{
        const data = await fetchTrendingTV();
        if(mounted && data && data.length) setShows(data);
        try{
          const g = await fetchGenres();
          if(mounted) setGenres(['All', ...g.map(x=>x.name)]);
        }catch(e){ console.warn('Failed to load genres', e) }
      }catch(err){
        console.warn('Failed to fetch trending for TV Shows, falling back to sample data', err);
        if(mounted) setShows(sampleMovies);
      }finally{ setLoading(false) }
    }
    load();
    return ()=>{ mounted = false }
  },[])

  const visible = selected === 'All' ? shows : shows.filter(m => (m.genre || []).includes(selected));

  return (
    <main>
      <Hero movie={shows[0] as Movie} />
      <CategoryPills categories={genres.length?genres:["All","Action","Drama","Sci-Fi","Thriller"]} onSelect={(c)=>setSelected(c)} />

      <section className="section">
        <h2>Top TV Shows</h2>
        {loading ? <div>Loading...</div> : <MovieRow movies={visible} useNativeCarousel slidesToShow={5} />}
      </section>
    </main>
  )
}
