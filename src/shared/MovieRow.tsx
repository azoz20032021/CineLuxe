import Card from '../components/Card';
import type { Movie } from '../types';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useState } from 'react';

type Props = {
  movies: Movie[];
  useSlider?: boolean; // legacy slick usage
  useNativeCarousel?: boolean; // CSS scroll-snap based carousel
  slidesToShow?: number; // optional override
  emptyMessage?: string; // custom message when no items are available
}

export default function MovieRow({ movies, useSlider, useNativeCarousel, slidesToShow, emptyMessage }:Props){
  const [viewportSlides, setViewportSlides] = useState<number | undefined>(undefined);

  useEffect(()=>{
    function calc(width:number){
      // responsive breakpoints (wider desktop gets more slides)
      if(width >= 1920) return 6;
      if(width >= 1440) return 5;
      if(width >= 1200) return 5;
      if(width >= 900) return 4;
      if(width >= 600) return 3;
      // on phones, keep at least 3 slides visible so users can swipe to see others
      return 3;
    }

    function update(){
      if(typeof window === 'undefined') return;
      const w = window.innerWidth;
      setViewportSlides(calc(w));
    }

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  },[])
  if (movies.length === 0) {
    return <div style={{padding:24, color:'var(--muted)'}}>{emptyMessage || 'No items to show.'}</div>
  }

  if (useSlider) {
    const sliderBase = slidesToShow ?? 5;
    const settings = {
      speed: 300,
      slidesToShow: sliderBase,
      slidesToScroll: 1,
      infinite: false,
      arrows: true,
      dots: false,
      responsive: [
        { breakpoint: 1200, settings: { slidesToShow: Math.max(1, Math.min(4, sliderBase)) } },
        { breakpoint: 900, settings: { slidesToShow: Math.max(1, Math.min(3, Math.floor(sliderBase * 0.6))) } },
        { breakpoint: 600, settings: { slidesToShow: 2 } },
        { breakpoint: 420, settings: { slidesToShow: 1 } },
      ]
    };

    return (
      <div>
        <Slider {...settings}>
          {movies.map(m => (
            <div key={m.id} style={{padding: '0 6px'}}>
              <Card movie={m} />
            </div>
          ))}
        </Slider>
      </div>
    )
  }
  if (useNativeCarousel) {
    // determine slides to show: prop overrides responsive calculation
    const responsive = viewportSlides ?? 5;
    const used = slidesToShow ?? responsive;

    // native CSS scroll-snap carousel
    return (
      <div className="movie-row-snap" role="list">
        {movies.map(m => (
          <div className="slide" role="listitem" key={m.id} style={{flex: `0 0 ${100 / used}%`}}>
            <Card movie={m} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="movie-row">
      {movies.map(m => (
        <div style={{minWidth:160}} key={m.id}>
          <Card movie={m} />
        </div>
      ))}
    </div>
  )
}
