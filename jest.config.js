// Base config file that should be imported
// and extended by each project that uses Jest
module.exports = {
  roots: [],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // preset: "ts-jest",
  // coverageReporters: ["json", "lcov", "text", "clover", "cobertura"],
  // reporters: [
  //   "default",
  //   [
  //     "jest-junit",
  //     {
  //       outputDirectory: "<rootDir>/coverage",
  //       usePathForSuiteName: "true",
  //     },
  //   ],
  // ],
};
