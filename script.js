(function () {
  'use strict';

  /* ── Mobile nav ─────────────────────────────────────── */
  var hamburger = document.querySelector('.nav-hamburger');
  var drawer    = document.getElementById('nav-drawer');

  if (hamburger && drawer) {
    hamburger.addEventListener('click', function () {
      var isOpen = !drawer.hidden;
      drawer.hidden = isOpen;
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      hamburger.textContent = isOpen ? '☰' : '✕';
    });

    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        drawer.hidden = true;
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.textContent = '☰';
      });
    });
  }

  /* ── Subscribe scroll: wait for gallery layout before scrolling ─── */
  document.querySelectorAll('[href="#mailing"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById('mailing');
      if (!target) return;

      var imgs    = Array.from(document.querySelectorAll('.sis-gimg'));
      var pending = imgs.filter(function (img) { return !img.complete; });

      if (pending.length === 0) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Switch unloaded images to eager so they download immediately
      pending.forEach(function (img) { img.loading = 'eager'; });

      Promise.all(pending.map(function (img) {
        return new Promise(function (resolve) {
          img.addEventListener('load',  resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      })).then(function () {
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  });

  /* ── Gallery lightbox ────────────────────────────────── */
  var galleryGrid  = document.getElementById('gallery-grid');
  var lightbox     = document.getElementById('lightbox');
  var lightboxImg  = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');

  var lastFocused = null;

  function openLightbox(img) {
    lastFocused = img;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    /* hide everything outside the dialog for screen readers */
    document.querySelectorAll('body > *:not(#lightbox)').forEach(function (el) {
      el.setAttribute('aria-hidden', 'true');
    });

    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    lightboxImg.alt = '';
    document.body.style.overflow = '';

    document.querySelectorAll('body > *').forEach(function (el) {
      el.removeAttribute('aria-hidden');
    });

    if (lastFocused) lastFocused.focus();
  }

  if (galleryGrid) {
    galleryGrid.addEventListener('click', function (e) {
      var img = e.target.closest('.sis-gimg');
      if (img) openLightbox(img);
    });
  }

  if (lightbox) {
    /* close on overlay click, but not on the image itself */
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) {
      closeLightbox();
    }
  });

  /* ── Mailing form ────────────────────────────────────── */
  var ENDPOINT    = 'https://script.google.com/macros/s/AKfycby5fxLtx8P89Hxk6_StxBUfk4nOPi3hOCdoDjNl7l2mmo2lVwtLXoS6NhWR6J6bQO5Y/exec';
  var mailingForm = document.getElementById('mailing-form');
  var statusEl    = document.getElementById('mailing-status');
  var submitBtn   = document.getElementById('mailing-submit');

  if (mailingForm && statusEl && submitBtn) {
    mailingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot — bail silently if a bot filled it
      var honeypot = mailingForm.querySelector('.mailing-honeypot');
      if (honeypot && honeypot.value) return;

      var emailInput = document.getElementById('mailing-email');
      if (!emailInput || !emailInput.value) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      statusEl.hidden = true;
      statusEl.classList.remove('mailing-status--error');

      fetch(ENDPOINT + '?email=' + encodeURIComponent(emailInput.value), {
        method: 'GET',
        mode: 'no-cors'
      })
      .then(function () {
        statusEl.textContent = 'Thanks — you\'re on the list.';
        statusEl.hidden = false;
        mailingForm.reset();
      })
      .catch(function () {
        statusEl.textContent = 'Something went wrong — please try again.';
        statusEl.classList.add('mailing-status--error');
        statusEl.hidden = false;
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
      });
    });
  }

})();
