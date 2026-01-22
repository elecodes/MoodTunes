import logo from "../assets/logo.png";

/**
 * Header component containing logo, search bar, and theme toggle.
 * @param {Object} props
 * @param {string} props.search - Current search input value.
 * @param {Function} props.setSearch - State setter for search input.
 * @param {Function} props.handleKeyDown - Keyboard event handler for search input.
 * @param {Function} props.setShowSuggestions - State setter for suggestions dropdown visibility.
 * @param {boolean} props.showSuggestions - visibility of suggestion dropdown.
 * @param {Array<Object>} props.suggestions - List of autocomplete suggestions.
 * @param {number} props.focusedIndex - Index of currently highlighted suggestion.
 * @param {Function} props.setFocusedIndex - State setter for focused index.
 * @param {Function} props.selectSuggestion - Handler for clicking a suggestion.
 * @param {Function} props.fetchSongs - Function to execute search.
 * @param {Function} props.setSongs - State setter to clear songs (e.g. on clear search).
 * @param {boolean} props.darkMode - Current theme state.
 * @param {Function} props.setDarkMode - State setter for theme.
 */
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
