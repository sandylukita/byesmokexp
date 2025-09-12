// Basic Jest setup for React Native testing
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
