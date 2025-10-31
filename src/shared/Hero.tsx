import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import Button from "@mui/material/Button";

export default function Hero({ movie }:{ movie:Movie }){
  if(!movie) return null;
  const overview = movie.overview ? movie.overview.slice(0,200) + '...' : '';
  const backdrop = movie.backdrop || '/assets/default-backdrop.svg';

  return (
    <section className="hero" style={{backgroundImage:`linear-gradient(to right, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.4) 100%), url(${backdrop})`}}>
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="kicker">NEW</span>
        <h1>{movie.title}</h1>
        <p>{overview}</p>
        <div className="buttons">
          <Button
      variant="contained"
      sx={{
        background: "linear-gradient(90deg,#b6912bc8,#ffc422c8)",
        transition: "all 0.3s",
        "&:hover": {
          transform: "scale(1.1)",
          boxShadow: "0 0 15px #d7d7d75b",
        },
      }}
    >
      <Link to={`/movie/${movie.id}`} style={{color: 'white', textDecoration: 'none'}}>View Details</Link>
    </Button>
          
          <Button
      variant="contained"
      sx={{
        background: "linear-gradient(90deg,#bba85479,#bba85479)",
        transition: "all 0.3s",
        "&:hover": {
          transform: "scale(1.1)",
          boxShadow: "0 0 15px #bba85479",
        },
      }}
    >
      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent((movie.title || '') + ' trailer')}`} target="_blank" rel="noopener noreferrer" style={{color: 'white', textDecoration: 'none'}}>Watch Trailer</a>
    </Button>

        </div>
      </div>
    </section>
  )
}
