import type { Movie } from '../types';

const KEY = 'my_list';

export function loadList(): Movie[] {
  try{ const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) as Movie[] : [] }catch{ return [] }
}

export function saveList(list: Movie[]){
  try{ localStorage.setItem(KEY, JSON.stringify(list)) }catch(err){ console.warn('Failed to save my list', err) }
}

export function addToList(movie: Movie){
  const list = loadList();
  if(list.find(m=>m.id===movie.id)) return list;
  const next = [movie, ...list];
  saveList(next);
  return next;
}

export function removeFromList(id: number){
  const list = loadList();
  const next = list.filter(m=>m.id!==id);
  saveList(next);
  return next;
}
