import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from './SearchBar';
import * as api from '../helpers/api';

vi.mock('../helpers/api');

describe('SearchBar', () => {
    it('should call fetchSongsByArtists and setSongs on submit', async () => {
        const setSongs = vi.fn();
        const mockSongs = [{ title: 'Song 1' }];
        vi.spyOn(api, 'fetchSongsByArtists').mockResolvedValue(mockSongs);

        render(<SearchBar setSongs={setSongs} />);

        const input = screen.getByPlaceholderText(/Introduce artistas/i);
        fireEvent.change(input, { target: { value: 'Artist 1, Artist 2' } });
        
        fireEvent.click(screen.getByText('Buscar'));

        await waitFor(() => {
            expect(api.fetchSongsByArtists).toHaveBeenCalledWith(['Artist 1', 'Artist 2'], 10);
            expect(setSongs).toHaveBeenCalledWith(mockSongs);
        });
    });

    it('should filter empty inputs', async () => {
        const setSongs = vi.fn();
        api.fetchSongsByArtists.mockResolvedValue([]);
        render(<SearchBar setSongs={setSongs} />);

        const input = screen.getByPlaceholderText(/Introduce artistas/i);
        fireEvent.change(input, { target: { value: ' , Artist 1, ,' } });
        fireEvent.click(screen.getByText('Buscar'));

        await waitFor(() => {
            expect(api.fetchSongsByArtists).toHaveBeenCalledWith(['Artist 1'], 10);
        });
    });
});
