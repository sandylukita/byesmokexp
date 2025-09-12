import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';
import { TYPOGRAPHY } from '../utils/typography';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state to show the error UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('🚨 Error Info:', errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Report to crash analytics service here
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.errorContainer}>
              <MaterialIcons 
                name="error-outline" 
                size={64} 
                color={COLORS.error} 
                style={styles.errorIcon}
              />
              
              <Text style={styles.title}>
                Oops! Terjadi Kesalahan
              </Text>
              
              <Text style={styles.message}>
                Aplikasi mengalami masalah yang tidak terduga. Jangan khawatir, data Anda aman.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={this.handleRetry}
                >
                  <MaterialIcons name="refresh" size={20} color={COLORS.white} />
                  <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>

              {__DEV__ && this.state.error && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>Debug Info (Development Only):</Text>
                  <Text style={styles.debugText}>
                    {this.state.error.name}: {this.state.error.message}
                  </Text>
                  {this.state.errorInfo && (
                    <Text style={styles.debugText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.xl,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 350,
    alignSelf: 'center',
  },
  errorIcon: {
    marginBottom: SIZES.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  message: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xl,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: SIZES.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.buttonRadius,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    marginLeft: SIZES.xs,
  },
  debugContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.xs,
    padding: SIZES.md,
    marginTop: SIZES.lg,
    width: '100%',
  },
  debugTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: SIZES.xs,
  },
  debugText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 11,
  },
});

export default ErrorBoundary;