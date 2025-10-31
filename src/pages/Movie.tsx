import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchMovie, fetchVideos } from '../api/tmdb';
import { sampleMovies } from '../data/movies';
import type { Movie } from '../types';
import { addToList, removeFromList, loadList } from '../utils/myList';
type TmdbVideo = { id?: string; key?: string; name?: string; site?: string; type?: string };

export default function Movie(){
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [inList, setInList] = useState(false);

  useEffect(()=>{
    if(!movie) return;
    const list = loadList();
    setInList(!!list.find(m=>m.id===movie.id));
  },[movie])

  useEffect(() => {
    let mounted = true;
    async function load(){
      if(!id) return;
      setLoading(true);
      try{
        const data = await fetchMovie(id);
        if(mounted) setMovie(data);
      }catch(err){
        const found = sampleMovies.find(m => String(m.id) === id) as Movie | undefined;
        if(mounted) setMovie(found || sampleMovies[0]);
        console.warn('Failed to fetch movie details from TMDB', err);
      }finally{ setLoading(false) }
    }
    load();
    return () => { mounted = false }
  },[id])

  if(loading || !movie) return <main className="movie-detail"><div style={{padding:80}}>Loading...</div></main>
  async function openTrailer(){
    if(!movie) return;
    try{
      const videos: TmdbVideo[] = await fetchVideos(movie.id);
      const trailer = videos.find((v) => !!(v && v.type && /trailer/i.test(v.type) && v.site === 'YouTube' && v.key));
      if(trailer && trailer.key){
        const url = `https://www.youtube.com/watch?v=${trailer.key}`;
        window.open(url, '_blank');
        return;
      }
    }catch{ /* ignore */ }
    // fallback to search
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((movie.title || '') + ' trailer')}`, '_blank');
  }

  function toggleList(){
    if(!movie) return;
    if(inList){ removeFromList(movie.id); setInList(false); }
    else{ addToList(movie); setInList(true); }
    window.dispatchEvent(new Event('storage'));
  }

  return (
    <main className="movie-detail">
      <div className="detail-hero" style={{backgroundImage:`linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.2)), url(${movie.backdrop})`}}>
        <div className="detail-inner">
          <img src={movie.poster} alt={movie.title} />
          <div className="meta">
            <h1>{movie.title}</h1>
            <div className="sub">{movie.year} • {movie.genre?.join(', ')}</div>
            <p className="overview">{movie.overview}</p>
            <div className="actions">
              <button onClick={openTrailer} className="btn ghost">Watch Trailer</button>
              <button onClick={toggleList} className="btn">{inList ? 'Remove from My List' : 'Add to My List'}</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
