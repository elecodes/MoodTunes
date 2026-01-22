import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Favorites from './Favorites';

describe('Favorites', () => {
    it('should render empty message', () => {
        render(<Favorites favorites={[]} favPaginated={[]} toggleFavorite={() => {}} />);
        expect(screen.getByText(/No favorites yet/i)).toBeInTheDocument();
    });

    it('should render favorites list', () => {
        const favorites = [{ id: 1, title: 'Fav 1', author: 'Art 1' }];
        render(<Favorites favorites={favorites} favPaginated={favorites} toggleFavorite={() => {}} />);
        expect(screen.getByText(/Fav 1/i)).toBeInTheDocument();
    });

    it('should call toggleFavorite on remove', () => {
        const toggleFavorite = vi.fn();
        const favorites = [{ id: 1, title: 'Fav 1', author: 'Art 1' }];
        render(<Favorites favorites={favorites} favPaginated={favorites} toggleFavorite={toggleFavorite} />);

        // The button has "Remove" text and X icon
        const removeBtn = screen.getByRole('button', { name: /Remove Fav 1 from favorites/i });
        fireEvent.click(removeBtn);
        expect(toggleFavorite).toHaveBeenCalledWith(favorites[0]);
    });
});
