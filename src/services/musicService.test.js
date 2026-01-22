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
            const result = await musicService.searchSongs('');
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

        it('should return empty array on failure', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));
            const result = await musicService.getSuggestions('fail');
            expect(result).toEqual([]);
        });
    });
});
