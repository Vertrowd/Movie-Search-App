import React, { useState } from 'react';
import axios from 'axios';
import './MovieSearch.css';

const MovieSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
  const API_URL = import.meta.env.VITE_OMDB_API_URL;

  const searchMovies = async (e, page = 1) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a movie name');
      return;
    }

    setLoading(true);
    setError('');
    setMovies([]);
    setSelectedMovie(null);

    try {
      const response = await axios.get(`${API_URL}?apikey=${API_KEY}&s=${searchTerm}&page=${page}`);
      
      if (response.data.Response === 'True') {
        setMovies(response.data.Search);
        setTotalResults(parseInt(response.data.totalResults));
        setCurrentPage(page);
      } else {
        setError(response.data.Error || 'No movies found');
        setTotalResults(0);
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMovieDetails = async (imdbID) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
      
      if (response.data.Response === 'True') {
        setSelectedMovie(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalResults / 10)) {
      searchMovies(null, newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(totalResults / 10);

  return (
    <div className="movie-search-container">
      <header className="header">
        <h1>🎬 MovieSearch Pro</h1>
        <p>Discover millions of movies, TV shows, and more</p>
      </header>
      
      <form onSubmit={searchMovies} className="search-form">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search for movies... (e.g., Inception, Avengers, Titanic)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍 Search
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}
      
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading movies...</p>
        </div>
      )}

      {!loading && movies.length > 0 && (
        <>
          <div className="results-info">
            <p>Found {totalResults} results for "{searchTerm}"</p>
          </div>

          <div className="movies-grid">
            {movies.map((movie) => (
              <div key={movie.imdbID} className="movie-card" onClick={() => getMovieDetails(movie.imdbID)}>
                <div className="movie-poster-wrapper">
                  <img 
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster+Available'} 
                    alt={movie.Title}
                    className="movie-poster"
                    loading="lazy"
                  />
                </div>
                <div className="movie-info">
                  <h3>{movie.Title}</h3>
                  <div className="movie-meta">
                    <span className="year">📅 {movie.Year}</span>
                    <span className="type">🎯 {movie.Type}</span>
                  </div>
                  <button className="details-button">View Details →</button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="page-button"
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="page-button"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      

      {selectedMovie && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>&times;</span>
            <div className="modal-body">
              <img 
                src={selectedMovie.Poster !== 'N/A' ? selectedMovie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
                alt={selectedMovie.Title}
                className="modal-poster"
              />
              <div className="modal-details">
                <h2>{selectedMovie.Title} <span className="movie-year">({selectedMovie.Year})</span></h2>
                
                <div className="movie-stats">
                  <span className="rating">⭐ {selectedMovie.imdbRating}/10</span>
                  <span className="runtime">⏱️ {selectedMovie.Runtime}</span>
                  <span className="released">📅 {selectedMovie.Released}</span>
                </div>

                <p><strong>🎭 Genre:</strong> {selectedMovie.Genre}</p>
                <p><strong>🎬 Director:</strong> {selectedMovie.Director}</p>
                <p><strong>👥 Cast:</strong> {selectedMovie.Actors}</p>
                <p><strong>📝 Plot:</strong> {selectedMovie.Plot}</p>
                <p><strong>🏆 Awards:</strong> {selectedMovie.Awards}</p>
                <p><strong>💰 Box Office:</strong> {selectedMovie.BoxOffice}</p>
                
                {selectedMovie.imdbID && (
                  <a 
                    href={`https://www.imdb.com/title/${selectedMovie.imdbID}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="imdb-link"
                  >
                    View on IMDb →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieSearch;