import { APP_CONFIG } from "../constants/appConfig";

/**
 * Service to handle Music API interactions.
 * Isolates Infrastructure (fetch) from Domain Logic.
 */
export const musicService = {
  /**
   * Search for songs by query.
   * @param {string} query 
   * @returns {Promise<Array>} List of formatted songs.
   */
  async searchSongs(query) {
    if (!query || typeof query !== 'string') return [];
    
    // Use config for isolation
    const limit = APP_CONFIG.API.SEARCH_LIMIT;
    const url = `${APP_CONFIG.API.BASE_URL}?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        
        const data = await res.json();
        return (data.results || []).map(this._mapTrackToDomain);
    } catch (error) {
        console.error("MusicService Search Error:", error);
        throw error;
    }
  },

  /**
   * Search for songs by multiple artists.
   * @param {string[]} artists 
   * @returns {Promise<Array>} Combined list of songs.
   */
  async getSongsByArtists(artists) {
      let results = [];
      for (const artist of artists) {
          try {
            const songs = await this.searchSongs(artist);
            results = [...results, ...songs];
            // Small delay to be nice to API
            await new Promise(r => setTimeout(r, 100));
          } catch (e) {
              console.warn(`Failed to fetch for ${artist}`, e);
          }
      }
      return results;
  },

  /**
   * Search for autocomplete suggestions.
   * @param {string} query 
   * @returns {Promise<Array>} List of raw results (to be deduplicated by caller or here).
   */
  async getSuggestions(query) {
      if (!query) return [];
      const limit = APP_CONFIG.API.AUTOCOMPLETE_LIMIT;
      const url = `${APP_CONFIG.API.BASE_URL}?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}`;
      
      try {
          const res = await fetch(url);
          const data = await res.json();
          return data.results || [];
      } catch (error) {
          console.error("MusicService Suggestions Error:", error);
          return [];
      }
  },
  
  // Helper to standardise domain model
  _mapTrackToDomain(track) {
      return {
        id: track.trackId,
        title: track.trackName,
        author: track.artistName,
        style: track.primaryGenreName || "Unknown",
        cover: track.artworkUrl100, // High res for main list
        preview: track.previewUrl,
      };
  }
};
