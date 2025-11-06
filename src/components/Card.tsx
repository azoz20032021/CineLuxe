import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import './Card.css';
import { useEffect } from 'react';

export default function Card({ movie }:{ movie:Movie }){
  const poster = movie.poster || '/assets/default-poster.svg';

  // keep a tiny effect placeholder in case parent expects side-effects later
  useEffect(()=>{
    return () => {}
  },[movie.id])

  const linkTo = movie.mediaType === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <div className="card">
      <Link to={linkTo} aria-label={`Open ${movie.title}`}>
        <div className="poster-wrap">
          <img src={poster} alt={movie.title} loading="lazy" />
        </div>
      </Link>
      <div className="card-meta">
        <div className="title">{movie.title}</div>
        <div className="meta-sub">{movie.year ?? ''}</div>
      </div>
    </div>
  )
}
