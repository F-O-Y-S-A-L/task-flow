// eslint.config.js
const globals = require ("globals");

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,   // Node.js globals (process, console, setTimeout ইত্যাদি)
        ...globals.jest,   // Jest globals (describe, test, expect ইত্যাদি)
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "error",
    },
  },
];
