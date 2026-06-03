import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Jusstlife brand logo', () => {
  render(<App />);
  const brandElement = screen.getByText(/JUSST/i);
  expect(brandElement).toBeInTheDocument();
});
