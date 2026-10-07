# Stills — A home for memories

A frontend-only Three.js collection of memory albums. A tightly packed row of upright books sits on a wood shelf within a warm, editorial interface. As the shelf moves sideways, the featured book pivots from its spine to reveal its cover.

## Run

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Interactions

- Swipe or drag anywhere outside the controls, scroll, or use the left/right keyboard arrows to browse the books.
- Hover a book for its title, or click/tap it to swing its cover forward before opening the page-turning photo album.
- In the album, swipe or drag to turn pages, use the page controls, or press left/right. Escape or Back to collection closes it.
- Filter with All memories, Travel, Everyday, and Together. Nonmatching books fade back while matching albums stay prominent.
- Use the subtle shelf-edge arrows to browse one matching album at a time.
- View all albums opens a searchable collection index. Search by title, year, or category.
- The animation respects reduced-motion settings and pauses behind the open album and index.

`src/shelf-gallery.js` creates the 3D books and their sliding, pivoting animation. `src/main.js` owns layout and navigation. `src/warm-theme.css` applies the monochromatic espresso and chestnut palette while leaving the book covers colorful. `src/album-reader.js` renders the selected book as a page-turning photo album. `src/albums.js` contains sample metadata, with local images under `public/memories/`.

This prototype uses sample photos. It does not upload, persist, or organize personal files and has no backend.
