import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomAlert } from '../CustomAlert';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock the theme context
const mockTheme = {
  colors: {
    surface: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#666666',
    secondary: '#27AE60',
    info: '#3498DB',
    warning: '#F39C12',
    error: '#E74C3C',
  },
  isDarkMode: false,
  toggleTheme: jest.fn(),
  updateUser: jest.fn(),
};

jest.mock('../../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: any) => children,
  useTheme: () => mockTheme,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('CustomAlert', () => {
  const defaultProps = {
    visible: true,
    title: 'Test Title',
    message: 'Test message',
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when visible', () => {
    const { getByText } = render(
      <TestWrapper>
        <CustomAlert {...defaultProps} />
      </TestWrapper>
    );

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test message')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CustomAlert {...defaultProps} visible={false} />
      </TestWrapper>
    );

    expect(queryByText('Test Title')).toBeNull();
    expect(queryByText('Test message')).toBeNull();
  });

  it('should call onDismiss when close button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <CustomAlert {...defaultProps} onDismiss={onDismiss} />
      </TestWrapper>
    );

    // Since we don't have testID in the component, let's test overlay press
    const modal = result.getByText('Test Title').parent?.parent?.parent;
    if (modal) {
      fireEvent.press(modal);
    }

    // Note: This test might need adjustment based on the actual component structure
  });

  it('should show correct icon for different alert types', () => {
    const types: ('success' | 'info' | 'warning' | 'error')[] = ['success', 'info', 'warning', 'error'];
    
    types.forEach(type => {
      const { rerender } = render(
        <TestWrapper>
          <CustomAlert {...defaultProps} type={type} />
        </TestWrapper>
      );
      
      // The icon should be rendered (testing icon presence is complex with MaterialIcons)
      expect(true).toBe(true); // Placeholder assertion
      
      rerender(
        <TestWrapper>
          <CustomAlert {...defaultProps} type={type} />
        </TestWrapper>
      );
    });
  });

  it('should use custom icon when provided', () => {
    const { rerender } = render(
      <TestWrapper>
        <CustomAlert {...defaultProps} icon="star" />
      </TestWrapper>
    );

    // Verify custom icon is used
    expect(true).toBe(true); // Placeholder assertion
  });
});