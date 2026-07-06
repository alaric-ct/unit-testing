/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // The naming demo (obscure vs behavioral titles) is run on its own via
  // `npm run test:naming`, so keep it out of the main before/after suite.
  testPathIgnorePatterns: ["/node_modules/", "premium\\.naming"],
};
