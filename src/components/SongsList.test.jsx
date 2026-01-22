import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SongsList from './SongsList';

describe('SongsList', () => {
    it('should render "No hay canciones" when list is empty', () => {
        render(<SongsList songs={[]} favorites={[]} setFavorites={() => {}} />);
        expect(screen.getByText(/No hay canciones cargadas/i)).toBeInTheDocument();
    });

    it('should render songs correctly', () => {
        const songs = [
            { title: 'Song 1', author: 'Artist 1', style: 'Rock', cover: 'cover.jpg', preview: 'audio.mp3' }
        ];
        render(<SongsList songs={songs} favorites={[]} setFavorites={() => {}} />);
        expect(screen.getByText('Song 1')).toBeInTheDocument();
        expect(screen.getByAltText('Song 1')).toHaveAttribute('src', 'cover.jpg');
    });

    it('should add to favorites if not exists', () => {
        const setFavorites = vi.fn();
        const songs = [{ title: 'S1', author: 'A1' }];
        render(<SongsList songs={songs} favorites={[]} setFavorites={setFavorites} />);

        fireEvent.click(screen.getByText('⭐'));
        expect(setFavorites).toHaveBeenCalledWith([{ title: 'S1', author: 'A1' }]);
    });

    it('should remove from favorites if exists', () => {
        const setFavorites = vi.fn();
        const songs = [{ title: 'S1', author: 'A1' }];
        const favorites = [{ title: 'S1', author: 'A1' }];
        render(<SongsList songs={songs} favorites={favorites} setFavorites={setFavorites} />);

        fireEvent.click(screen.getByText('⭐'));
        expect(setFavorites).toHaveBeenCalledWith([]);
    });
});
