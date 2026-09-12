/* ==========================================================================
   Angles — 全站共享脚本（主题 / 多语言 / 移动菜单 / 动态数据）
   ========================================================================== */

(function () {
  'use strict';

  // ── 主题 ──
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');
  var savedTheme = localStorage.getItem('angles-theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('angles-theme', t);
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // ── 移动菜单 ──
  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.textContent = open ? '✕' : '☰';
      menuBtn.setAttribute('aria-expanded', open);
    });
  }

  // ── 年份 ──
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── 语言 ──
  var langBtn = document.getElementById('lang-btn');
  var I18N = window.ANGLES_I18N || { zh: {}, en: {} };
  var lang = localStorage.getItem('angles-lang') ||
             ((navigator.language || 'en').indexOf('zh') === 0 ? 'zh' : 'en');

  function applyLang(l) {
    var dict = I18N[l] || {};
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (dict[key]) nodes[i].textContent = dict[key];
    }
    // 带 HTML 的文案
    var htmlNodes = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlNodes.length; j++) {
      var hkey = htmlNodes[j].getAttribute('data-i18n-html');
      if (dict[hkey]) htmlNodes[j].innerHTML = dict[hkey];
    }
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
    if (langBtn) langBtn.textContent = l === 'zh' ? '中文' : 'EN';
    localStorage.setItem('angles-lang', l);
  }
  applyLang(lang);
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      lang = lang === 'zh' ? 'en' : 'zh';
      applyLang(lang);
    });
  }

  // ── 仓库 star 数 ──
  var starNodes = document.querySelectorAll('[data-repo]');
  if (starNodes.length) {
    var seen = {};
    for (var k = 0; k < starNodes.length; k++) {
      var repo = starNodes[k].getAttribute('data-repo');
      if (seen[repo]) continue;
      seen[repo] = true;
      (function (name) {
        fetch('https://api.github.com/repos/angleschina/' + name)
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (j.stargazers_count == null) return;
            var els = document.querySelectorAll('[data-repo="' + name + '"]');
            for (var m = 0; m < els.length; m++) els[m].textContent = j.stargazers_count;
          })
          .catch(function () {});
      })(repo);
    }
  }

  // ── 最新版本（写入所有 [data-version]）──
  var verNodes = document.querySelectorAll('[data-version]');
  if (verNodes.length) {
    fetch('https://api.github.com/repos/angleschina/angles-cli/releases/latest')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.tag_name) return;
        for (var i = 0; i < verNodes.length; i++) verNodes[i].textContent = j.tag_name;
        // 下载链接替换为最新 tag
        var links = document.querySelectorAll('[data-latest-tag]');
        for (var n = 0; n < links.length; n++) {
          var base = links[n].getAttribute('data-latest-tag');
          links[n].setAttribute('href', base.replace('{tag}', j.tag_name));
        }
        var dateEls = document.querySelectorAll('[data-release-date]');
        if (j.published_at) {
          var d = new Date(j.published_at);
          var s = d.getFullYear() + '-' +
                  String(d.getMonth() + 1).padStart(2, '0') + '-' +
                  String(d.getDate()).padStart(2, '0');
          for (var q = 0; q < dateEls.length; q++) dateEls[q].textContent = s;
        }
      })
      .catch(function () {});
  }
})();
