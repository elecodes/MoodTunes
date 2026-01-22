const ITUNES_BASE = "https://itunes.apple.com/search";

/**
 * Fetches songs by a single artist from iTunes API.
 * @param {string} artist - Name of the artist to search for.
 * @param {number} [limit=20] - Max number of songs to return.
 * @returns {Promise<Array<{title: string, author: string, style: string, preview: string|null, cover: string|null}>>} List of mapped song objects.
 */
export async function fetchSongsByArtist(artist, limit = 20) {
  try {
    const url = `${ITUNES_BASE}?term=${encodeURIComponent(
      artist
    )}&media=music&entity=song&limit=${limit}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const data = await res.json();

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((track) => ({
      title: track.trackName || "Título desconocido",
      author: track.artistName || artist,
      style: track.primaryGenreName || "unknown",
      preview: track.previewUrl || null,
      cover: track.artworkUrl100 || null,
    }));
  } catch (err) {
    console.error(`❌ Error al traer canciones de ${artist}:`, err.message);
    return [];
  }
}

/**
 * Fetches songs for multiple artists sequentially.
 * @param {string[]} artists - Array of artist names.
 * @param {number} [limit=20] - Max songs per artist.
 * @returns {Promise<Array<Object>>} Combined list of songs.
 */
export async function fetchSongsByArtists(artists, limit = 20) {
  let results = [];
  for (const artist of artists) {
    const songs = await fetchSongsByArtist(artist, limit);
    results = [...results, ...songs];
    await new Promise((resolve) => setTimeout(resolve, 300)); // evitar bloqueo
  }
  return results;
}
