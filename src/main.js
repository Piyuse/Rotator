import './style.css';
import { albums } from './albums.js';
import { createAlbumGallery } from './gallery.js';
import { createAlbumReader } from './album-reader.js';

const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const categories = ['All memories', 'Travels', 'Everyday', 'Together'];
const everyday = new Set([4, 5, 8, 14, 17, 18]);
const together = new Set([3, 11, 12, 15, 20, 23]);
const category = album => together.has(album.id) ? 'Together' : everyday.has(album.id) ? 'Everyday' : 'Travels';
let gallery, selectedAlbum = albums[0], filtered = albums;
document.querySelector('#app').innerHTML = `
  <main class="collection">
    <header class="site-header"><a class="wordmark" href="/" aria-label="Stills home">stills<span>®</span></a><span class="header-note">A HOME FOR YOUR MEMORIES</span><button class="index-trigger">Album index <span>↗</span></button></header>
    <section class="gallery-intro" aria-labelledby="gallery-title"><div class="intro-topline"><span class="eyebrow"><i></i> YOUR LIFE, ON THE RECORD</span><span class="edition">THE PERSONAL COLLECTION — VOL. 01</span></div><div class="title-row"><h1 id="gallery-title">Life, <em>collected.</em></h1><p>Places you went.<br> People you love.<br> Days worth keeping.</p></div><div class="collection-toolbar"><nav class="category-tabs" aria-label="Filter albums">${categories.map((label, index) => `<button data-category="${label}" aria-pressed="${index === 0}">${label}${index === 0 ? '<sup>24</sup>' : ''}</button>`).join('')}</nav><span class="collection-count">24 albums <span>·</span> Made of moments</span></div></section>
    <section class="gallery-stage" aria-label="Animated 3D album ribbon. Hover to lift the books. Drag or scroll to browse. Click a book to open it." tabindex="0"><div id="album-gallery"></div><div class="gallery-loading" role="status">Gathering your memories<span></span></div><div class="gallery-vignette"></div><button class="motion-toggle" aria-label="Pause wave animation" aria-pressed="true"><span class="motion-symbol">Ⅱ</span><span class="motion-label">Pause motion</span></button></section>
    <footer class="collection-footer"><div class="browse-hint"><span class="gesture-icon">↔</span><div>Take a little look back.<small>DRAG OR SCROLL TO EXPLORE</small></div></div><div class="selected-album"><span class="album-meta"></span><button class="open-album"><span></span>${arrow}</button></div><div class="gallery-navigation"><button id="previous-album" aria-label="Previous album">${arrow}</button><span class="album-position" aria-live="polite"></span><button id="next-album" aria-label="Next album">${arrow}</button></div></footer>
    <div class="bottom-line"><span>KEEP THE FEELING.</span><span>YOUR OWN LITTLE CORNER OF FOREVER.</span><span>STILLS / 2026</span></div>
  </main>
  <dialog class="album-index" aria-labelledby="index-title"><header><div><span class="eyebrow">THE COMPLETE COLLECTION</span><h2 id="index-title">Every chapter.</h2></div><button class="close-index" aria-label="Close album index">×</button></header><label class="search-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input type="search" placeholder="Find a place, a person, a memory…" aria-label="Search albums"/></label><div class="index-grid"></div><p class="no-results" hidden>No albums found. Try another memory.</p><p class="index-note">24 sample albums. A collection waiting to become yours.</p></dialog>`;

const indexDialog = document.querySelector('.album-index');
const reader = createAlbumReader({ onOpen: () => gallery?.setActive(false), onClose: () => gallery?.setActive(true) });
function openAlbum(album) { if (indexDialog.open) indexDialog.close(); reader.open(album); }
function renderIndex() {
  const query = indexDialog.querySelector('input').value.trim().toLowerCase();
  const matches = albums.filter(album => `${album.title} ${album.year} ${category(album)}`.toLowerCase().includes(query));
  indexDialog.querySelector('.index-grid').innerHTML = matches.map(album => `<button class="index-album" data-album="${album.id}"><span class="index-cover" style="--cover:${album.color}"><img src="${album.photo}" alt=""/><span>${album.title}</span></span><strong>${album.title}</strong><small>${album.year} / ${category(album)}</small></button>`).join('');
  indexDialog.querySelector('.no-results').hidden = matches.length > 0;
}
document.querySelector('.index-trigger').addEventListener('click', () => { renderIndex(); gallery?.setActive(false); indexDialog.showModal(); });
document.querySelector('.close-index').addEventListener('click', () => indexDialog.close());
indexDialog.addEventListener('close', () => { if (!reader.isOpen) gallery?.setActive(true); });
indexDialog.querySelector('input').addEventListener('input', renderIndex);
indexDialog.addEventListener('click', event => { const button = event.target.closest('[data-album]'); if (button) openAlbum(albums[Number(button.dataset.album)]); });
document.querySelector('.open-album').addEventListener('click', () => openAlbum(selectedAlbum));
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  filtered = albums.filter(album => button.dataset.category === 'All memories' || category(album) === button.dataset.category);
  document.querySelectorAll('[data-category]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
  document.querySelector('.collection-count').innerHTML = `${filtered.length} albums <span>·</span> Made of moments`;
  gallery?.setAlbums(filtered);
}));
try {
  gallery = createAlbumGallery(document.querySelector('#album-gallery'), albums, {
    onMotionChange: enabled => {
      const button = document.querySelector('.motion-toggle');
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', enabled ? 'Pause wave animation' : 'Play wave animation');
      button.querySelector('.motion-symbol').textContent = enabled ? 'Ⅱ' : '▷';
      button.querySelector('.motion-label').textContent = enabled ? 'Pause motion' : 'Play motion';
    },
    onReady: () => { document.querySelector('.gallery-loading')?.remove(); document.querySelector('.collection').classList.add('ready'); },
    onSelect: openAlbum,
    onChange: (album, index, total) => {
      selectedAlbum = album;
      document.querySelector('.open-album span').textContent = album.title;
      document.querySelector('.open-album').setAttribute('aria-label', `Open ${album.title}`);
      document.querySelector('.album-meta').textContent = `${album.year} / ${category(album)} / 12 pages`;
      document.querySelector('.album-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    },
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const button = document.querySelector('.motion-toggle');
    button.setAttribute('aria-pressed', 'false'); button.setAttribute('aria-label', 'Play wave animation');
    button.querySelector('.motion-symbol').textContent = '▷'; button.querySelector('.motion-label').textContent = 'Play motion';
  }
  document.querySelector('.motion-toggle').addEventListener('click', () => gallery.toggleMotion());
  document.querySelector('#previous-album').addEventListener('click', () => gallery.step(-1));
  document.querySelector('#next-album').addEventListener('click', () => gallery.step(1));
  document.addEventListener('keydown', event => {
    if (reader.isOpen || indexDialog.open || event.target.closest('button,a,input')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); gallery.step(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Enter') { event.preventDefault(); openAlbum(selectedAlbum); }
  });
  window.addEventListener('pagehide', gallery.dispose, { once: true });
} catch (error) {
  console.error(error);
  document.querySelector('.gallery-loading').textContent = 'The 3D gallery needs WebGL. You can still browse every memory in the album index.';
}
