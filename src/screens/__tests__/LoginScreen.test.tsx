import React from 'react';
import { render, screen } from '@testing-library/react-native';
import LoginScreen from '../src/screens/LoginScreen';

describe('LoginScreen', () => {
  it('renders correctly', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Login')).toBeOnTheScreen();
  });
});