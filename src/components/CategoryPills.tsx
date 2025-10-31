import './CategoryPills.css';
import { useEffect, useState } from 'react';

export default function CategoryPills({ categories, onSelect }:{ categories:string[]; onSelect?:(c:string)=>void }){
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(()=>{
    // support older and newer DOM typings (addListener vs addEventListener)
    const mq = window.matchMedia('(max-width: 768px)') as MediaQueryList & {
  addEventListener?: (type: string, listener: (e: Event) => void) => void;
  addListener?: (listener: (e: Event) => void) => void;
  removeEventListener?: (type: string, listener: (e: Event) => void) => void;
  removeListener?: (listener: (e: Event) => void) => void;
    };
    const handle = (e: { matches: boolean } ) => setIsMobile(!!e.matches);
    // set initial
    handle(mq);
    // listen
    if(mq.addEventListener) mq.addEventListener('change', handle);
    else if(mq.addListener) mq.addListener(handle);
    return () => {
      if(mq.removeEventListener) mq.removeEventListener('change', handle);
      else if(mq.removeListener) mq.removeListener(handle);
    }
  },[])

  // On mobile show only first 5 categories plus 'All' (if present). When expanded, show all.
  // Compute initial collapsed count so we can always show the toggle (Show more / Show less)
  const hasAll = categories[0] === 'All' || categories.includes('All');
  const othersCount = categories.filter(c => c !== 'All').length;
  const initialCount = hasAll ? 1 + Math.min(5, othersCount) : Math.min(5, categories.length);

  let toShow = categories;
  if (isMobile && !expanded) {
    if (hasAll) {
      const others = categories.filter(c => c !== 'All');
      toShow = ['All', ...others.slice(0, 5)];
    } else {
      toShow = categories.slice(0, 5);
    }
  }

  return (
    <div className="pills">
      {toShow.map(c => (
        <button key={c} className="pill" onClick={()=>onSelect && onSelect(c)}>{c}</button>
      ))}
      {isMobile && categories.length > initialCount && (
        <button className="pill pill-toggle" onClick={()=>setExpanded(s=>!s)}>{expanded ? 'Show less' : 'Show more'}</button>
      )}
    </div>
  )
}
