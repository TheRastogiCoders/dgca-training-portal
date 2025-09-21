import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import PracticeTest from '../../components/PracticeTest';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

const MockedPracticeTest = () => (
  <BrowserRouter>
    <AuthProvider>
      <PracticeTest />
    </AuthProvider>
  </BrowserRouter>
);

describe('PracticeTest Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('renders practice test page with correct title', () => {
    render(<MockedPracticeTest />);
    expect(screen.getByText('Practice Tests')).toBeInTheDocument();
  });

  it('shows login required message when not authenticated', () => {
    render(<MockedPracticeTest />);
    expect(screen.getByText('🔒 Login required to access practice tests')).toBeInTheDocument();
  });

  it('displays test types when authenticated', async () => {
    // Mock authenticated user
    localStorage.setItem('user', JSON.stringify({ username: 'testuser', isAdmin: false }));
    localStorage.setItem('token', 'mock-token');

    // Mock successful API responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'API is working' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

    render(<MockedPracticeTest />);

    await waitFor(() => {
      expect(screen.getByText('Book Questions')).toBeInTheDocument();
      expect(screen.getByText('AI Generated Questions')).toBeInTheDocument();
      expect(screen.getByText('Admin Analysis Questions')).toBeInTheDocument();
    });
  });

  it('shows debug information when authenticated', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser', isAdmin: false }));
    localStorage.setItem('token', 'mock-token');

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'API is working' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

    render(<MockedPracticeTest />);

    await waitFor(() => {
      expect(screen.getByText('Debug Information:')).toBeInTheDocument();
      expect(screen.getByText('Authentication: ✅ Authenticated')).toBeInTheDocument();
    });
  });

  it('handles test type click navigation', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser', isAdmin: false }));
    localStorage.setItem('token', 'mock-token');

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'API is working' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

    render(<MockedPracticeTest />);

    await waitFor(() => {
      const aiTestButton = screen.getByText('AI Generated Questions').closest('div');
      fireEvent.click(aiTestButton);
      expect(mockNavigate).toHaveBeenCalledWith('/practice-test/ai');
    });
  });

  it('creates test data when button is clicked', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser', isAdmin: false }));
    localStorage.setItem('token', 'mock-token');

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'API is working' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ _id: 'test-result' })
      });

    render(<MockedPracticeTest />);

    await waitFor(() => {
      const createTestDataButton = screen.getByText('Create Test Data');
      fireEvent.click(createTestDataButton);
    });

    // Wait for the alert to appear (you might need to mock window.alert)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/results', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        })
      }));
    });
  });
});
