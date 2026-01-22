import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from './SearchBar';
import { musicService } from '../services/musicService';

vi.mock('../services/musicService', () => ({
    musicService: {
        getSongsByArtists: vi.fn()
    }
}));

describe('SearchBar', () => {
    it('should call getSongsByArtists and setSongs on submit', async () => {
        const setSongs = vi.fn();
        const mockSongs = [{ title: 'Song 1' }];
        musicService.getSongsByArtists.mockResolvedValue(mockSongs);

        render(<SearchBar setSongs={setSongs} />);

        const input = screen.getByPlaceholderText(/Introduce artistas/i);
        fireEvent.change(input, { target: { value: 'Artist 1, Artist 2' } });
        
        fireEvent.click(screen.getByText('Buscar'));

        await waitFor(() => {
            expect(musicService.getSongsByArtists).toHaveBeenCalledWith(['Artist 1', 'Artist 2']);
            expect(setSongs).toHaveBeenCalledWith(mockSongs);
        });
    });

    it('should filter empty inputs', async () => {
        const setSongs = vi.fn();
        musicService.getSongsByArtists.mockResolvedValue([]);
        render(<SearchBar setSongs={setSongs} />);

        const input = screen.getByPlaceholderText(/Introduce artistas/i);
        fireEvent.change(input, { target: { value: ' , Artist 1, ,' } });
        fireEvent.click(screen.getByText('Buscar'));

        await waitFor(() => {
            expect(musicService.getSongsByArtists).toHaveBeenCalledWith(['Artist 1']);
        });
    });
});
