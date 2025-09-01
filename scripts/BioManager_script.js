// BioManager_script.js
// Shell router that swaps the right-panel iframe based on the left-nav selection (hash + data-src).

const frame = document.getElementById('content-frame');
const links = Array.from(document.querySelectorAll('.nav-link'));

function linkForHash(hash) {
  return (
    links.find(l => l.getAttribute('href') === hash) ||
    document.querySelector('.nav-link[data-default]') ||
    links[0] ||
    null
  );
}

function setActive(link) {
  links.forEach(l => l.classList.remove('active'));
  if (link) link.classList.add('active');
}

function navigate(hash) {
  const link = linkForHash(hash);
  if (!link) return;

  const src = link.dataset.src || '';
  setActive(link);

  if (!src) return;
  const abs = new URL(src, location.href).href;
  if (frame.src !== abs) frame.src = abs;
}

// Handle direct hash changes (including back/forward)
window.addEventListener('hashchange', () => navigate(location.hash || ''));

// Make clicks change the hash (so history/back works)
links.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetHash = link.getAttribute('href') || '';
    if (location.hash !== targetHash) {
      e.preventDefault();
      history.pushState(null, '', targetHash);
      navigate(targetHash);
    } else {
      // same hash: still force nav to ensure active state & src are correct
      e.preventDefault();
      navigate(targetHash);
    }
  });
});

// Optional: stub for logout button if present
const logoutBtn = document.getElementById('user-logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    console.log('logout button tapped!');
    alert('logout button tapped!');
  });
}

// Initial route (supports deep linking)
navigate(location.hash || '');
