import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSongsByArtist, fetchSongsByArtists } from './api';

describe('API Helpers', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('fetchSongsByArtist', () => {
        it('should return a list of songs when API call is successful', async () => {
            const mockData = {
                results: [
                    {
                        trackName: 'Test Song',
                        artistName: 'Test Artist',
                        primaryGenreName: 'Pop',
                        previewUrl: 'http://test.com/preview.mp3',
                        artworkUrl100: 'http://test.com/cover.jpg',
                    },
                ],
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });

            const songs = await fetchSongsByArtist('Test Artist');
            expect(songs).toHaveLength(1);
            expect(songs[0]).toEqual({
                title: 'Test Song',
                author: 'Test Artist',
                style: 'Pop',
                preview: 'http://test.com/preview.mp3',
                cover: 'http://test.com/cover.jpg',
            });
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('term=Test%20Artist'));
        });

        it('should handle API errors gracefully safely returning empty array', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });
            // Mock console.error to avoid noise
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const songs = await fetchSongsByArtist('Bad Artist');
            expect(songs).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();
        });

        it('should return empty array if no results', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: [] }),
            });

            const songs = await fetchSongsByArtist('Unknown');
            expect(songs).toEqual([]);
        });
        
        it('should handle missing fields in API response with defaults', async () => {
             const mockData = {
                results: [
                    {
                        // Missing trackName
                        // Missing artistName
                        // Missing genre
                    },
                ],
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });
            
            const songs = await fetchSongsByArtist('Fallback Artist');
            expect(songs[0]).toEqual({
                title: "Título desconocido",
                author: "Fallback Artist", // fallback to arg
                style: "unknown",
                preview: null,
                cover: null
            });
        });
        
         it('should catch network errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network Error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const songs = await fetchSongsByArtist('Network Fail');
            expect(songs).toEqual([]);
        });
    });

    describe('fetchSongsByArtists', () => {
        it('should fetch songs for multiple artists', async () => {
             const mockData1 = { results: [{ trackName: 'Song 1' }] };
             const mockData2 = { results: [{ trackName: 'Song 2' }] };
             
             global.fetch
                .mockResolvedValueOnce({ ok: true, json: async () => mockData1 })
                .mockResolvedValueOnce({ ok: true, json: async () => mockData2 });

            const songs = await fetchSongsByArtists(['Artist 1', 'Artist 2']);
            expect(songs).toHaveLength(2);
            expect(songs[0].title).toBe('Song 1');
            expect(songs[1].title).toBe('Song 2');
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });
});
