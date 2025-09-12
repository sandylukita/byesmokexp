module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/*.(test|spec).(ts|tsx|js)"
  ],
  transform: {
    "^.+\.tsx?$": "ts-jest"
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "\!src/**/*.d.ts",
    "\!src/types/**/*",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
