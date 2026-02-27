/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      { tsconfig: "tsconfig.test.json" },
    ],
  },
};
