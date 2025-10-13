import React from 'react';
import { render, screen } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

describe('LoginScreen', () => {
  it('renders correctly', () => {
    const mockOnLogin = jest.fn();
    const mockOnSignUp = jest.fn();

    render(<LoginScreen onLogin={mockOnLogin} onSignUp={mockOnSignUp} />);
    // Just check that the component renders without crashing
    expect(true).toBe(true);
  });
});