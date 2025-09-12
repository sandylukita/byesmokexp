import { signIn, signUp, getFirebaseErrorMessage } from '../auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Mock Firebase auth
jest.mock('firebase/auth');
jest.mock('../firebase', () => ({
  auth: {},
  db: {},
}));

const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);

      const result = await signIn('test@example.com', 'password123');
      expect(result).toEqual(mockUser);
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // auth object
        'test@example.com',
        'password123'
      );
    });

    it('should throw error for invalid credentials', async () => {
      const mockError = { code: 'auth/invalid-credential' };
      mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(signIn('test@example.com', 'wrongpassword')).rejects.toThrow();
    });
  });

  describe('signUp', () => {
    it('should create user successfully', async () => {
      const mockUser = { uid: 'new-uid', email: 'new@example.com' };
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);

      const result = await signUp('new@example.com', 'password123');
      expect(result).toEqual(mockUser);
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'new@example.com',
        'password123'
      );
    });

    it('should throw error for existing email', async () => {
      const mockError = { code: 'auth/email-already-in-use' };
      mockCreateUserWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(signUp('existing@example.com', 'password123')).rejects.toThrow();
    });
  });

  describe('getFirebaseErrorMessage', () => {
    it('should return correct error message for known error codes', () => {
      expect(getFirebaseErrorMessage('auth/user-not-found')).toBe('Invalid email or password');
      expect(getFirebaseErrorMessage('auth/wrong-password')).toBe('Invalid email or password');
      expect(getFirebaseErrorMessage('auth/invalid-email')).toBe('Please enter a valid email address');
      expect(getFirebaseErrorMessage('auth/email-already-in-use')).toBe('An account with this email already exists');
    });

    it('should return default message for unknown error codes', () => {
      expect(getFirebaseErrorMessage('unknown-error')).toBe('An error occurred. Please try again.');
    });

    it('should handle undefined error code', () => {
      expect(getFirebaseErrorMessage(undefined as any)).toBe('An error occurred. Please try again.');
    });
  });
});