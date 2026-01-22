import logo from "../assets/logo.png";

export default function Header({ 
    search, 
    setSearch, 
    handleKeyDown, 
    setShowSuggestions, 
    showSuggestions, 
    suggestions, 
    focusedIndex, 
    setFocusedIndex, 
    selectSuggestion, 
    fetchSongs, 
    setSongs,
    darkMode, 
    setDarkMode 
}) {
  return (
      <header>
        <h1>
          <img src={logo} alt="MoodTunes Logo" className="app-logo" />
          MoodTunes
        </h1>

        {/* 🔹 BÚSQUEDA MANUAL */}
        <div className="search-bar">
          <div className="search-input-wrapper">
             {/* 🔹 Accessibility: Explicit Label (Visually Hidden) */}
            <label htmlFor="search-input" className="visually-hidden">Search artists or songs</label>
            <input
              id="search-input"
              type="text"
              placeholder="Search artists or songs..."
              aria-label="Search artists or songs"
              value={search}
              onChange={(e) => {
                  setSearch(e.target.value);
                  setFocusedIndex(-1); // Reset focus on type
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (search.trim().length > 1) setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
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
              <ul className="suggestions-dropdown" role="listbox">
                {suggestions.map((s, index) => (
                  <li 
                    key={s.id} 
                    role="option"
                    aria-selected={index === focusedIndex}
                    className={index === focusedIndex ? "focused" : ""}
                    onClick={() => selectSuggestion(s)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <div>
                      <strong>{s.title}</strong>
                      <span>{s.author}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* 🔹 Microcopy: Verbo + Sustantivo */}
          <button onClick={() => { fetchSongs(search); setShowSuggestions(false); }} aria-label="Search Music">Search Music</button>
        </div>
          <div className="theme-switch-container" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label htmlFor="theme-toggle" className="visually-hidden">Toggle Dark Mode</label>
            <label className="theme-switch" aria-label="Toggle dark mode">
              <input 
                id="theme-toggle"
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
  );
}
