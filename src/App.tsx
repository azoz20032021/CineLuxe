import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import TokenWarning from './components/TokenWarning';
import Footer from './components/Footer';
import Home from './pages/Home';
import Movie from './pages/Movie';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import MyList from './pages/MyList';
import SearchResults from './pages/SearchResults';
import SignIn from './pages/SignIn';
import './App.css';

export default function App(){
  return (
    <BrowserRouter>
      <div className="app-root">
  <Header />
  <TokenWarning />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<Movie />} />
          <Route path="/tv/:id" element={<Movie />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv-shows" element={<TVShows />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
