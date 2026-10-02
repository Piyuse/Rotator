import './style.css';
import { albums } from './albums.js';
import { createMemoryRoom } from './scene.js';
import { createAlbumReader } from './album-reader.js';

const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m14 6-6 6 6 6"/></svg>';
const reset = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></svg>';

document.querySelector('#app').innerHTML = `
  <main class="memory-room">
    <header class="room-header"><span class="wordmark">stills<span>.</span></span><div><span class="eyebrow">THE MEMORY ROOM</span><p>A little place for a life well lived.</p></div><span class="room-number">ROOM 01</span></header>
    <div id="room-scene" tabindex="0" role="region" aria-label="Interactive 3D memory bookshelf. Click an album to open it. Swipe anywhere to move the room. Arrow keys move the view. Home resets it."></div>
    <div class="loading" role="status"><span></span>Making room for your memories</div>
    <div class="album-label" id="album-label" aria-live="polite"></div>
    <footer class="room-footer"><div class="room-note"><span class="tiny-line"></span><span>The places. The people. The in-between.</span></div><div class="navigation"><button id="turn-left" aria-label="Turn room left">${arrow}</button><span class="navigation-caption">SWIPE TO EXPLORE</span><button id="turn-right" aria-label="Turn room right">${arrow}</button><span class="separator"></span><button id="reset-view" aria-label="Reset room view" title="Reset view">${reset}</button></div><span class="scroll-note">Drag anywhere <span>·</span> Scroll to move</span></footer>
    <nav class="keyboard-albums" aria-label="Open a photo album">${albums.map(album => `<button data-album="${album.id}">${album.title}, ${album.year}</button>`).join('')}</nav>
  </main>`;

let room;
const reader = createAlbumReader({
  onOpen: () => room?.setActive(false),
  onClose: () => room?.setActive(true),
});
document.querySelector('.scroll-note').innerHTML = 'Drag to explore <span>·</span> Click an album to open';
document.querySelectorAll('[data-album]').forEach(button => {
  button.addEventListener('click', () => reader.open(albums[Number(button.dataset.album)]));
});

try {
  room = createMemoryRoom(document.querySelector('#room-scene'), albums, {
    onSelect: album => reader.open(album),
    onReady: () => { document.querySelector('.loading')?.remove(); document.querySelector('.memory-room').classList.add('ready'); },
    onHover: album => {
      const label = document.querySelector('#album-label');
      label.innerHTML = album ? `<strong>${album.title}</strong><span>${album.year} · Click to open</span>` : '';
      label.classList.toggle('visible', Boolean(album));
    },
  });
  document.querySelector('#turn-left').addEventListener('click', () => room.move(-.22, 0));
  document.querySelector('#turn-right').addEventListener('click', () => room.move(.22, 0));
  document.querySelector('#reset-view').addEventListener('click', room.reset);
  document.addEventListener('keydown', event => {
    if (reader.isOpen || event.target.closest('button')) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowLeft') room.move(-.14, 0);
    if (event.key === 'ArrowRight') room.move(.14, 0);
    if (event.key === 'ArrowUp') room.move(0, .3);
    if (event.key === 'ArrowDown') room.move(0, -.3);
    if (event.key === 'Home') room.reset();
  });
  window.addEventListener('pagehide', room.dispose, { once: true });
} catch (error) {
  console.error(error);
  document.querySelector('.loading').innerHTML = 'This room needs WebGL. Please enable hardware acceleration in your browser.';
  document.querySelectorAll('button').forEach(button => { button.disabled = true; });
}
