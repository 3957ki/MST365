module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // Use the dedicated package as recommended for v4+
    autoprefixer: {},
    // Note: Depending on the exact Vue CLI version and setup,
    // you might need 'tailwindcss' here instead, but let's try the recommended package first.
  },
};
