module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{json,png,ico,html,txt,css,js}',
  ],
  swDest: 'build/sw.js',
  ignoreURLParametersMatching: [
    /^utm_/,
    /^fbclid$/,
  ],
  runtimeCaching: [
    {
      urlPattern: /\.(?:html|css|js|png|gif)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'all',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
        },
      },
    },
  ],
}
