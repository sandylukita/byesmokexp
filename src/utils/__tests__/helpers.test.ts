import {
  calculateDaysSinceQuit,
  calculateMoneySaved,
  calculateLevel,
  formatCurrency,
  formatNumber,
  canCheckInToday,
  calculateStreak,
  addDailyXP,
} from '../helpers';

describe('Helper Functions', () => {
  describe('calculateDaysSinceQuit', () => {
    it('should calculate correct days since quit date', () => {
      const quitDate = new Date('2024-01-01');
      const today = new Date('2024-01-10');
      
      // Mock Date.now to return fixed date
      const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => today as any);
      
      const result = calculateDaysSinceQuit(quitDate);
      expect(result).toBe(9);
      
      mockDate.mockRestore();
    });

    it('should return 0 for future quit date', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const result = calculateDaysSinceQuit(futureDate);
      expect(result).toBe(0);
    });
  });

  describe('calculateMoneySaved', () => {
    it('should calculate money saved correctly', () => {
      const days = 30;
      const cigarettesPerDay = 20;
      const pricePerCigarette = 1000; // 1000 rupiah per cigarette
      
      const result = calculateMoneySaved(days, cigarettesPerDay, pricePerCigarette);
      expect(result).toBe(600000); // 30 * 20 * 1000
    });

    it('should handle zero values', () => {
      expect(calculateMoneySaved(0, 20, 1000)).toBe(0);
      expect(calculateMoneySaved(30, 0, 1000)).toBe(0);
      expect(calculateMoneySaved(30, 20, 0)).toBe(0);
    });
  });

  describe('calculateLevel', () => {
    it('should calculate correct level and progress', () => {
      const xp = 250;
      const result = calculateLevel(xp);
      
      expect(result.level).toBeGreaterThan(1);
      expect(result.progress).toBeGreaterThanOrEqual(0);
      expect(result.progress).toBeLessThanOrEqual(100);
      expect(result.nextLevelXP).toBeGreaterThan(xp);
    });

    it('should handle zero XP', () => {
      const result = calculateLevel(0);
      expect(result.level).toBe(1);
      expect(result.progress).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format Indonesian currency correctly', () => {
      expect(formatCurrency(1000000)).toBe('Rp 1,000,000');
      expect(formatCurrency(500)).toBe('Rp 500');
      expect(formatCurrency(0)).toBe('Rp 0');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(500)).toBe('500');
    });
  });

  describe('canCheckInToday', () => {
    it('should return true for first check-in', () => {
      expect(canCheckInToday(null)).toBe(true);
    });

    it('should return false for same day check-in', () => {
      const today = new Date();
      expect(canCheckInToday(today)).toBe(false);
    });

    it('should return true for check-in from previous day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(canCheckInToday(yesterday)).toBe(true);
    });
  });

  describe('calculateStreak', () => {
    it('should not reset streak for consecutive days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = calculateStreak(yesterday);
      expect(result.streakReset).toBe(false);
    });

    it('should reset streak for missed days', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const result = calculateStreak(threeDaysAgo);
      expect(result.streakReset).toBe(true);
    });

    it('should not reset streak for first check-in', () => {
      const result = calculateStreak(null);
      expect(result.streakReset).toBe(false);
    });
  });

  describe('addDailyXP', () => {
    it('should add XP to existing daily XP record', () => {
      const dailyXP = { '2024-01-01': 10 };
      const result = addDailyXP(dailyXP, 5);
      
      const today = new Date().toISOString().split('T')[0];
      expect(result[today]).toBe(5);
      expect(result['2024-01-01']).toBe(10);
    });

    it('should create new daily XP record', () => {
      const result = addDailyXP({}, 15);
      const today = new Date().toISOString().split('T')[0];
      expect(result[today]).toBe(15);
    });

    it('should accumulate XP for same day', () => {
      const today = new Date().toISOString().split('T')[0];
      const dailyXP = { [today]: 10 };
      
      const result = addDailyXP(dailyXP, 5);
      expect(result[today]).toBe(15);
    });
  });
});