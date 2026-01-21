import "./App.css";
import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
// import MoodAssistant from "./components/MoodAssistant";

// --- Componente principal ---
export default function App() {
  const [songs, setSongs] = useState([]); // canciones buscadas
  const [favorites, setFavorites] = useState([]); // lista de favoritos
  const [search, setSearch] = useState(""); // búsqueda manual
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
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search artists or songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSongs(search)}
          />
          <button onClick={() => fetchSongs(search)}>Search</button>
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
            {paginatedSongs.length === 0 && <p style={{ padding: '0 1rem' }}>No results found.</p>}
            {paginatedSongs.map((song) => {
              const isFav = favorites.find((f) => f.id === song.id);
              return (
                <div key={song.id} className="card">
                  <img src={song.cover} alt={song.title} loading="lazy" />
                  <h3>{song.title}</h3>
                  <p>{song.author}</p>
                  <p className="style">{song.style}</p>
                  {song.preview && <audio controls src={song.preview} />}
                  <button 
                    className={`btn-favorite ${isFav ? 'active' : ''}`}
                    onClick={() => toggleFavorite(song)}
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
