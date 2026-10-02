# Stills — The memory room

A frontend-only Three.js animation inspired by the supplied reading-room reference: cream built-in shelves, substantial linen-bound photo albums, a window seat, greenery, an armchair, and warm lighting.

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

## Interaction

- Drag or swipe anywhere on the page to turn and move the 3D room in the gesture's direction. Header and empty background areas work too; actual control buttons retain their normal actions.
- Scroll vertically to move the room vertically. Horizontal trackpad scrolling or Shift + wheel turns the room horizontally.
- Motion eases to a stop within bounded movement limits; reduced-motion settings disable inertia and easing.
- Arrow keys move the view. Home or Reset restores the original composition.
- Hover an album to bring it slightly forward and reveal its title. Click or tap it to open the full-screen photo reader.
- In the reader, the linen cover opens to a 12-page sample album. Swipe left/right to turn paper sheets, or use the previous/next buttons and arrow keys. Short swipes settle back; the first and last spreads are bounded. Home/End jump to the beginning/end and Escape closes the album.
- Returning to the room preserves its camera position. Room gestures and rendering pause while the reader is open. A keyboard-accessible album list is available through Tab navigation.
- The phone view starts closer to the left bookshelf; horizontal swipes explore the rest of the room.

Album covers, spines, pages, and thickness are actual 3D geometry. `src/albums.js` defines sample memory labels; `src/scene.js` builds the room and handles input. Sample landscape photos are local assets under `public/memories/`, fetched by `download-memory-photos.mjs` from Unsplash's image service.

This frontend prototype displays sample memories in `src/album-reader.js`. It does not upload, save, or organize user photos and has no backend or separate album routes. The pot on the window sill has been removed; the plants above the shelving remain.

The window uses `public/memories/window-sea.png`, a photorealistic coastal scene with gulls created with the built-in image-generation tool. Its generation prompt is saved alongside it as `window-sea-prompt.txt`. The view preserves the image's aspect ratio and natural colors independently of the room's lighting. Gulls are part of the photograph, not a separate animation.
