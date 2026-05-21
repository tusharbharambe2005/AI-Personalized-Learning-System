/* PersonaLearn — Main JS */
document.addEventListener('DOMContentLoaded', function () {

  // ── Auto-dismiss alerts after 4.5s ───────────────────────────
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
    setTimeout(function () { bar.style.width = target + '%'; }, 200);
  });

  // ── Sequential progress bar on topic page ────────────────────
  document.querySelectorAll('.seq-progress-fill[data-width]').forEach(function (bar) {
    const target = parseFloat(bar.dataset.width) || 0;
    bar.style.width = '0%';
    setTimeout(function () { bar.style.width = target + '%'; }, 300);
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
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.92) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(14px)';
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        io.observe(el);
      }
    });
  }

  // ── Navbar shadow on scroll ───────────────────────────────────
  const nav = document.querySelector('.navbar-main');
  window.addEventListener('scroll', function () {
    if (!nav) return;
    nav.style.boxShadow = window.scrollY > 10
      ? '0 1px 12px rgba(15,23,42,0.08)' : '';
  }, { passive: true });

  // ── Bootstrap tooltips ────────────────────────────────────────
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    new bootstrap.Tooltip(el, { trigger: 'hover' });
  });

  // ── Mobile nav drawer ─────────────────────────────────────────
  const openBtn  = document.getElementById('mobileNavOpen');
  const closeBtn = document.getElementById('mobileNavClose');
  const drawer   = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openBtn)  openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  if (drawer) {
    drawer.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });


  // ═══════════════════════════════════════════════════════════════
  //  SEQUENTIAL CONTENT DELIVERY — Topic Detail Page
  // ═══════════════════════════════════════════════════════════════

  const plData = window.PERSONA_LEARN;
  if (!plData) return; // Not on topic detail page

  let currentContentId = plData.currentContentId;
  let seenCount = plData.seenCount;
  const totalVersions = plData.totalVersions;
  const topicId = plData.topicId;
  let selectedRating = null;

  // ── CSRF Token ────────────────────────────────────────────────
  function getCsrfToken() {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
    return cookie ? cookie.split('=')[1] : '';
  }

  // ── Elements ──────────────────────────────────────────────────
  const cardWrapper = document.getElementById('content-card-wrapper');
  const progressCurrent = document.getElementById('progress-current');
  const progressFill = document.getElementById('progress-fill');
  const progressPct = document.getElementById('progress-pct');

  // If no content card present (exhausted or no content), stop
  if (!document.getElementById('btn-rate')) return;

  // ── Bind all card interaction logic ───────────────────────────
  bindCardListeners();

  function bindCardListeners() {
    const btnRate = document.getElementById('btn-rate');
    const btnSkip = document.getElementById('btn-skip');
    const starSection = document.getElementById('star-rating');
    const starContainer = document.getElementById('star-container');
    const btnSubmit = document.getElementById('btn-submit-rating');
    const seqActions = document.getElementById('seq-actions');

    if (!btnRate || !btnSkip) return;

    // ── Star selection ──────────────────────────────────────────
    if (starContainer) {
      starContainer.querySelectorAll('.seq-star-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectedRating = parseInt(this.dataset.rating);
          starContainer.querySelectorAll('.seq-star-btn').forEach(function (b) {
            const r = parseInt(b.dataset.rating);
            if (r <= selectedRating) {
              b.classList.add('active');
              b.querySelector('i').className = 'bi bi-star-fill';
            } else {
              b.classList.remove('active');
              b.querySelector('i').className = 'bi bi-star';
            }
          });
          if (btnSubmit) btnSubmit.disabled = false;
        });

        btn.addEventListener('mouseenter', function () {
          const hoverRating = parseInt(this.dataset.rating);
          starContainer.querySelectorAll('.seq-star-btn').forEach(function (b) {
            const r = parseInt(b.dataset.rating);
            if (r <= hoverRating) {
              b.querySelector('i').className = 'bi bi-star-fill';
            } else if (!b.classList.contains('active')) {
              b.querySelector('i').className = 'bi bi-star';
            }
          });
        });

        btn.addEventListener('mouseleave', function () {
          starContainer.querySelectorAll('.seq-star-btn').forEach(function (b) {
            const r = parseInt(b.dataset.rating);
            if (selectedRating && r <= selectedRating) {
              b.querySelector('i').className = 'bi bi-star-fill';
            } else {
              b.querySelector('i').className = 'bi bi-star';
            }
          });
        });
      });
    }

    // ── "This helped me — Rate it" ──────────────────────────────
    btnRate.addEventListener('click', function () {
      seqActions.style.display = 'none';
      starSection.style.display = 'flex';
      starSection.classList.add('seq-fade-in');
    });

    // ── "Submit Rating" ─────────────────────────────────────────
    if (btnSubmit) {
      btnSubmit.addEventListener('click', async function () {
        if (!selectedRating) return;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="bi bi-hourglass-split"></i>Saving…';

        try {
          const res = await fetch('/api/submit-interaction/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
              content_version_id: currentContentId,
              rating: selectedRating,
              skipped: false,
            }),
          });
          const data = await res.json();

          seenCount++;
          updateProgress();

          // Fade out card → show thank-you with "Next Topic" button
          const card = document.getElementById('seq-card');
          if (card) {
            card.classList.add('seq-fade-out');
            setTimeout(function () {
              card.style.display = 'none';
              showThankYouMessage(data);
            }, 400);
          } else {
            showThankYouMessage(data);
          }
        } catch (err) {
          console.error('Submit rating error:', err);
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<i class="bi bi-check2-circle"></i>Submit Rating';
        }
      });
    }

    // ── "Not Interested" ────────────────────────────────────────
    btnSkip.addEventListener('click', async function () {
      btnSkip.disabled = true;
      btnSkip.innerHTML = '<i class="bi bi-hourglass-split"></i>Skipping…';

      try {
        const res = await fetch('/api/submit-interaction/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          },
          body: JSON.stringify({
            content_version_id: currentContentId,
            rating: null,
            skipped: true,
          }),
        });
        const data = await res.json();

        seenCount++;
        updateProgress();

        if (data.exhausted) {
          fadeOutCard(function () { showCompletionMessage(); });
        } else if (data.next_content) {
          fadeOutCard(function () { animateCardReplacement(data.next_content); });
        }
      } catch (err) {
        console.error('Skip error:', err);
        btnSkip.disabled = false;
        btnSkip.innerHTML = '<i class="bi bi-x-lg"></i><span>Not Interested</span>';
      }
    });
  }

  // ── Fade out current card ─────────────────────────────────────
  function fadeOutCard(callback) {
    const card = document.getElementById('seq-card');
    if (card) {
      card.classList.add('seq-fade-out');
      setTimeout(callback, 400);
    } else {
      callback();
    }
  }

  // ── Animate new card in ───────────────────────────────────────
  function animateCardReplacement(cv) {
    currentContentId = cv.id;
    selectedRating = null;
    cardWrapper.innerHTML = buildCardHTML(cv) + '<div id="feedback-message" style="display:none;"></div>';
    const newCard = document.getElementById('seq-card');
    if (newCard) newCard.classList.add('seq-fade-in');
    bindCardListeners();
  }

  // ── Build card HTML ───────────────────────────────────────────
  function formatContent(text) {
    // Convert newlines to proper HTML paragraphs/breaks
    if (!text) return '';
    return text
      .split(/\n\n+/)                    // Double newlines → paragraphs
      .map(function (para) {
        return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
      })
      .join('');
  }

  function buildCardHTML(cv) {
    return `
      <div class="seq-card" id="seq-card">
        <div class="seq-card-accent accent-${cv.style_type}"></div>
        <div class="seq-card-head">
          <span class="style-chip chip-${cv.style_type}">
            <i class="${cv.style_icon}"></i>
            ${cv.style_display}
          </span>
        </div>
        <h3 class="seq-card-title">${cv.title}</h3>
        <div class="seq-card-body">${formatContent(cv.content)}</div>
        <div class="seq-actions" id="seq-actions">
          <button class="seq-btn-rate" id="btn-rate">
            <i class="bi bi-star-fill"></i>
            <span>This helped me — Rate it</span>
          </button>
          <button class="seq-btn-skip" id="btn-skip">
            <i class="bi bi-x-lg"></i>
            <span>Not Interested</span>
          </button>
        </div>
        <div class="seq-star-section" id="star-rating" style="display:none;">
          <p class="seq-star-prompt">How helpful was this explanation?</p>
          <div class="seq-stars" id="star-container">
            <button class="seq-star-btn" data-rating="1" title="1 star"><i class="bi bi-star"></i></button>
            <button class="seq-star-btn" data-rating="2" title="2 stars"><i class="bi bi-star"></i></button>
            <button class="seq-star-btn" data-rating="3" title="3 stars"><i class="bi bi-star"></i></button>
            <button class="seq-star-btn" data-rating="4" title="4 stars"><i class="bi bi-star"></i></button>
            <button class="seq-star-btn" data-rating="5" title="5 stars"><i class="bi bi-star"></i></button>
          </div>
          <button class="seq-btn-submit" id="btn-submit-rating" disabled>
            <i class="bi bi-check2-circle"></i>Submit Rating
          </button>
        </div>
      </div>
    `;
  }

  // ── Update progress bar ───────────────────────────────────────
  function updateProgress() {
    const displayNum = Math.min(seenCount + 1, totalVersions);
    const pct = Math.min(Math.round((seenCount / totalVersions) * 100), 100);
    if (progressCurrent) progressCurrent.textContent = displayNum;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressPct) progressPct.textContent = pct + '%';
  }

  // ── Thank-you message with "Next Topic" + "More Styles" ──────
  function showThankYouMessage(data) {
    const msgEl = document.getElementById('feedback-message');
    if (!msgEl) return;

    // Build action buttons
    let actions = '';

    // "Explore More Styles" button — reload this page to see the next style
    actions += `
      <a href="" class="seq-ty-btn seq-ty-btn-outline" onclick="location.reload(); return false;">
        <i class="bi bi-arrow-clockwise"></i>Explore More Styles
      </a>
    `;

    // "Next Topic" button from API response
    if (data && data.next_topic_url) {
      actions += `
        <a href="${data.next_topic_url}" class="seq-ty-btn seq-ty-btn-primary">
          <i class="bi bi-arrow-right"></i>Next Topic: ${data.next_topic_title || 'Continue'}
        </a>
      `;
    } else if (plData.nextTopicUrl) {
      // Fallback from page context
      actions += `
        <a href="${plData.nextTopicUrl}" class="seq-ty-btn seq-ty-btn-primary">
          <i class="bi bi-arrow-right"></i>Next Topic: ${plData.nextTopicTitle || 'Continue'}
        </a>
      `;
    }

    actions += `
      <a href="/dashboard/" class="seq-ty-btn seq-ty-btn-ghost">
        <i class="bi bi-grid-1x2"></i>Dashboard
      </a>
    `;

    msgEl.style.display = 'block';
    msgEl.innerHTML = `
      <div class="seq-thankyou-card seq-fade-in">
        <div class="seq-thankyou-icon"><i class="bi bi-check-circle-fill"></i></div>
        <h3 class="seq-thankyou-title">Thanks for your feedback! 🎉</h3>
        <p class="seq-thankyou-desc">
          Your <strong>${selectedRating}-star</strong> rating has been saved and your learning profile updated.
        </p>
        <div class="seq-thankyou-actions">${actions}</div>
      </div>
    `;

    // Scroll into view
    msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ── Completion message ────────────────────────────────────────
  function showCompletionMessage() {
    let nextBtn = '';
    if (plData.nextTopicUrl) {
      nextBtn = `
        <a href="${plData.nextTopicUrl}" class="seq-ty-btn seq-ty-btn-primary">
          <i class="bi bi-arrow-right"></i>Next Topic: ${plData.nextTopicTitle || 'Continue'}
        </a>
      `;
    }

    cardWrapper.innerHTML = `
      <div class="seq-completion-card seq-fade-in" id="completion-card">
        <div class="seq-completion-icon"><i class="bi bi-trophy-fill"></i></div>
        <h3 class="seq-completion-title">All Styles Explored! 🎉</h3>
        <p class="seq-completion-desc">
          You've explored all explanation styles for this topic.
          Your learning profile has been updated!
        </p>
        <div class="seq-completion-actions">
          ${nextBtn}
          <a href="${plData.subjectListUrl}" class="seq-ty-btn seq-ty-btn-outline">
            <i class="bi bi-collection"></i>All Topics
          </a>
          <a href="/dashboard/" class="seq-ty-btn seq-ty-btn-ghost">
            <i class="bi bi-grid-1x2"></i>Dashboard
          </a>
        </div>
      </div>
    `;

    if (progressFill) progressFill.style.width = '100%';
    if (progressCurrent) progressCurrent.textContent = totalVersions;
    if (progressPct) progressPct.textContent = '100%';
  }

});
