import "./App.css";
import { useState, useEffect, useRef, Suspense, lazy } from "react";
// import logo from "./assets/logo.png"; // Moved to Header

// 🔹 Code Splitting: Lazy Load Components
const Header = lazy(() => import("./components/Header"));
const SongsList = lazy(() => import("./components/SongsList")); // Main Content
const Favorites = lazy(() => import("./components/Favorites")); // Sidebar

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

  const [lastRemoved, setLastRemoved] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const [focusedIndex, setFocusedIndex] = useState(-1); // Keyboard navigation index

  function handleKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) {
        if (e.key === "Enter") {
             fetchSongs(search);
             setShowSuggestions(false);
        }
        return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && suggestions[focusedIndex]) {
        selectSuggestion(suggestions[focusedIndex]);
      } else {
        fetchSongs(search);
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }
  
  function selectSuggestion(s) {
      isSelecting.current = true;
      setSearch(`${s.title} ${s.author}`);
      fetchSongs(`${s.title} ${s.author}`);
      setShowSuggestions(false);
      setFocusedIndex(-1);
  }

  // --- Cargar favoritos ---
  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  // --- Guardar favoritos ---
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const isSelecting = useRef(false);

  // --- Debounce para Autocomplete ---
  useEffect(() => {
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
        )}&media=music&entity=song&limit=10`
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

      setSuggestions(uniqueResults.slice(0, 5));
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

    setLoading(true); // 🔹 Heuristic: Visibility of System Status
    setSongs([]); 

    try {
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
    } catch (error) {
       console.error("Search failed", error);
    } finally {
       setLoading(false);
    }
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


  // --- Añadir / quitar favoritos (Optimistic UI) ---
  async function toggleFavorite(song) {
    const isAdding = !favorites.find((f) => f.id === song.id);
    const previousFavorites = [...favorites]; // Snapshot for rollback

    // 1. Update UI Instantly (Optimistic)
    if (!isAdding) {
      // Removing
      console.log("Removing favorite (Optimistic):", song.title);
      setFavorites(favorites.filter((f) => f.id !== song.id));
      setLastRemoved(song);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000); // 5s to undo
    } else {
      // Adding
      console.log("Adding favorite (Optimistic):", song.title);
      setFavorites([...favorites, song]);
      setFavPage(1);
    }

    // 2. Perform Async Operation (Simulated)
    try {
        // await api.syncFavorites(newFavorites); // If we had a real backend
        await new Promise((resolve, reject) => {
            // Simulate random server error/network lag if needed for testing rollback
            // if (Math.random() < 0.1) reject(new Error("Network Error"));
            setTimeout(resolve, 50); 
        });
    } catch (error) {
        console.error("Sync failed, rolling back UI", error);
        // 3. Rollback on Error
        setFavorites(previousFavorites);
        alert("Failed to update favorites. Please try again."); // Feedback
    }
  }

  function handleUndo() {
      if (lastRemoved) {
          setFavorites((prev) => [...prev, lastRemoved]);
          setLastRemoved(null);
          setShowToast(false);
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
      <Suspense fallback={<div className="loading-overlay">Loading...</div>}>
          <Header 
            search={search}
            setSearch={setSearch}
            handleKeyDown={handleKeyDown}
            setShowSuggestions={setShowSuggestions}
            showSuggestions={showSuggestions}
            suggestions={suggestions}
            focusedIndex={focusedIndex}
            setFocusedIndex={setFocusedIndex}
            selectSuggestion={selectSuggestion}
            fetchSongs={fetchSongs}
            setSongs={setSongs}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
      </Suspense>

      <main>
        <Suspense fallback={<div className="loading-skeleton">Loading Content...</div>}>
            <SongsList 
                loading={loading}
                paginatedSongs={paginatedSongs}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                songs={songs}
                page={page}
                perPage={perPage}
                setPage={setPage}
            />
        </Suspense>

        <Suspense fallback={<div className="loading-skeleton">Loading Favorites...</div>}>
            <Favorites 
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                favPage={favPage}
                favPerPage={favPerPage}
                setFavPage={setFavPage}
                favPaginated={favPaginated}
            />
        </Suspense>
      </main>
      
      {/* 🔹 Heuristic: Undo Toast */}
      {showToast && (
          <div className="toast-notification" role="status">
              <p>Removed from favorites</p>
              <button onClick={handleUndo} className="btn-undo">Undo</button>
          </div>
      )}

      <footer style={{ textAlign: "center", padding: "1rem", marginTop: "2rem" }}>
        <p>@2025 MoodTunes by Elecodes</p>
      </footer>
    </div>
  );
}
