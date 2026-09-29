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
- Hover or tap an album to bring it slightly forward and read its title and year.
- The phone view starts closer to the left bookshelf; horizontal swipes explore the rest of the room.

Album covers, spines, pages, and thickness are actual 3D geometry. `src/albums.js` defines sample memory labels; `src/scene.js` builds the room and handles input. Sample landscape photos are local assets under `public/memories/`, fetched by `download-memory-photos.mjs` from Unsplash's image service.

This is an animation prototype only. It does not upload, save, organize, or display user photo collections, and it has no backend or separate album routes.
