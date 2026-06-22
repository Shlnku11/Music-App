import { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import TrackCard from '../shared/TrackCard';
import AlbumCard from '../shared/AlbumCard';
import AlbumView from '../../pages/AlbumView';

const API_URL = import.meta.env.VITE_API_URL;

const GENRES = ['Все', 'Pop', 'Hip-Hop', 'Rock', 'Electronic', 'R&B', 'Jazz'];

const SearchSection = () => {
  const { currentTrack, playTrack } = usePlayer();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('tracks');
  const [genre, setGenre] = useState('Все');
  const [results, setResults] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  useEffect(() => {
    const loadPopular = async () => {
      try {
        const res = await fetch(`${API_URL}/search/?q=${encodeURIComponent('popular songs 2026')}`);
        const data = await res.json();
        setPopular(data.results || []);
      } catch (e) {
        console.error('Failed to load popular', e);
      }
    };
    loadPopular();
  }, []);

  const runSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === 'albums'
        ? `${API_URL}/search/albums/?q=${encodeURIComponent(searchQuery)}`
        : `${API_URL}/search/?q=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error('Search error', e);
      setError('Ошибка поиска. Проверь подключение к бэкенду.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    runSearch(query.trim());
  };

  const handleGenreClick = (g) => {
    setGenre(g);
    if (g === 'Все') {
      setResults([]);
      setQuery('');
      return;
    }
    setQuery(g);
    runSearch(`${g} music 2026`);
  };

  if (selectedAlbum) {
    return <AlbumView album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />;
  }

  const showingResults = results.length > 0;

  return (
    <div className="search-section">
      <div className="search-mode-toggle">
        <button className={mode === 'tracks' ? 'active' : ''} onClick={() => setMode('tracks')}>Треки</button>
        <button className={mode === 'albums' ? 'active' : ''} onClick={() => setMode('albums')}>Альбомы</button>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === 'albums' ? 'Найти альбом...' : 'Найти трек, артиста...'}
          className="search-input"
        />
        <button type="submit" className="search-submit">Найти</button>
      </form>

      <div className="genre-filters">
        {GENRES.map((g) => (
          <button
            key={g}
            className={`genre-chip ${genre === g ? 'active' : ''}`}
            onClick={() => handleGenreClick(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {loading && <p className="loading-state">Поиск...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && showingResults && mode === 'tracks' && (
        <div className="track-grid-2col">
          {results.map((track) => (
            <TrackCard
              key={track.external_id}
              track={track}
              isActive={currentTrack?.external_id === track.external_id}
              onPlay={() => playTrack(track, results)}
            />
          ))}
        </div>
      )}

      {!loading && !error && showingResults && mode === 'albums' && (
        <div className="album-grid">
          {results.map((album) => (
            <AlbumCard key={album.browse_id} album={album} onClick={() => setSelectedAlbum(album)} />
          ))}
        </div>
      )}

      {!loading && !error && !showingResults && (
        <>
          <h2 className="search-section-title">Популярное</h2>
          <div className="track-grid-2col">
            {popular.map((track) => (
              <TrackCard
                key={track.external_id}
                track={track}
                isActive={currentTrack?.external_id === track.external_id}
                onPlay={() => playTrack(track, popular)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchSection;