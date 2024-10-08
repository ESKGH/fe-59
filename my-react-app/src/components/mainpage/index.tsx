import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies } from '../helper/apihelper.ts';
import { setMovies } from '../redux/actions/moviesactions.ts';
import { selectMovies } from '../redux/selectors/moviesselector.ts';
import MovieCard from '../moviecard/moviecard.tsx';
import { IMovie } from '../types/movietypes.ts';
import './styles.scss';

interface MainPageProps {
  searchTerm: string;
}

const MainPage: React.FC<MainPageProps> = ({ searchTerm }) => {
  const dispatch = useDispatch();
  const movies = useSelector(selectMovies) || [];

  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(8);
  const [yearFilter, setYearFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      let queries = ['batman', 'ant', 'spiderman', 'ironman', 'star wars', 'pivo', 'sat', 'say', 'sleep']; 
      if (searchTerm) {
        queries = [searchTerm];
      }
      const promises = queries.map(async (query) => {
        const movies = await fetchMovies(query);
        return movies;
      });
      const results = await Promise.all(promises);
      const allMovies = results.flat();
      dispatch(setMovies(allMovies));
    };
  
    fetchData();
  }, [dispatch, searchTerm]);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearFilter(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const filteredMovies = movies.filter((movie: IMovie) => {
    return (
      (yearFilter ? movie.Year.includes(yearFilter) : true) &&
      (typeFilter ? movie.Type === typeFilter : true)
    );
  });

  if (!filteredMovies || filteredMovies.length === 0) {
    return <p>No movies found.</p>;
  }

  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by year"
          value={yearFilter}
          onChange={handleYearChange}
        />
        <select
          value={typeFilter}
          onChange={handleTypeChange}
        >
          <option value="">All</option>
          <option value="movie">Movie</option>
          <option value="series">Series</option>
          <option value="episode">Episode</option>
          <option value="game">Game</option>
        </select>
      </div>
      <div className="cardcontainer">
        {currentMovies.map((movie: IMovie) => (
          <MovieCard key={movie.imdbID} movie={movie} />
        ))}
      </div>
      {filteredMovies.length > moviesPerPage && (
  <div className="pagination">
    {[...Array(Math.ceil(filteredMovies.length / moviesPerPage)).keys()].map((page) => {
      if (
        page + 1 === currentPage ||
        page + 1 === currentPage - 1 ||
        page + 1 === currentPage + 1 ||
        page + 1 === currentPage - 2 ||
        page + 1 === currentPage + 2 ||
        page === 0 ||
        page + 1 === Math.ceil(filteredMovies.length / moviesPerPage)
      ) {
        return (
          <button
            key={page}
            onClick={() => paginate(page + 1)}
            className={`pagination__button ${currentPage === page + 1? 'active' : ''}`}
          >
            {page + 1}
          </button>
        );
      } else if (page + 1 === currentPage - 3) {
        return <span key={page}>...</span>;
      } else if (page + 1 === currentPage + 3) {
        return <span key={page}>...</span>;
      } else {
        return null;
      }
    })}
  </div>
)}
    </div>
  );
};

export default MainPage;



