import Hero from '../shared/Hero';
import MovieRow from '../shared/MovieRow';
import CategoryPills from '../components/CategoryPills';
import { useEffect, useState } from 'react';
import type { Movie } from '../types';
import { fetchTrending, fetchGenres, searchMovie } from '../api/tmdb';
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
  // Handle category selection: call TMDB search for the selected genre so pages behave like Home
  async function handleCategorySelect(category: string){
    setSelected(category);
    if(category !== 'All'){
      setLoading(true);
      try{
        const results = await searchMovie(category);
        setMovies(results.slice(0, 50));
      }catch(err){
        console.warn('Failed to search movies by genre', err);
      }finally{ setLoading(false) }
    }else{
      setLoading(true);
      try{
        const data = await fetchTrending();
        setMovies(data || sampleMovies);
      }catch(err){ console.warn('Failed to fetch trending movies', err) }
      finally{ setLoading(false) }
    }
  }

  return (
    <main className="home-main">
      <Hero movie={movies[0] as Movie} />
      <CategoryPills categories={genres.length?genres:["All","Action","Drama","Sci-Fi","Thriller"]} onSelect={handleCategorySelect} />

      <section className="section">
        <h2>{selected === 'All' ? 'Trending Movies' : `${selected} Movies`}</h2>
        {loading ? <div>Loading...</div> : <MovieRow movies={movies} useNativeCarousel slidesToShow={5} />}
      </section>
    </main>
  )
}
