import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MovieRow from '../shared/MovieRow';
import './Movie.css';
import { fetchMovie, fetchVideos, fetchTV, fetchSimilarMovies, fetchSeason } from '../api/tmdb';
import { sampleMovies } from '../data/movies';
import type { Movie } from '../types';
import { addToList, removeFromList, loadList } from '../utils/myList';
type TmdbVideo = { id?: string; key?: string; name?: string; site?: string; type?: string };

export default function Movie(){
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [inList, setInList] = useState(false);
  const [isTv, setIsTv] = useState<boolean>(false);
  const [seasons, setSeasons] = useState<Array<{ name?: string; season_number?: number; episode_count?: number; poster_path?: string }>>([]);
  const [episodesBySeason, setEpisodesBySeason] = useState<Record<number, Array<{ id?: number; name?: string; episode_number?: number; overview?: string; air_date?: string; vote_average?: number }>>>({});
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);

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
        // Check if we're on a TV show path
        const isTVPath = window.location.pathname.startsWith('/tv/');
        
        if (isTVPath) {
          const tv = await fetchTV(id);
          if(tv && mounted){
            setMovie(tv.movie);
            setIsTv(true);
            setSeasons(tv.seasons || []);
          }
        } else {
          const data = await fetchMovie(id);
          if(mounted) {
            setMovie(data);
            setIsTv(false);
          }
          // fetch similar movies in background
          try{
            const sims = await fetchSimilarMovies(id);
            if(mounted) setSimilar(sims.slice(0,12));
          }catch{ /* ignore similar fetch errors */ }
        }
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
            {/* Action buttons (placed above episodes as requested) */}
            <div className="actions">
              <button onClick={openTrailer} className="btn ghost">Watch Trailer</button>
              <button onClick={toggleList} className="btn">{inList ? 'Remove from My List' : 'Add to My List'}</button>
            </div>

            {/* If this is a TV show, show seasons and expandable episode lists with ratings */}
            {isTv && seasons && seasons.length > 0 && (
              <div className="seasons">
                <h3>Episodes / Seasons</h3>
                <ul style={{listStyle:'none', padding:0, margin: '8px 0 0'}}>
                  {seasons.map((s, idx) => {
                    const sn = s.season_number || idx + 1;
                    const expanded = expandedSeasons.includes(sn);
                    const eps = episodesBySeason[sn] || [];
                    return (
                      <li key={sn} style={{padding: '8px 0', borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <div>
                            <strong>{s.name || `Season ${sn}`}</strong>
                            <div style={{color:'var(--muted)'}}>{s.episode_count ?? 0} episodes</div>
                          </div>
                          <div>
                            <button className="btn ghost" onClick={async ()=>{
                              // toggle expand/collapse
                              if(expanded){
                                setExpandedSeasons(es => es.filter(x => x !== sn));
                                return;
                              }
                              // expand: load episodes if not already
                              if(!episodesBySeason[sn]){
                                setLoadingSeason(sn);
                                try{
                                  const res = await fetchSeason(movie.id, sn);
                                  if(res && res.episodes){
                                    setEpisodesBySeason(prev => ({ ...prev, [sn]: res.episodes }));
                                  }
                                }catch(err){ console.warn('Failed to load season episodes', err) }
                                finally{ setLoadingSeason(null) }
                              }
                              setExpandedSeasons(es => [...es, sn]);
                            }}>{expanded ? 'Hide episodes' : (loadingSeason===sn ? 'Loading...' : 'Show episodes')}</button>
                          </div>
                        </div>

                        {/* Episode list when expanded */}
                        {expanded && (
                          <ul style={{listStyle:'none', paddingLeft:0, marginTop:10}}>
                            {eps.length === 0 && loadingSeason !== sn && <li style={{color:'var(--muted)'}}>No episode details available.</li>}
                            {eps.map((ep) => (
                              <li key={ep.id} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderTop:'1px solid rgba(255,255,255,0.02)'}}>
                                <div style={{maxWidth:'80%'}}>
                                  <strong>Ep {ep.episode_number}: </strong>
                                  <span>{ep.name}</span>
                                </div>
                                <div style={{color:'var(--muted)', minWidth:80, textAlign:'right'}}>
                                  {typeof ep.vote_average === 'number' ? `${Number(ep.vote_average).toFixed(1)} ⭐` : '—'}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {/* If this is a movie, show similar movies below */}
            {!isTv && similar && similar.length > 0 && (
              <div className="similar-movies">
                <h2>Similar Movies</h2>
                <MovieRow movies={similar} useNativeCarousel slidesToShow={5} emptyMessage="No similar movies" />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
