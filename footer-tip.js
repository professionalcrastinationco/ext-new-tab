/**
 * "Did you know" tip about Chrome's own footer bar (extension name and a "Customize Chrome"
 * button at the bottom of the page). The page cannot see that bar or turn it off, so after a
 * few days of use we show a short card explaining how the user can hide it. Shown once.
 * Dates are kept on this computer only (chrome.storage.local), because the footer setting
 * belongs to each Chrome profile.
 */
(() => {
  const DAYS_BEFORE_TIP = 3;
  const DAY_MS = 24 * 60 * 60 * 1000;

  async function readState() {
    try {
      const r = await chrome.storage.local.get(['firstSeen', 'footerTipDone']);
      return r || {};
    } catch (e) {
      return { footerTipDone: true }; // storage unavailable: stay quiet
    }
  }

  async function maybeShow() {
    const state = await readState();
    if (state.footerTipDone) return;
    if (!state.firstSeen) {
      try { await chrome.storage.local.set({ firstSeen: Date.now() }); } catch (e) { /* ignore */ }
      return;
    }
    if (Date.now() - state.firstSeen < DAYS_BEFORE_TIP * DAY_MS) return;
    if (document.querySelector('.tour') || document.querySelector('dialog[open]')) return;
    render();
  }

  function render() {
    if (document.getElementById('footerTip')) return;
    const card = document.createElement('div');
    card.id = 'footerTip';
    card.className = 'footer-tip';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Did you know');
    card.innerHTML = `
      <span class="footer-tip-kicker">Did You Know?</span>
      <h2>Hide The Bar At The Bottom</h2>
      <p>Chrome adds a bar with this extension's name and a Customize Chrome button. It is Chrome's, not ours, but you can switch it off:</p>
      <ol>
        <li>Click <strong>Customize Chrome</strong> in the bottom right corner.</li>
        <li>Scroll down to <strong>Footer</strong>.</li>
        <li>Turn off <strong>Show footer on New Tab page</strong>.</li>
      </ol>
      <p class="footer-tip-note">Don't see the bar? Then you're all set.</p>
      <div class="footer-tip-actions"><button type="button" class="btn btn-primary" id="footerTipDone">Got It</button></div>
      <span class="footer-tip-arrow" aria-hidden="true">
        <svg viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"/></svg>
      </span>`;
    document.body.appendChild(card);
    card.querySelector('#footerTipDone').addEventListener('click', async () => {
      card.remove();
      try { await chrome.storage.local.set({ footerTipDone: true }); } catch (e) { /* ignore */ }
    });
  }

  window.DocksideFooterTip = { maybeShow };
})();
