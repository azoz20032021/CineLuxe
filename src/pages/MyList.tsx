import { useEffect, useState } from 'react';
import MovieRow from '../shared/MovieRow';
import type { Movie } from '../types';

function loadMyList(): Movie[] {
  try{
    const raw = localStorage.getItem('my_list');
    if(!raw) return [];
    return JSON.parse(raw) as Movie[];
  }catch{ return [] }
}

export default function MyList(){
  const [items, setItems] = useState<Movie[]>(() => loadMyList());

  useEffect(()=>{
    const onStorage = () => setItems(loadMyList());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  },[])

  if(!items.length) return <main className="section"><h2>My List</h2><div style={{padding:40}}>Your list is empty.</div></main>

  return (
    <main className='my-list'>
      <section className="section">
        <h2>My List</h2>
        <MovieRow movies={items} />
      </section>
    </main>
  )
}
