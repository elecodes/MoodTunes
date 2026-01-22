import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

describe('Security & Input Sanitization', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('truncates search input to 100 characters', async () => {
    const longInput = 'a'.repeat(150); // 150 characters
    const expectedQuery = 'a'.repeat(100); // Should be truncated to 100

    // Mock empty response
    global.fetch.mockResolvedValueOnce({
        json: async () => ({ results: [] }),
        ok: true
    });

    render(<App />);
    const input = await screen.findByPlaceholderText(/Search artists or songs.../i); // Async wait for Header
    const button = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: longInput } });
    fireEvent.click(button);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        const url = global.fetch.mock.calls[0][0];
        expect(url).toContain(`term=${expectedQuery}`);
        expect(url).not.toContain(`term=${longInput}`);
    });
  });

  it('encodes special characters to prevent URL injection', async () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const encodedInput = encodeURIComponent(maliciousInput);

    // Mock empty response
    global.fetch.mockResolvedValueOnce({
        json: async () => ({ results: [] }),
        ok: true
    });

    render(<App />);
    const input = await screen.findByPlaceholderText(/Search artists or songs.../i); // Async wait for Header
    const button = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: maliciousInput } });
    fireEvent.click(button);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        const url = global.fetch.mock.calls[0][0];
        // Expect the URL to contain the encoded version, NOT the raw script tag
        expect(url).toContain(`term=${encodedInput}`);
    });
  });
});
