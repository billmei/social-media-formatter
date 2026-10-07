import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders the formatter heading', () => {
  render(<App />);
  expect(
    screen.getByText(/link formatter for social media/i)
  ).toBeInTheDocument();
});

test('processes blog URL correctly', () => {
  render(<App />);
  const input = screen.getByPlaceholderText('https://billmei.net/blog/slug');
  fireEvent.change(input, { target: { value: 'https://billmei.net/blog/my-awesome-post' } });

  expect(screen.getByDisplayValue('my-awesome-post')).toBeInTheDocument();
  expect(screen.getByDisplayValue('https://billmei.substack.com/p/my-awesome-post')).toBeInTheDocument();
  expect(screen.getByDisplayValue('https://billmei.substack.com/p/my-awesome-post/comments')).toBeInTheDocument();
});

test('processes content HTML correctly', () => {
  render(<App />);
  const textarea = screen.getByPlaceholderText('Paste your content here...');
  fireEvent.change(textarea, { target: { value: '<p>Check out <a href="https://example.com">this link</a>.</p>' } });

  expect(screen.getAllByText(/Check out this link\[1\]\./i)).toHaveLength(2);
});
