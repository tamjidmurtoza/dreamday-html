/* DreamDay Documentation */
(function () {
  "use strict";

  const nav = document.getElementById("doc-nav");
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));

  /* Mobile menu */
  function setOpen(open) {
    nav.toggleAttribute("data-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", () => setOpen(!nav.hasAttribute("data-open")));
  links.forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  /* Highlight the section in view */
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function setCurrent(id) {
    links.forEach((link) => {
      if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  let ticking = false;
  function spy() {
    ticking = false;
    const line = window.innerHeight * 0.3;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) current = section;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    setCurrent(current.id);
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(spy);
    }
  }, { passive: true });
  spy();

  /* Copy buttons */
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.parentElement.querySelector("code").textContent;
      try {
        await navigator.clipboard.writeText(code);
        button.textContent = "Copied!";
      } catch (err) {
        button.textContent = "Failed";
      }
      setTimeout(() => (button.textContent = "Copy"), 1500);
    });
  });

  /* Filter the menu */
  const search = document.querySelector("[data-nav-search]");
  const empty = document.querySelector("[data-nav-empty]");
  if (search) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let shown = 0;
      links.forEach((link) => {
        const match = link.textContent.toLowerCase().includes(query);
        link.parentElement.hidden = !match;
        if (match) shown++;
      });
      nav.querySelectorAll("ul").forEach((list) => {
        const visible = Array.from(list.children).some((item) => !item.hidden);
        list.hidden = !visible;
        const label = list.previousElementSibling;
        if (label && label.classList.contains("nav-label")) label.hidden = !visible;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* Back to top */
  const toTop = document.querySelector("[data-to-top]");
  if (toTop) {
    const update = () => (toTop.hidden = window.scrollY < 600);
    window.addEventListener("scroll", update, { passive: true });
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0 });
      document.querySelector(".brand").focus();
    });
    update();
  }

  /* Current year */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
