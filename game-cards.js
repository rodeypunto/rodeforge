/* Shared by the browser and the optional static-content sync tool. No dependencies. */
window.RODEFORGE_CARDS = (games, language, labels) => {
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  return Object.entries(games).map(([id, game], index) => {
    const text = game[language], art = game.art;
    const logo = art.logo
      ? `<img class="project-logo" src="${escape(art.logo)}" width="900" height="298" alt="" loading="lazy" decoding="async">`
      : art.wordmark ? `<span class="project-wordmark" aria-hidden="true">${art.wordmark.map(line=>`<span>${escape(line)}</span>`).join('')}</span>` : '';
    const foreground = art.foreground ? `<img class="project-foreground" src="${escape(art.foreground)}" width="700" height="722" alt="" loading="lazy" decoding="async">` : '';
    const count = String(index + 1).padStart(2,'0');
    return `<article class="project project-${escape(id)} reveal">
      <h3 id="project-${escape(id)}-title" class="sr-only">${escape(game.title)}</h3>
      <button class="project-card" type="button" data-game="${escape(id)}" aria-label="${escape(labels.exploreGame+' '+game.title)}" aria-describedby="project-${escape(id)}-summary" aria-haspopup="dialog" aria-controls="game-dialog">
        <img class="project-world" src="${escape(art.world)}" width="${art.width}" height="${art.height}" alt="" loading="lazy" decoding="async">
        <span class="project-shade" aria-hidden="true"></span>
        <span class="project-topline"><span class="project-status"><i aria-hidden="true"></i>${escape(text.status)}</span><span class="project-number" aria-hidden="true">${count} / RF</span></span>
        <span class="project-identity">${logo}${foreground}</span>
        <span class="project-copy"><span class="project-genre">${escape(text.genre)}</span><span class="project-title">${escape(game.title)}</span><span class="project-summary" id="project-${escape(id)}-summary">${escape(text.summary)}</span><span class="project-bottom"><span class="project-cta">${escape(labels.exploreGame)} <span aria-hidden="true">↗</span></span><span class="project-platform">${escape(text.platform)}</span></span></span>
      </button>
    </article>`;
  }).join('\n');
};
