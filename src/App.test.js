import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the formatter heading', () => {
  render(<App />);
  expect(
    screen.getByText(/link formatter for social media/i)
  ).toBeInTheDocument();
});
