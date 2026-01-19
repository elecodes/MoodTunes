import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
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
});
