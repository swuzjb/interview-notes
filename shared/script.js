/* ============================================================
   八股文统一交互脚本 - Unified Interview Guide Scripts
   Enhanced for Mobile Reading Experience
   ============================================================ */

(function () {
  'use strict';

  // === Theme Toggle ===
  function initTheme() {
    var saved = localStorage.getItem('bagu-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'dark'); // default dark
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('bagu-theme', next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
      btn.title = theme === 'dark' ? '切换为浅色模式' : '切换为深色模式';
    }
  }

  // === Font Size Control ===
  function initFontSize() {
    var saved = localStorage.getItem('bagu-font-scale');
    if (saved) {
      document.documentElement.style.setProperty('--font-scale', saved);
    }
  }

  function changeFontSize(delta) {
    var current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
    var next = Math.min(1.3, Math.max(0.85, current + delta));
    document.documentElement.style.setProperty('--font-scale', next);
    localStorage.setItem('bagu-font-scale', next);
  }

  function initFontSizeControls() {
    var control = document.querySelector('.font-size-control');
    if (!control) return;

    var btnSmaller = control.querySelector('[data-action="smaller"]');
    var btnLarger = control.querySelector('[data-action="larger"]');

    if (btnSmaller) {
      btnSmaller.addEventListener('click', function (e) {
        e.preventDefault();
        changeFontSize(-0.05);
      });
    }

    if (btnLarger) {
      btnLarger.addEventListener('click', function (e) {
        e.preventDefault();
        changeFontSize(0.05);
      });
    }
  }

  // === Desktop Sidebar Toggle ===
  function initSidebarToggle() {
    var sidebar = document.querySelector('.sidebar');
    var mainContent = document.querySelector('.main-content');
    if (!sidebar || !mainContent) return;
    if (window.innerWidth <= 768) return;

    // Create toggle button inside sidebar (at bottom)
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.setAttribute('aria-label', '收起侧边栏');
    toggleBtn.innerHTML = '&#9664; 收起菜单';
    sidebar.appendChild(toggleBtn);

    // Create floating re-open button (shown when collapsed)
    var openBtn = document.createElement('button');
    openBtn.className = 'sidebar-toggle-open';
    openBtn.setAttribute('aria-label', '展开侧边栏');
    openBtn.innerHTML = '&#9776;';
    openBtn.title = '展开侧边栏';
    document.body.appendChild(openBtn);

    function collapse() {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
      openBtn.classList.add('visible');
      localStorage.setItem('bagu-sidebar-collapsed', 'true');
    }

    function expand() {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('expanded');
      openBtn.classList.remove('visible');
      localStorage.setItem('bagu-sidebar-collapsed', 'false');
    }

    // Restore state
    if (localStorage.getItem('bagu-sidebar-collapsed') === 'true') {
      collapse();
    }

    toggleBtn.addEventListener('click', collapse);
    openBtn.addEventListener('click', expand);
  }

  // === Mobile Sidebar with Swipe Gesture ===
  function initMobileMenu() {
    var btn = document.querySelector('.mobile-menu-btn');
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');

    if (!btn || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('open');
      btn.innerHTML = '&#10005;';
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      btn.innerHTML = '&#9776;';
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar when clicking a nav link on mobile
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          closeSidebar();
        }
      });
    });

    // Swipe gesture to open/close sidebar
    var touchStartX = 0;
    var touchStartY = 0;
    var touchDeltaX = 0;
    var isSwiping = false;

    document.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = false;
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
      if (window.innerWidth > 768) return;

      var deltaX = e.touches[0].clientX - touchStartX;
      var deltaY = e.touches[0].clientY - touchStartY;
      touchDeltaX = deltaX;

      // Only activate swipe if horizontal movement is dominant
      if (!isSwiping && Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        isSwiping = true;
      }
    }, { passive: true });

    document.addEventListener('touchend', function () {
      if (!isSwiping || window.innerWidth > 768) return;

      // Swipe right from left edge to open
      if (touchStartX < 30 && touchDeltaX > 60 && !sidebar.classList.contains('open')) {
        openSidebar();
      }
      // Swipe left to close
      else if (touchDeltaX < -60 && sidebar.classList.contains('open')) {
        closeSidebar();
      }

      isSwiping = false;
      touchDeltaX = 0;
    }, { passive: true });
  }

  // === Scroll Spy (active nav highlighting) ===
  function initScrollSpy() {
    var navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
    if (navLinks.length === 0) return;

    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) sections.push({ id: id, el: el, link: link });
    });

    function onScroll() {
      var scrollY = window.scrollY + 120;

      var current = null;
      for (var i = sections.length - 1; i >= 0; i--) {
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

        // Scroll active link into sidebar view on mobile
        if (window.innerWidth <= 768 && document.querySelector('.sidebar.open')) {
          current.link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }

    var ticking = false;
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
    var bar = document.querySelector('.reading-progress');
    if (!bar) return;

    function update() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    var ticking = false;
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
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // === Section Collapse (Mobile) ===
  function initSectionCollapse() {
    if (window.innerWidth > 768) return;

    // Find all question-blocks that are long enough to benefit from collapse
    var blocks = document.querySelectorAll('.question-block');
    blocks.forEach(function (block) {
      // Only collapse blocks taller than 500px
      if (block.scrollHeight <= 500) return;

      var wrapper = document.createElement('div');
      wrapper.className = 'section-collapsible';

      // Move block content into wrapper
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);

      var btn = document.createElement('button');
      btn.className = 'section-collapse-btn';
      btn.setAttribute('aria-label', '收起/展开本节');
      wrapper.parentNode.insertBefore(btn, wrapper.nextSibling);

      btn.addEventListener('click', function () {
        wrapper.classList.toggle('collapsed');
        btn.classList.toggle('collapsed');
      });
    });
  }

  // === Scroll Hint for horizontally scrollable elements ===
  function initScrollHints() {
    var scrollables = document.querySelectorAll('.table-wrapper, .table-wrap, .diagram, .svg-container, pre');

    scrollables.forEach(function (el) {
      function checkScroll() {
        if (el.scrollWidth > el.clientWidth + 2) {
          el.classList.add('scroll-hint', 'can-scroll');
        } else {
          el.classList.remove('scroll-hint', 'can-scroll');
        }
      }

      // Check on load and resize
      checkScroll();
      window.addEventListener('resize', checkScroll);

      // Remove hint after user scrolls
      el.addEventListener('scroll', function () {
        el.classList.remove('can-scroll');
      }, { once: true });
    });
  }

  // === Viewport Height Fix (iOS 100vh bug) ===
  function initViewportFix() {
    function setVH() {
      var vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', vh + 'px');
    }
    setVH();
    window.addEventListener('resize', setVH);
  }

  // === Init All ===
  function init() {
    initTheme();
    initFontSize();
    initSidebarToggle();
    initMobileMenu();
    initScrollSpy();
    initProgress();
    initBackToTop();
    initFontSizeControls();
    initViewportFix();

    // Delay non-critical init
    setTimeout(function () {
      initSectionCollapse();
      initScrollHints();
    }, 300);

    // Theme toggle button
    var themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
