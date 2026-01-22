/**
 * Sidebar component to display favorite songs.
 * @param {Object} props
 * @param {Array<Object>} props.favorites - Full list of favorite songs.
 * @param {Function} props.toggleFavorite - Handler to remove Favorites.
 * @param {number} props.favPage - Current page of favorites.
 * @param {number} props.favPerPage - Items per favorites page.
 * @param {Function} props.setFavPage - Page setter.
 * @param {Array<Object>} props.favPaginated - Pre-calculated list of favorites for current page.
 */
export default function Favorites({ 
    favorites, 
    toggleFavorite, 
    favPage, 
    favPerPage, 
    setFavPage,
    favPaginated // Pass derived state or calculate inside? Passed as prop for now to keep logic in App or move it here? 
                 // App.jsx calculates it. Let's pass it.
}) {
    // If we want to strictly code split, we should probably move the pagination logic here or keep it in App.
    // Keeping data logic in App for now to share state easily.
    
    // Note: If prop `favPaginated` is not passed, we can calculate it if `favPage` and `favorites` are passed.
    // Checking App.jsx: const favPaginated = favorites.slice(favStart, favEnd);
    // So we need `favPaginated` passed in or calculate it here. passing it in is fine.

  const totalPages = Math.ceil(favorites.length / favPerPage);

  return (
        <aside className="favorites">
          <h2>⭐ Favorites</h2>
          {favorites.length === 0 && <p>No favorites yet.</p>}
          <div className="grid">
            {favPaginated.map((song) => (
              <div key={song.id} className="card">
                {/* 🔹 Performance: Explicit Dimensions */}
                <img src={song.cover} alt={song.title} width="100" height="100" loading="lazy" />
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
                Page {favPage} of {totalPages}
              </span>
              <button
                disabled={favPage === totalPages}
                onClick={() => setFavPage(favPage + 1)}
              >
                Next ➡️
              </button>
            </div>
          )}
        </aside>
  );
}
