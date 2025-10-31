import axios from 'axios';
import type { Movie } from '../types';
import { sampleMovies } from '../data/movies';

const TOKEN = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
const BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

// Cache genre ID to name mapping
let genreMap: Record<number, string> = {};
async function ensureGenreMap() {
  if (Object.keys(genreMap).length === 0) {
    const genres = await fetchGenres();
    genreMap = genres.reduce((map, g) => ({ ...map, [g.id]: g.name }), {});
  }
  return genreMap;
}

type TmdbGenre = { id:number; name:string };
type TmdbSummary = {
  id:number;
  title?:string;
  name?:string;
  release_date?:string;
  first_air_date?:string;
  overview?:string;
  genres?:TmdbGenre[];
  genre_ids?:number[];
  poster_path?:string;
  backdrop_path?:string;
  popularity?:number;
  vote_count?:number;
}

async function fetchTrending(): Promise<Movie[]> {
  if (!TOKEN) {
    // no token: return sample data so app still works offline/local
    return Promise.resolve(sampleMovies as Movie[]);
  }
  await ensureGenreMap();
  const { data } = await axios.get<{ results: TmdbSummary[] }>(`${BASE}/trending/movie/week?language=en-US`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return (data.results || []).map((r) => mapResult(r));
}

async function fetchTrendingTV(): Promise<Movie[]> {
  if (!TOKEN) {
    return Promise.resolve(sampleMovies as Movie[]);
  }
  await ensureGenreMap();
  const { data } = await axios.get<{ results: TmdbSummary[] }>(`${BASE}/trending/tv/week?language=en-US`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return (data.results || []).map((r) => mapResult(r));
}

async function fetchMovie(id: string | number): Promise<Movie> {
  if (!TOKEN) {
    // try to find in sampleMovies
    const found = sampleMovies.find((m) => String(m.id) === String(id));
    return Promise.resolve((found || sampleMovies[0]) as Movie);
  }
  const { data } = await axios.get<TmdbSummary>(`${BASE}/movie/${id}`, {
    params: { language: 'en-US' },
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return mapResult(data);
}

function mapResult(r: TmdbSummary): Movie {
  return {
    id: r.id,
    title: r.title || r.name || 'Unknown',
    year: r.release_date ? Number(r.release_date.split('-')[0]) : undefined,
    genre: r.genres ? r.genres.map((g) => g.name) : (r.genre_ids || []).map((id) => genreMap[id] || '').filter(Boolean),
    overview: r.overview,
    poster: r.poster_path ? IMAGE_BASE + r.poster_path : '/assets/poster1.svg',
    backdrop: r.backdrop_path ? IMAGE_BASE + r.backdrop_path : '/assets/backdrop1.svg',
  };
}

export { fetchTrending, fetchMovie };
export type { Movie };
export { fetchTrendingTV };

async function searchMovie(genre: string) {
  if (!TOKEN) return Promise.resolve([]);
  await ensureGenreMap();

  const genreLower = genre.toLowerCase();

  const matchingIds = Object.entries(genreMap)
    .filter(([, name]) => {
      const n = name.toLowerCase();
      return n === genreLower || n.includes(genreLower) || genreLower.includes(n);
    })
    .map(([id]) => id);

  if (matchingIds.length === 0) {
    const aliases: Record<string, string[]> = {
      'sci-fi': ['science fiction', 'sci fi', 'sci-fi'],
      'science fiction': ['sci-fi', 'sci fi', 'science fiction'],
      'action': ['action', 'action & adventure']
    };
    const alt = aliases[genreLower];
    if (alt) {
      const altMatch = Object.entries(genreMap)
        .filter(([, name]) => alt.some(a => name.toLowerCase().includes(a)))
        .map(([id]) => id);
      matchingIds.push(...altMatch);
    }
  }

  if (matchingIds.length === 0) return Promise.resolve([]);

  const withGenresParam = matchingIds.join(',');

  try {
    const [discover, trending, topRated] = await Promise.all([
      axios.get(`${BASE}/discover/movie`, {
        params: {
          with_genres: withGenresParam,
          language: 'en-US',
          sort_by: 'popularity.desc',
          include_adult: false,
          page: 1
        },
        headers: { Authorization: `Bearer ${TOKEN}` }
      }),
      axios.get(`${BASE}/trending/movie/week`, {
        params: { language: 'en-US' },
        headers: { Authorization: `Bearer ${TOKEN}` }
      }),
      axios.get(`${BASE}/movie/top_rated`, {
        params: {
          with_genres: withGenresParam,
          language: 'en-US',
          page: 1
        },
        headers: { Authorization: `Bearer ${TOKEN}` }
      })
    ]);

    const allMovies = [
      ...(discover.data.results || []),
      ...(trending.data.results || []),
      ...(topRated.data.results || [])
    ];

    const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());

    const genreIdNumbers = matchingIds.map((id) => Number(id));
    const filtered = uniqueMovies.filter(movie =>
      (movie.genre_ids || []).some((gid: number) => genreIdNumbers.includes(gid))
    );

    const sorted = filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return sorted.map(r => mapResult(r));
  } catch (error) {
    console.warn('Error fetching movies:', error);
    return [];
  }
}

type TmdbGenreList = { genres: TmdbGenre[] };
async function fetchGenres(): Promise<TmdbGenre[]>{
  if(!TOKEN) return Promise.resolve([]);
  try {
    // Fetch both movie and TV genres and merge them
    const [movieData, tvData] = await Promise.all([
      axios.get<TmdbGenreList>(`${BASE}/genre/movie/list`,{ headers:{ Authorization:`Bearer ${TOKEN}` } }),
      axios.get<TmdbGenreList>(`${BASE}/genre/tv/list`,{ headers:{ Authorization:`Bearer ${TOKEN}` } })
    ]);
    
    // Combine genres and remove duplicates
    const allGenres = [...(movieData.data.genres || []), ...(tvData.data.genres || [])];
    const uniqueGenres = Array.from(new Map(allGenres.map(g => [g.name, g])).values());
    return uniqueGenres;
  } catch (error) {
    console.warn('Error fetching genres:', error);
    return [];
  }
}

async function searchTV(genre: string) {
  if (!TOKEN) return Promise.resolve([]);
  await ensureGenreMap();

  const genreLower = genre.toLowerCase();

  // Find all genre IDs whose name matches or contains the selected genre (case-insensitive)
  const matchingIds = Object.entries(genreMap)
    .filter(([, name]) => {
      const n = name.toLowerCase();
      return n === genreLower || n.includes(genreLower) || genreLower.includes(n);
    })
    .map(([id]) => id);

  if (matchingIds.length === 0) {
    // Try some common alias handling (e.g., Sci-Fi -> Science Fiction)
    const aliases: Record<string, string[]> = {
      'sci-fi': ['science fiction', 'sci fi', 'sci-fi'],
      'science fiction': ['sci-fi', 'sci fi', 'science fiction'],
      'action': ['action', 'action & adventure']
    };
    const alt = aliases[genreLower];
    if (alt) {
      const altMatch = Object.entries(genreMap)
        .filter(([, name]) => alt.some(a => name.toLowerCase().includes(a)))
        .map(([id]) => id);
      matchingIds.push(...altMatch);
    }
  }

  if (matchingIds.length === 0) return Promise.resolve([]);

  const withGenresParam = matchingIds.join(',');

  try {
    const [discoverPage1, discoverPage2, trending, popular] = await Promise.all([
      axios.get(`${BASE}/discover/tv`, {
        params: {
          with_genres: withGenresParam,
          language: 'en-US',
          sort_by: 'popularity.desc',
          include_adult: false,
          include_null_first_air_dates: false,
          'vote_count.gte': 10,
          page: 1
        },
        headers: { Authorization: `Bearer ${TOKEN}` }
      }),
      axios.get(`${BASE}/discover/tv`, {
        params: {
          with_genres: withGenresParam,
          language: 'en-US',
          sort_by: 'popularity.desc',
          include_adult: false,
          include_null_first_air_dates: false,
          'vote_count.gte': 10,
          page: 2
        },
        headers: { Authorization: `Bearer ${TOKEN}` }
      }),
      axios.get(`${BASE}/trending/tv/week`, {
        params: { language: 'en-US' },
        headers: { Authorization: `Bearer ${TOKEN}` }
      }),
      axios.get(`${BASE}/tv/popular`, {
        params: { language: 'en-US', page: 1 },
        headers: { Authorization: `Bearer ${TOKEN}` }
      })
    ]);

    const allShows = [
      ...(discoverPage1.data.results || []),
      ...(discoverPage2.data.results || []),
      ...(trending.data.results || []),
      ...(popular.data.results || [])
    ];

    const uniqueShows = Array.from(new Map(allShows.map(show => [show.id, show])).values());

    const genreIdNumbers = matchingIds.map((id) => Number(id));
    const filtered = uniqueShows.filter(show =>
      show.name && (show.genre_ids || []).some((gid: number) => genreIdNumbers.includes(gid))
    );

    const sorted = filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return sorted.map(r => mapResult(r));
  } catch (error) {
    console.warn('Error fetching TV shows:', error);
    return [];
  }
}

export { searchMovie, searchTV, fetchGenres };

async function fetchVideos(id: string | number){
  if(!TOKEN) return Promise.resolve([]);
  const { data } = await axios.get(`${BASE}/movie/${id}/videos`,{
    params: { language: 'en-US' },
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return data.results || [];
}

export { fetchVideos };

