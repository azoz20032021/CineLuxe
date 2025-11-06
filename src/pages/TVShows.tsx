import Hero from '../shared/Hero';
import MovieRow from '../shared/MovieRow';
import CategoryPills from '../components/CategoryPills';
import { useEffect, useState } from 'react';
import type { Movie } from '../types';
import { fetchTrendingTV, fetchGenres, searchTV } from '../api/tmdb';
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

  // When a category is selected we should call the TV search endpoint so the
  // TVShows page mirrors the behavior on Home (show only matching genre results)
  async function handleCategorySelect(category: string){
    setSelected(category);
    if(category !== 'All'){
      setLoading(true);
      try{
        const results = await searchTV(category);
        setShows(results.slice(0, 50));
      }catch(err){ console.warn('Failed to search TV shows by genre', err) }
      finally{ setLoading(false) }
    }else{
      setLoading(true);
      try{
        const data = await fetchTrendingTV();
        setShows(data || sampleMovies);
      }catch(err){ console.warn('Failed to fetch trending TV shows', err) }
      finally{ setLoading(false) }
    }
  }

  // Show the fetched list directly; when a genre is selected we replace `shows`
  // with the search results, so additional client-side filtering is unnecessary.
  const visible = shows;

  return (
    <main>
      <Hero movie={shows[0] as Movie} />
      <CategoryPills categories={genres.length?genres:["All","Action","Drama","Sci-Fi","Thriller"]} onSelect={handleCategorySelect} />

      <section className="section">
        <h2>{selected === 'All' ? 'Top TV Shows' : `${selected} TV Shows`}</h2>
  {loading ? <div>Loading...</div> : <MovieRow movies={visible} useNativeCarousel slidesToShow={5} />}
      </section>
    </main>
  )
}
