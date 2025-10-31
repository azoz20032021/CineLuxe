import Hero from '../shared/Hero';
import MovieRow from '../shared/MovieRow';
import { sampleMovies } from '../data/movies';
import type { Movie } from '../types';
import { useEffect, useState } from 'react';
import { fetchTrending, fetchTrendingTV, fetchGenres, searchTV, searchMovie } from '../api/tmdb';
import CategoryPills from '../components/CategoryPills';


export default function Home(){
  const [movies, setMovies] = useState<Movie[]>(sampleMovies);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('All');

  // Handler for category selection
  const handleCategorySelect = async (category: string) => {
    setSelected(category);
      if (category !== 'All') {
      setLoading(true);
      try {
        const [movieResults, tvResults] = await Promise.all([
          searchMovie(category),
          searchTV(category)
        ]);
        setMovies(movieResults.slice(0,20));
        setTvShows(tvResults.slice(0,20));
      } catch (error) {
        console.warn('Error fetching genre-specific content:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Reset to trending content for 'All'
      const [movieData, tvData] = await Promise.all([
        fetchTrending(),
        fetchTrendingTV()
      ]);
      setMovies(movieData.slice(0,20));
      setTvShows(tvData.slice(0,20));
    }
  };

  useEffect(() => {
    let mounted = true;
    async function load(){
      setLoading(true);
      try{
        // Fetch both movies and TV shows
        const [movieData, tvData] = await Promise.all([
          fetchTrending(),
          fetchTrendingTV()
        ]);
        if(mounted){
          if(movieData && movieData.length) setMovies(movieData);
          if(tvData && tvData.length) setTvShows(tvData);
        }
        try{
          const g = await fetchGenres();
          if(mounted) setGenres(['All', ...g.map(x=>x.name)]);
        }catch(error){
          console.warn('Failed to fetch genres', error);
        }
      }catch(err){
        console.warn('TMDB fetch failed, using sample data', err);
      }finally{ setLoading(false) }
    }
    load();
    return () => { mounted = false }
  },[])

  return (
    <main className='home-main'>
  <Hero movie={movies[0] as Movie} />
  <CategoryPills categories={genres.length ? genres : ["All","Action","Drama","Sci-Fi","Thriller"]} onSelect={handleCategorySelect} />
      <section className="section">
        <h2>{selected === 'All' ? 'Trending Movies' : `${selected} Movies`}</h2>
        {loading ? <div>Loading...</div> : (
          <MovieRow 
            movies={selected === 'All' ? movies : movies} 
            useNativeCarousel 
            slidesToShow={5} 
            emptyMessage={`No ${selected} movies available`}
          />
        )}
      </section>

      <section className="section">
        <h2>{selected === 'All' ? 'Top Rated TV Shows' : `${selected} TV Shows`}</h2>
        {loading ? <div>Loading...</div> : (
          <MovieRow 
            movies={selected === 'All' ? tvShows : tvShows} 
            useNativeCarousel 
            slidesToShow={5} 
            emptyMessage={`No ${selected} TV shows available`}
          />
        )}
      </section>
    </main>
  )
}
