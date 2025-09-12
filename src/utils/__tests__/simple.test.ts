// Simple test to verify Jest setup
describe('Simple Test Suite', () => {
  it('should run basic math operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
  });

  it('should handle string operations', () => {
    expect('hello' + ' world').toBe('hello world');
    expect('test'.toUpperCase()).toBe('TEST');
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr).toContain(2);
  });
});