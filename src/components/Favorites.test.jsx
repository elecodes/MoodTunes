import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Favorites from './Favorites';

describe('Favorites', () => {
    it('should render empty message', () => {
        render(<Favorites favorites={[]} setFavorites={() => {}} />);
        expect(screen.getByText(/No tienes favoritos aún/i)).toBeInTheDocument();
    });

    it('should render favorites list', () => {
        const favorites = [{ title: 'Fav 1', author: 'Art 1' }];
        render(<Favorites favorites={favorites} setFavorites={() => {}} />);
        expect(screen.getByText(/Fav 1/i)).toBeInTheDocument();
    });

    it('should call setFavorites on remove', () => {
        const setFavorites = vi.fn();
        const favorites = [{ title: 'Fav 1', author: 'Art 1' }];
        render(<Favorites favorites={favorites} setFavorites={setFavorites} />);

        fireEvent.click(screen.getByText('❌'));
        expect(setFavorites).toHaveBeenCalledWith([]);
    });
});
