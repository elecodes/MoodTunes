export default function SongsList({ 
    loading, 
    paginatedSongs, 
    favorites, 
    toggleFavorite, 
    songs, 
    page, 
    perPage, 
    setPage 
}) {
  return (
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
                      {/* 🔹 Performance: Explicit Dimensions to prevent CLS */}
                      <img 
                        src={song.cover} 
                        alt={`Cover for ${song.title} by ${song.author}`} 
                        loading="lazy" 
                        width="100" 
                        height="100" 
                      />
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
  );
}
