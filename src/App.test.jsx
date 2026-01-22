import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

describe('App Component', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn(),
                setItem: vi.fn(),
            },
            writable: true
        });
        window.handleVoiceflowMusic = undefined;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('renders the main layout', async () => {
        render(<App />);
        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 1, name: /MoodTunes/i })).toBeInTheDocument();
        });
        expect(screen.getByText(/@2025 MoodTunes by Elecodes/i)).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument(); 
    });

    describe('Search Flow', () => {
        it('performs manual search', async () => {
            const mockData = {
                results: [
                    { trackId: 1, trackName: 'Song A', artistName: 'Artist A', primaryGenreName: 'Rock', artworkUrl100: 'img', previewUrl: 'url' }
                ]
            };
            global.fetch.mockResolvedValueOnce({
                json: async () => mockData
            });

            render(<App />);
            const input = await screen.findByPlaceholderText(/Search artists or songs/i);
            fireEvent.change(input, { target: { value: 'Query' } });
            // Use precise name to avoid matching "Clear search"
            fireEvent.click(screen.getByRole('button', { name: /Search Music/i }));

            await waitFor(() => {
                expect(screen.getByText('Song A')).toBeInTheDocument();
                expect(screen.getByText('Artist A')).toBeInTheDocument();
            });
        });

        it('handles no results', async () => {
            global.fetch.mockResolvedValueOnce({ json: async () => ({ results: [] }) });
            render(<App />);
            fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: 'None' } });
            fireEvent.click(screen.getByRole('button', { name: /Search Music/i }));
            
            await waitFor(() => {
                expect(screen.getByText(/No results found/i)).toBeInTheDocument();
            });
        });
        
         it('clears search', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/Search/i);
            fireEvent.change(input, { target: { value: 'Val' } });
            const clearBtn = screen.getByLabelText('Clear search');
            fireEvent.click(clearBtn);
            expect(input.value).toBe('');
        });
    });

    describe('Autocomplete', () => {
        it('fetches and displays suggestions', async () => {
            const mockSugg = {
                results: [
                    { trackId: 10, trackName: 'Sugg 1', artistName: 'Art 1', artworkUrl60: 'img' },
                    { trackId: 11, trackName: 'Sugg 2', artistName: 'Art 2', artworkUrl60: 'img' }
                ]
            };
            
            // fetch suggestions
            global.fetch.mockResolvedValue({ json: async () => mockSugg });

            render(<App />);
            // Wait for load first (real timers)
            const input = await screen.findByPlaceholderText(/Search/i);
            
            // Now start fake timers for debounce testing
            vi.useFakeTimers();
            
            fireEvent.focus(input);
            fireEvent.change(input, { target: { value: 'Sugg' } });

            vi.advanceTimersByTime(300);
            
            // Switch back to allow waitFor to work normally
            vi.useRealTimers();

            await waitFor(() => {
                 expect(screen.getByText('Sugg 1')).toBeInTheDocument();
            });
            
            // Test Keyboard Navigation
            fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
            
            // Sugg 1 should be focused (aria-selected=true)
            const option1 = screen.getByText('Sugg 1').closest('li');
            expect(option1).toHaveAttribute('aria-selected', 'true');
            
            fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
            const option2 = screen.getByText('Sugg 2').closest('li');
            expect(option2).toHaveAttribute('aria-selected', 'true');
            expect(option1).toHaveAttribute('aria-selected', 'false');

            fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
            expect(option1).toHaveAttribute('aria-selected', 'true');
            
            // Enter to select
            fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
            
             await waitFor(() => {
                 expect(input.value).toContain('Sugg 1');
            });
        });
    });

    describe('Interactions', () => {
        it('toggles dark mode', async () => {
            render(<App />);
            
            const toggle = await screen.findByRole('checkbox'); // Wait for Header to load
            
            fireEvent.click(toggle);
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
            fireEvent.click(toggle);
            expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        });

        it('adds and removes favorites', async () => {
            const mockData = {
                results: [
                    { trackId: 1, trackName: 'FaveMe', artistName: 'Artist F', id: 1, artworkUrl100: 'u' }
                ]
            };
            global.fetch.mockResolvedValue({ json: async () => mockData });

            render(<App />);
            fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: 'F' } });
            // fireEvent.keyDown(screen.getByPlaceholderText(/Search/i), { key: 'Enter', code: 'Enter' });
            fireEvent.click(screen.getByRole('button', { name: /Search Music/i }));

            await waitFor(() => expect(screen.getByText('FaveMe')).toBeInTheDocument());

            // Add to fav
            const addBtn = screen.getByLabelText(/Add FaveMe to favorites/i);
            fireEvent.click(addBtn);
            
            // Check favorites section explicitly using within
            const favoritesAside = screen.getByRole('complementary');
            const removeBtn = within(favoritesAside).getByLabelText(/Remove FaveMe/i);
            expect(removeBtn).toBeInTheDocument();

            // Click remove from the sidebar
            fireEvent.click(removeBtn);

             await waitFor(() => {
                 expect(within(favoritesAside).queryByText('FaveMe')).not.toBeInTheDocument();
             });
        });

        it('paginates results', async () => {
             const mockData = {
                results: Array.from({ length: 15 }, (_, i) => ({
                    trackId: i, trackName: `Song ${i}`, artistName: 'A', primaryGenreName: 'P', artworkUrl100: 'u'
                }))
            };
            global.fetch.mockResolvedValue({ json: async () => mockData });
            
            render(<App />);
            fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: 'Lots' } });
            fireEvent.click(screen.getByRole('button', { name: /Search Music/i }));

            await waitFor(() => expect(screen.getByText('Song 0')).toBeInTheDocument());
            expect(screen.queryByText('Song 14')).not.toBeInTheDocument(); // Page 1 has 12 items (0-11)
            
            fireEvent.click(screen.getByText(/Next/i));
            expect(screen.getByText('Song 14')).toBeInTheDocument();
        });
    });
    
    describe('Voiceflow Bridge', () => {
        it('accepts songs from window', async () => {
             const mockData = { results: [{ trackId: 9, trackName: 'VF', artistName: 'VF'}] };
             global.fetch.mockResolvedValue({ json: async () => mockData });
             
             render(<App />);
             
             // Wait for mount
             await waitFor(() => expect(window.handleVoiceflowMusic).toBeDefined());
             
             // Act
             window.handleVoiceflowMusic('Query');

             // Assert
             await waitFor(() => {
                 expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('Query'));
             });
        });
        
         it('accepts array from window', async () => {
             const mockSearch = { results: [{ trackId: 9, trackName: 'VF', artistName: 'VF', artworkUrl100: 'u'}] };
             // Mock fetchItunesTrack calls
             global.fetch.mockResolvedValue({ json: async () => mockSearch });
             
             render(<App />);
             
             // Wait for mount
             await waitFor(() => expect(window.handleVoiceflowMusic).toBeDefined());

             // Act
             /*
               handleAgentSongs calls fetchItunesTrack which calls fetch.
               We mocked fetch. It returns mockSearch.
               App will verify track exists and add to songs.
             */
             await window.handleVoiceflowMusic([{ title: 'T', artist: 'A' }]);
             
             // Assert
             await waitFor(() => {
                 expect(global.fetch).toHaveBeenCalled();
                 const elements = screen.getAllByText('VF');
                 expect(elements.length).toBeGreaterThan(0);
                 expect(elements[0]).toBeInTheDocument();
             });
        });
    });
});
