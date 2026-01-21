import "./App.css";
import { useState, useEffect, useRef } from "react";
import logo from "./assets/logo.png";
// import MoodAssistant from "./components/MoodAssistant";

// --- Componente principal ---
export default function App() {
  const [songs, setSongs] = useState([]); // canciones buscadas
  const [favorites, setFavorites] = useState([]); // lista de favoritos

  const [search, setSearch] = useState(""); // búsqueda manual
  const [loading, setLoading] = useState(false); // Loading state for UX
  const [suggestions, setSuggestions] = useState([]); // sugerencias de autocompletado
  const [showSuggestions, setShowSuggestions] = useState(false); // mostrar/ocultar dropdown
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // --- Dark Mode Effect ---
  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [darkMode]);

  // 🔹 Estado de paginación
  const [page, setPage] = useState(1);
  const perPage = 12;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedSongs = songs.slice(start, end);

  // 🔹 Estado de paginación favoritos
  const [favPage, setFavPage] = useState(1);
  const favPerPage = 6;
  const favStart = (favPage - 1) * favPerPage;
  const favEnd = favStart + favPerPage;
  const favPaginated = favorites.slice(favStart, favEnd);

  // --- Cargar favoritos ---
  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  // --- Guardar favoritos ---
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const isSelecting = useRef(false); // Flag to prevent re-opening dropdown on selection

  // --- Debounce para Autocomplete ---
  useEffect(() => {
    // Skip if this change was triggered by selecting an item
    if (isSelecting.current) {
      isSelecting.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      if (search.trim().length > 1) {
        fetchSuggestions(search);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // --- Buscar sugerencias (Autocomplete) ---
  async function fetchSuggestions(query) {
    if (!query) return;
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          query
        )}&media=music&entity=song&limit=10` // Increased limit to find unique ones
      );
      const data = await res.json();
      
      const rawResults = data.results.map((track) => ({
        id: track.trackId,
        title: track.trackName,
        author: track.artistName,
        cover: track.artworkUrl60, 
      }));

      // Deduplicate by Title + Author
      const uniqueResults = [];
      const seen = new Set();

      for (const r of rawResults) {
        const key = `${r.title.toLowerCase()}-${r.author.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueResults.push(r);
        }
      }

      setSuggestions(uniqueResults.slice(0, 5)); // Keep top 5 unique
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }

  // --- Buscar canciones en iTunes (manual o desde el agent) ---
  async function fetchSongs(query) {
    if (typeof query !== 'string') return;
    const sanitizedQuery = query.trim().slice(0, 100);
    if (!sanitizedQuery) return;

    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        sanitizedQuery
      )}&media=music&entity=song&limit=50`
    );

    const data = await res.json();

    const results = data.results.map((track) => ({
      id: track.trackId,
      title: track.trackName,
      author: track.artistName,
      style: track.primaryGenreName || "Unknown",
      cover: track.artworkUrl100,
      preview: track.previewUrl,
    }));

    setSongs(results);
    setPage(1);
    setLoading(false);
  }

  // --- Recibir canciones desde Voiceflow ---
  async function handleAgentSongs(agentSongs) {
    if (typeof agentSongs === 'string') {
        fetchSongs(agentSongs);
        return;
    }
    
    if (!Array.isArray(agentSongs)) {
        console.error("Invalid song format from agent:", agentSongs);
        return;
    }

    // agentSongs = [{ title, artist }]
    const searches = await Promise.all(
      agentSongs.map((s) => fetchItunesTrack(s.title, s.artist))
    );

    setSongs(searches.filter(Boolean));
    setPage(1);
  }

  // 🔹 Bridge for Voiceflow Widget
  useEffect(() => {
    window.handleVoiceflowMusic = handleAgentSongs;
    return () => {
      delete window.handleVoiceflowMusic;
    };
  }, []);

  async function fetchItunesTrack(title, artist) {
    const term = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`
    );
    const data = await res.json();
    const track = data.results[0];
    if (!track) return null;

    return {
      id: track.trackId,
      title: track.trackName,
      author: track.artistName,
      style: track.primaryGenreName || "Unknown",
      cover: track.artworkUrl100,
      preview: track.previewUrl,
    };
  }

  // --- Añadir / quitar favoritos ---
  function toggleFavorite(song) {
    const exists = favorites.find((f) => f.id === song.id);
    if (exists) {
      console.log("Removing favorite:", song.title);
      setFavorites(favorites.filter((f) => f.id !== song.id));
    } else {
      console.log("Adding favorite:", song.title);
      setFavorites([...favorites, song]);
      setFavPage(1);
    }
  }

  // 🔹 Mood State
  const [currentMood, setCurrentMood] = useState("default");

  // 🔹 Handle Mood Change (from Voiceflow or internal)
  function handleMoodChange(mood) {
    // Expected moods: 'calm', 'energetic', 'focus', 'melancholic'
    const validMoods = ['calm', 'energetic', 'focus', 'melancholic'];
    const normalized = mood?.toLowerCase();
    if (validMoods.includes(normalized)) {
      setCurrentMood(normalized);
    } else {
      setCurrentMood('default');
    }
  }

  // 🔹 Bridge for Voiceflow Mood
  useEffect(() => {
    window.handleVoiceflowMood = handleMoodChange;
    return () => {
      delete window.handleVoiceflowMood;
    };
  }, []);

  // 🔹 Dynamic Background Style
  const getBackgroundStyle = () => {
    const isDark = darkMode;
    const moodVar = isDark
      ? `var(--gradient-${currentMood}-dark)`
      : `var(--gradient-${currentMood})`;
    
    // Fallback to main bg if default
    return currentMood === 'default' 
      ? {} 
      : { background: moodVar };
  };

  return (
    <div className="app" style={getBackgroundStyle()}>
      <header>
        <h1>
          <img src={logo} alt="MoodTunes Logo" className="app-logo" />
          MoodTunes
        </h1>

        {/* 🔹 BÚSQUEDA MANUAL */}
        {/* 🔹 BÚSQUEDA MANUAL */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search artists or songs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                   fetchSongs(search);
                   setShowSuggestions(false);
                }
              }}
              onFocus={() => {
                if (search.trim().length > 1) setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
            />
            {search && (
              <button 
                className="btn-clear"
                onClick={() => { setSearch(""); setSongs([]); }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {suggestions.map((s) => (
                  <li 
                    key={s.id} 
                    onClick={() => {
                      isSelecting.current = true; // Mark as selection to block useEffect
                      setSearch(`${s.title} ${s.author}`);
                      fetchSongs(`${s.title} ${s.author}`);
                      setShowSuggestions(false);
                    }}
                  >
                    {/* Removed Image */}
                    <div>
                      <strong>{s.title}</strong>
                      <span>{s.author}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={() => { fetchSongs(search); setShowSuggestions(false); }} aria-label="Search">Search</button>
        </div>
          <div className="theme-switch-container" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label className="theme-switch">
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={() => setDarkMode(!darkMode)} 
              />
              <span className="slider">
                <span className="icon-moon">🌙</span>
                <span className="icon-sun">☀️</span>
              </span>
            </label>
          </div>
      </header>

      <main>
        {/* --- Resultados (Horizontal Scroll) --- */}
        <section className="songs">
          <h2>Results</h2>
          <div className="grid">

            {loading ? (
              // Skeleton Loading State
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              ))
            ) : (
                <>
                {paginatedSongs.length === 0 && <p style={{ padding: '0 1rem' }}>No results found.</p>}
                {paginatedSongs.map((song) => {
                  const isFav = favorites.find((f) => f.id === song.id);
                  return (
                    <div key={song.id} className="card">
                      <img src={song.cover} alt={`Cover for ${song.title} by ${song.author}`} loading="lazy" />
                      <h3>{song.title}</h3>
                      <p>{song.author}</p>
                      <p className="style">{song.style}</p>
                      {song.preview && <audio controls src={song.preview} aria-label={`Listen preview of ${song.title}`} />}
                      <button 
                        className={`btn-favorite ${isFav ? 'active' : ''}`}
                        onClick={() => toggleFavorite(song)}
                        aria-label={isFav ? `Remove ${song.title} from favorites` : `Add ${song.title} to favorites`}
                        style={{ 
                          marginTop: '10px', 
                          background: 'transparent', 
                          border: 'none', 
                          fontSize: '1.5rem',
                          boxShadow: 'none',
                          padding: '5px'
                        }}
                      >
                        {isFav ? "❤️" : "🤍"}
                      </button>
                    </div>
                  );
                })}
                </>
            )}
          </div>


          {/* --- Paginación canciones --- */}
          {songs.length > perPage && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                ⬅️ Previous
              </button>
              <span>
                Page {page} of {Math.ceil(songs.length / perPage)}
              </span>
              <button
                disabled={page === Math.ceil(songs.length / perPage)}
                onClick={() => setPage(page + 1)}
              >
                Next ➡️
              </button>
            </div>
          )}
        </section>

        {/* --- Favoritos --- */}
        <aside className="favorites">
          <h2>⭐ Favorites</h2>
          {favorites.length === 0 && <p>No favorites yet.</p>}
          <div className="grid">
            {favPaginated.map((song) => (
              <div key={song.id} className="card">
                <img src={song.cover} alt={song.title} />
                <h3>{song.title}</h3>
                <p>{song.author}</p>
                {song.preview && <audio controls src={song.preview} />}
                <button 
                    className="btn-remove"
                    onClick={() => toggleFavorite(song)}
                    aria-label={`Remove ${song.title} from favorites`}
                    style={{ marginTop: '10px' }}
                >
                  ❌ Remove
                </button>
              </div>
            ))}
          </div>

          {/* --- Favorites Pagination --- */}
          {favorites.length > favPerPage && (
            <div className="pagination">
              <button
                disabled={favPage === 1}
                onClick={() => setFavPage(favPage - 1)}
              >
                ⬅️ Previous
              </button>
              <span>
                Page {favPage} of {Math.ceil(favorites.length / favPerPage)}
              </span>
              <button
                disabled={favPage === Math.ceil(favorites.length / favPerPage)}
                onClick={() => setFavPage(favPage + 1)}
              >
                Next ➡️
              </button>
            </div>
          )}
        </aside>
      </main>
      <footer style={{ textAlign: "center", padding: "1rem", marginTop: "2rem" }}>
        <p>&copy; 2024 MoodTunes</p>
      </footer>
    </div>
  );
}
