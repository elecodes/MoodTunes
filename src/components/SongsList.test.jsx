import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SongsList from './SongsList';

describe('SongsList', () => {
    it('should render "No results found" when list is empty', () => {
        render(<SongsList songs={[]} paginatedSongs={[]} favorites={[]} setFavorites={() => {}} loading={false} />);
        expect(screen.getByText(/No results found/i)).toBeInTheDocument();
    });

    it('should render songs correctly', () => {
        const songs = [
            { id: 1, title: 'Song 1', author: 'Artist 1', style: 'Rock', cover: 'cover.jpg', preview: 'audio.mp3' }
        ];
        render(<SongsList songs={songs} paginatedSongs={songs} favorites={[]} setFavorites={() => {}} loading={false} />);
        expect(screen.getByText('Song 1')).toBeInTheDocument();
        expect(screen.getByAltText('Cover for Song 1 by Artist 1')).toHaveAttribute('src', 'cover.jpg');
    });

    it('should add to favorites if not exists', () => {
        const toggleFavorite = vi.fn();
        const songs = [{ id: 1, title: 'S1', author: 'A1' }];
        render(<SongsList songs={songs} paginatedSongs={songs} favorites={[]} toggleFavorite={toggleFavorite} loading={false} />);

        fireEvent.click(screen.getByText('🤍'));
        expect(toggleFavorite).toHaveBeenCalledWith(songs[0]);
    });

    it('should remove from favorites if exists', () => {
        const toggleFavorite = vi.fn();
        const songs = [{ id: 1, title: 'S1', author: 'A1' }];
        const favorites = [{ id: 1, title: 'S1', author: 'A1' }];
        render(<SongsList songs={songs} paginatedSongs={songs} favorites={favorites} toggleFavorite={toggleFavorite} loading={false} />);

        fireEvent.click(screen.getByText('❤️'));
        expect(toggleFavorite).toHaveBeenCalledWith(songs[0]);
    });
});
