# Stills — Life, collected.

A frontend-only Three.js memory album gallery inspired by the supplied Alinma motion-design reference: near-black and sage palette, oversized serif typography, and a tightly packed diagonal ribbon of substantial linen albums. The animation follows the supplied WhatsApp video: upright books rise and settle in a travelling wave, with an elevated orthographic camera.

## Run

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Interactions

- Drag or swipe across the page, use the mouse wheel, or press the navigation arrows to browse the 3D album ribbon. An automatic wave lifts neighbouring books in sequence; hovering brings the wave to the pointed-at book. Pause motion stops the automatic animation.
- Click any visible book, or the selected album title, to open it. The cover opens into a 12-page sample photo album.
- Swipe left/right to turn pages. Buttons and arrow keys also work; Home/End select the first/last spread and Escape returns to the collection.
- Filter the carousel with All memories, Travels, Everyday, or Together.
- Album index shows all 24 memories, searchable by title, year, or category. Every album can be opened through keyboard controls.
- Gallery rendering and gestures pause while the index or reader is open. Reduced-motion preferences start the wave paused and disable easing and opening/turning animations.
- Responsive desktop and phone layouts adapt the ribbon spacing and preserve the selected album title and open action.

`src/gallery.js` builds the current 3D collection. `src/main.js` owns navigation, filters, and the searchable index. `src/album-reader.js` implements the reader and its page-turn gestures. `src/albums.js` contains sample metadata, with local images under `public/memories/`.

This prototype uses sample photos. It does not upload, persist, or organize personal files, and has no backend. The previous reading-room implementation remains in `src/scene.js` for reference and is no longer imported into the app.

