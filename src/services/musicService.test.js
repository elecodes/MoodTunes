import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { musicService } from './musicService';
import { APP_CONFIG } from '../constants/appConfig';

describe('MusicService', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('searchSongs', () => {
        it('should fetch and map songs correctly', async () => {
            const mockData = {
                results: [
                    { 
                        trackId: 100, 
                        trackName: 'Test Song', 
                        artistName: 'Test Artist', 
                        primaryGenreName: 'Test Genre', 
                        artworkUrl100: 'img_url', 
                        previewUrl: 'preview_url' 
                    }
                ]
            };

            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => mockData
            });

            const result = await musicService.searchSongs('query');

            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://itunes.apple.com/search'));
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: 100,
                title: 'Test Song',
                author: 'Test Artist',
                style: 'Test Genre',
                cover: 'img_url',
                preview: 'preview_url'
            });
        });

        it('should throw error on non-ok response', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500
            });

            await expect(musicService.searchSongs('fail')).rejects.toThrow('API Error: 500');
        });

        it('should return empty array for invalid query', async () => {
            const result1 = await musicService.searchSongs('');
            expect(result1).toEqual([]);
            const result2 = await musicService.searchSongs(null);
            expect(result2).toEqual([]);
            const result3 = await musicService.searchSongs(123);
            expect(result3).toEqual([]);
        });
        it('should handle API response without results array', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });
            const result = await musicService.searchSongs('test');
            expect(result).toEqual([]);
        });
    });

    describe('getSuggestions', () => {
        it('should return raw results on success', async () => {
            const mockData = { results: [{ trackId: 1 }] };
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => mockData
            });

            const result = await musicService.getSuggestions('sugg');
            expect(result).toEqual(mockData.results);
        });
        
        it('should return empty array when API returns no results key', async () => {
             global.fetch.mockResolvedValueOnce({
                 ok: true,
                 json: async () => ({})
             });
             const result = await musicService.getSuggestions('sugg');
             expect(result).toEqual([]);
        });

        it('should return empty array for empty query', async () => {
             const result = await musicService.getSuggestions('');
             expect(result).toEqual([]);
             const result2 = await musicService.getSuggestions(null);
             expect(result2).toEqual([]);
        });

        it('should return empty array and log error on failure', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            const result = await musicService.getSuggestions('fail');
            
            expect(result).toEqual([]);
            expect(consoleSpy).toHaveBeenCalledWith("MusicService Suggestions Error:", expect.anything());
        });
    });

    describe('getSongsByArtists', () => {
        it('should combine results and handle individual failures', async () => {
            const mockData = { results: [{ trackId: 1 }] };
            const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            // First artist success
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });
            // Second artist failure
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const result = await musicService.getSongsByArtists(['Art 1', 'Art 2']);
            
            expect(result).toHaveLength(1);
            expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch for Art 2'), expect.anything());
        });
    });
});
