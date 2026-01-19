import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the main title', () => {
    render(<App />);
    const title = screen.getByRole('heading', { level: 1, name: /MoodTunes/i });
    expect(title).toBeInTheDocument();
  });

  it('renders the footer with copyright', () => {
    render(<App />);
    const footer = screen.getByText(/© 2024 MoodTunes/i);
    expect(footer).toBeInTheDocument();
  });

  describe('Search Functionality', () => {
     it('displays results when a search is successful', async () => {
        const mockResults = {
            results: [
                {
                    trackId: 101,
                    trackName: 'Yellow Submarine',
                    artistName: 'The Beatles',
                    primaryGenreName: 'Rock',
                    artworkUrl100: 'http://example.com/yellow.jpg',
                    previewUrl: 'http://example.com/yellow.mp3'
                }
            ]
        };
        
        global.fetch.mockResolvedValueOnce({
            json: async () => mockResults
        });

        render(<App />);
        
        const input = screen.getByPlaceholderText(/Search artists or songs.../i);
        const button = screen.getByRole('button', { name: /Search/i });

        fireEvent.change(input, { target: { value: 'The Beatles' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Yellow Submarine')).toBeInTheDocument();
            expect(screen.getByText('The Beatles')).toBeInTheDocument();
        });
     });

     it('displays no results message when search returns empty', async () => {
         const mockResults = { results: [] };
         
         global.fetch.mockResolvedValueOnce({
             json: async () => mockResults
         });
 
         render(<App />);
         
         const input = screen.getByPlaceholderText(/Search artists or songs.../i);
         const button = screen.getByRole('button', { name: /Search/i });
 
         fireEvent.change(input, { target: { value: 'UnknownXYZ' } });
         fireEvent.click(button);
 
         await waitFor(() => {
             expect(screen.getByText(/No results found/i)).toBeInTheDocument();
         });
      });
  });
});
