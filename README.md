# The Bookroom

A fresh book-browsing experience inspired by the curved card wall at https://www.bubbbly.com/jukebox.

The fullscreen Three.js wall displays 24 book covers in a repeating cylindrical arrangement. Drag in either direction, scroll vertically, select a cover for details, or use the random-pick control. Arrow keys move the focused wall; Enter selects the center book; Escape dismisses details. A keyboard-accessible list and a WebGL fallback are included.

## Development

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Serve `dist/` as a static site. There are no backend services, API keys, uploads, or separate book routes.

Book covers are served locally from `public/covers/`, downloaded from the Open Library Covers service. `download-covers.mjs` can refresh them. Metadata and descriptions are in `src/books.js`; the wall rendering and input handling are in `src/scene.js`.
