/* PersonaLearn — Main JS */
document.addEventListener('DOMContentLoaded', function () {

  // ── Auto-dismiss alerts after 4s ─────────────────────────────
  document.querySelectorAll('.alert-dismissible').forEach(function (el) {
    setTimeout(function () {
      const a = bootstrap.Alert.getOrCreateInstance(el);
      if (a) a.close();
    }, 4500);
  });

  // ── Animate progress bars on load ────────────────────────────
  document.querySelectorAll('.progress-bar-fill[data-width]').forEach(function (bar) {
    const target = parseFloat(bar.dataset.width) || 0;
    bar.style.width = '0%';
    setTimeout(function () {
      bar.style.width = target + '%';
    }, 200);
  });

  // ── Content card selection highlight ─────────────────────────
  document.querySelectorAll('.btn-select-content').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const cardId = this.dataset.cardId;
      document.querySelectorAll('.content-card').forEach(function (c) {
        c.classList.remove('is-selected');
      });
      const card = document.getElementById('cc-' + cardId);
      if (card) card.classList.add('is-selected');
    });
  });

  // ── Scroll-reveal animation ───────────────────────────────────
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    document.querySelectorAll('.anim-fade-up').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      io.observe(el);
    });
  }

  // ── Navbar shadow on scroll ───────────────────────────────────
  const nav = document.querySelector('.navbar-main');
  window.addEventListener('scroll', function () {
    if (!nav) return;
    if (window.scrollY > 10) {
      nav.style.boxShadow = '0 1px 12px rgba(15,23,42,0.08)';
    } else {
      nav.style.boxShadow = '';
    }
  }, { passive: true });

  // ── Bootstrap tooltips ────────────────────────────────────────
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    new bootstrap.Tooltip(el, { trigger: 'hover' });
  });

});
