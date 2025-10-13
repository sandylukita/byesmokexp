import { signIn, signUp } from '../auth';
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

      const result = await signUp('new@example.com', 'password123', 'password123', 'Test User');
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

      await expect(signUp('existing@example.com', 'password123', 'password123', 'Test User')).rejects.toThrow();
    });
  });

});