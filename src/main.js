import './style.css';
import { books } from './books.js';
import { createBookWall } from './scene.js';

const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m14 6-6 6 6 6"/></svg>';
const shuffle = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3-2 5-5m3-4c1-2 2-3 4-3h3m-4-4 4 4-4 4"/></svg>';
const app = document.querySelector('#app');
app.innerHTML = `
  <main class="bookroom">
    <div id="book-wall" tabindex="0" role="region" aria-label="A curved wall of books. Drag to explore. Click a book to view its details. Arrow keys move the wall; Enter opens the center book."></div>
    <div class="vignette" aria-hidden="true"></div>
    <header class="masthead"><h1> Bookroom</h1><p>A world of books.<br><span>Yours to get lost in.</span></p></header>
    <div class="book-tooltip" id="book-tooltip" aria-hidden="true"></div>
    <section class="discovery-panel" aria-label="Explore the collection">
      <p>A whole world, one book away.</p>
      <span class="panel-description">Drag to explore. See where a cover takes you.</span>
      <div class="panel-actions"><button class="surprise-button" id="surprise">${shuffle}<span>Find my next read</span></button><button class="direction-button" id="previous" aria-label="Move left">${arrow}</button><button class="direction-button next" id="next" aria-label="Move right">${arrow}</button></div>
      <div class="panel-footer"><span>24 books. A little serendipity.</span><button id="reset">Reset view <span>↗</span></button></div>
    </section>
    <span class="corner-note">A place to <strong>get lost.</strong></span>
    <span class="drag-note"><span>↔</span> drag the wall</span>
    <div class="loading" role="status">Opening the bookroom<span></span></div>
    <nav class="accessible-books" aria-label="Choose a book">${books.map(b=>`<button data-book="${b.id}">${b.title}</button>`).join('')}</nav>
    <dialog id="book-dialog" aria-labelledby="dialog-title"><button class="close-button" aria-label="Close book details">×</button><div class="dialog-content"></div></dialog>
  </main>`;

const dialog = document.querySelector('#book-dialog');
let previouslyFocused;
function selectBook(book) {
  if (!dialog.open) previouslyFocused = document.activeElement;
  document.querySelector('.dialog-content').innerHTML = `<div class="detail-cover" style="--book-color:${book.color}"><img src="${book.cover}" alt="Cover of ${book.title}" /></div><div class="detail-copy"><span class="detail-eyebrow">${book.genre} <span>·</span> ${book.year}</span><h2 id="dialog-title">${book.title}</h2><p class="author">${book.author}</p><p class="description">${book.description}</p><div class="detail-bottom"><span>A little escape between pages.</span><button class="another-book">${shuffle}<span>Another book</span></button></div></div>`;
  document.querySelector('.another-book').addEventListener('click', () => selectBook(randomBook(book.id)));
  if (!dialog.open) dialog.showModal();
}
function randomBook(exclude = -1) { const choices = books.filter(b => b.id !== exclude); return choices[Math.floor(Math.random()*choices.length)]; }
dialog.querySelector('.close-button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if(e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { previouslyFocused?.focus(); });
document.querySelector('#surprise').addEventListener('click',()=>selectBook(randomBook()));
document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',()=>selectBook(books[Number(b.dataset.book)])));

try {
  const wall = createBookWall(document.querySelector('#book-wall'), books, {
    onSelect:selectBook,
    onReady:()=>document.querySelector('.loading')?.remove(),
    onHover:(book,x,y)=>{const tooltip=document.querySelector('#book-tooltip'); tooltip.textContent=book?.title||'';tooltip.style.left=`${Math.min(x+16,innerWidth-230)}px`;tooltip.style.top=`${y+18}px`;tooltip.classList.toggle('visible',!!book);},
  });
  document.querySelector('#previous').addEventListener('click',()=>wall.move(.22,0));
  document.querySelector('#next').addEventListener('click',()=>wall.move(-.22,0));
  document.querySelector('#reset').addEventListener('click',wall.reset);
  document.querySelector('#book-wall').addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','Home'].includes(e.key))e.preventDefault();
    if(e.key==='ArrowLeft')wall.move(.2,0);
    if(e.key==='ArrowRight')wall.move(-.2,0);
    if(e.key==='ArrowUp')wall.move(0,-1.4);
    if(e.key==='ArrowDown')wall.move(0,1.4);
    if(e.key==='Home')wall.reset();
    if(e.key==='Enter')wall.openCenter();
  });
  window.addEventListener('pagehide',wall.dispose,{once:true});
} catch(error) {
  console.error(error);
  document.querySelector('.loading')?.remove();
  document.querySelector('#book-wall').innerHTML=`<div class="fallback-grid">${books.map(b=>`<button data-fallback-book="${b.id}"><img src="${b.cover}" alt="${b.title}"/><span>${b.title}</span></button>`).join('')}</div>`;
  document.querySelectorAll('[data-fallback-book]').forEach(b=>b.addEventListener('click',()=>selectBook(books[Number(b.dataset.fallbackBook)])));
  ['previous','next','reset'].forEach(id=>document.getElementById(id).disabled=true);
}
