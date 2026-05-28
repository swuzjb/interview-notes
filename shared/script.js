/* ============================================================
   八股文统一交互脚本 - Unified Interview Guide Scripts
   ============================================================ */

(function () {
  'use strict';

  // === Theme Toggle ===
  function initTheme() {
    const saved = localStorage.getItem('bagu-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'dark'); // default dark
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('bagu-theme', next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
      btn.title = theme === 'dark' ? '切换为浅色模式' : '切换为深色模式';
    }
  }

  // === Mobile Sidebar ===
  function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (!btn || !sidebar) return;

    btn.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
      btn.innerHTML = sidebar.classList.contains('open') ? '&#10005;' : '&#9776;';
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        btn.innerHTML = '&#9776;';
      });
    }

    // Close sidebar when clicking a nav link on mobile
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          if (overlay) overlay.classList.remove('open');
          btn.innerHTML = '&#9776;';
        }
      });
    });
  }

  // === Scroll Spy (active nav highlighting) ===
  function initScrollSpy() {
    const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
    if (navLinks.length === 0) return;

    const sections = [];
    navLinks.forEach(function (link) {
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) sections.push({ id: id, el: el, link: link });
    });

    function onScroll() {
      const scrollY = window.scrollY + 100;

      let current = null;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].el.offsetTop <= scrollY) {
          current = sections[i];
          break;
        }
      }

      navLinks.forEach(function (l) { l.classList.remove('active'); });
      // Also remove active from group titles
      document.querySelectorAll('.nav-group-title').forEach(function (t) { t.classList.remove('active'); });

      if (current) {
        current.link.classList.add('active');
        // Also highlight parent group title
        var group = current.link.closest('.nav-group');
        if (group) {
          var title = group.querySelector('.nav-group-title');
          if (title) title.classList.add('active');
        }
      }
    }

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    onScroll();
  }

  // === Reading Progress Bar ===
  function initProgress() {
    const bar = document.querySelector('.reading-progress');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          update();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // === Back to Top ===
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // === Init All ===
  function init() {
    initTheme();
    initMobileMenu();
    initScrollSpy();
    initProgress();
    initBackToTop();

    // Theme toggle button
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
