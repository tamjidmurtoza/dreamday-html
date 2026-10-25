(function () {
  "use strict";

  /*
  |===================================================================
  | Template Name: DreamDay
  | Author: Laralink
  | Version: 1.0.0
  |===================================================================
  |===================================================================
  | TABLE OF CONTENTS:
  |===================================================================
  |
  | 00. Helpers
  | 01. Initialization
  | 02. Preloader
  | 03. Theme & Direction Switcher
  | 04. Mobile Menu
  | 05. Sticky Header
  | 06. Dynamic Background
  | 07. Swiper Slider
  | 08. Gallery Slider
  | 09. Video Modal
  | 10. Accordion
  | 11. Counter Animation
  | 12. Light Gallery
  | 13. Smooth Page Scroll
  | 14. Contact Form
  | 15. Newsletter Form
  | 16. Scroll Up
  | 17. Current Year
  | 18. AOS Animation
  |
  */

  /*================================================================
    00. Helpers
  ==================================================================*/
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /*================================================================
    01. Initialization
  ==================================================================*/
  function init() {
    preloader();
    themeSwitcher();
    mainNav();
    stickyHeader();
    dynamicBackground();
    swiperInit();
    gallerySlider();
    modalVideo();
    accordion();
    counterInit();
    lightGallery();
    smoothScroll();
    contactForm();
    newsletterForm();
    scrollUp();
    currentYear();
    aosInit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /*================================================================
    02. Preloader
    Hides when the page has loaded, or after 3s at most
  ==================================================================*/
  function preloader() {
    let done = false;

    const fadeOut = (el, duration, delay = 0) => {
      if (!el) return;
      const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration,
        delay,
        easing: "ease",
        fill: "forwards",
      });
      anim.onfinish = () => {
        el.style.display = "none";
      };
    };

    const hide = () => {
      if (done) return;
      done = true;
      fadeOut(qs(".cs_preloader_in"), 400);
      fadeOut(qs(".cs_preloader"), 600, 150);
    };

    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide);
    setTimeout(hide, 3000);
  }

  /*================================================================
    03. Theme & Direction Switcher
    Light / dark / device theme and LTR / RTL toggle.
    The saved choice is applied early by assets/js/theme-init.js
  ==================================================================*/
  function themeSwitcher() {
    const THEME_KEY = "dreamday-theme";
    const DIR_KEY = "dreamday-dir";
    const THEMES = {
      system: { icon: "fa-solid fa-display", label: "Device theme" },
      light: { icon: "fa-solid fa-sun", label: "Light theme" },
      dark: { icon: "fa-solid fa-moon", label: "Dark theme" },
    };
    const root = document.documentElement;
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const store = {
      get(key) {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          return null;
        }
      },
      set(key, value) {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (e) {
          return false;
        }
      },
    };

    const currentTheme = () => {
      const value =
        new URLSearchParams(location.search).get("theme") || store.get(THEME_KEY);
      return value in THEMES ? value : "system";
    };

    const applyTheme = (value) => {
      const dark = value === "dark" || (value === "system" && darkQuery.matches);
      if (dark) root.setAttribute("data-theme", "dark");
      else root.removeAttribute("data-theme");
    };

    const panel = document.createElement("div");
    panel.className = "cs_theme_switcher";
    panel.innerHTML = `
      <button type="button" data-theme-toggle></button>
      <button type="button" data-dir-toggle aria-label="Switch text direction"></button>`;
    document.body.append(panel);

    const themeBtn = qs("[data-theme-toggle]", panel);
    const order = Object.keys(THEMES);
    let theme = currentTheme();

    const renderTheme = () => {
      const { icon, label } = THEMES[theme];
      applyTheme(theme);
      themeBtn.innerHTML = `<i class="${icon}" aria-hidden="true"></i>`;
      themeBtn.title = label;
      themeBtn.setAttribute("aria-label", `${label} (click to change)`);
    };

    renderTheme();
    themeBtn.addEventListener("click", () => {
      theme = order[(order.indexOf(theme) + 1) % order.length];
      store.set(THEME_KEY, theme);
      renderTheme();
    });
    darkQuery.addEventListener("change", () => theme === "system" && applyTheme(theme));

    const dirBtn = qs("[data-dir-toggle]", panel);
    const renderDir = () => {
      const rtl = root.dir === "rtl";
      dirBtn.textContent = rtl ? "LTR" : "RTL";
      dirBtn.title = rtl ? "Switch to left-to-right" : "Switch to right-to-left";
    };

    renderDir();
    dirBtn.addEventListener("click", () => {
      const next = root.dir === "rtl" ? "ltr" : "rtl";
      if (!store.set(DIR_KEY, next)) {
        root.dir = next;
        renderDir();
        return;
      }
      const url = new URL(location.href);
      url.searchParams.delete("dir");
      location.replace(url);
    });
  }

  /*================================================================
    04. Mobile Menu
  ==================================================================*/
  const MOBILE_MENU_BREAKPOINT = 1200;
  let menuToggle = null;
  let menuWrap = null;

  const isMenuOpen = () => !!menuWrap && menuWrap.classList.contains("active");

  function setMenu(open) {
    if (!menuToggle || !menuWrap) return;
    const header = qs(".cs_site_header_style_1");

    menuToggle.classList.toggle("active", open);
    menuWrap.classList.toggle("active", open);
    if (header) header.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    qsa("main, footer, .cs_scrolltop_btn, .cs_skip_link, .cs_theme_switcher").forEach((el) => {
      el.inert = open;
    });

    if (open) {
      requestAnimationFrame(() =>
        setTimeout(() => {
          const firstLink = qs("a", menuWrap);
          if (firstLink && isMenuOpen()) firstLink.focus();
        }, 50),
      );
    }
    updateStickyHeader();
  }

  function mainNav() {
    const nav = qs(".cs_nav");
    menuWrap = nav ? qs(".cs_nav_list_wrap", nav) : null;
    if (!nav || !menuWrap) return;

    menuWrap.id = menuWrap.id || "cs_main_menu";
    nav.insertAdjacentHTML(
      "beforeend",
      `<button type="button" class="cs_menu_toggle" aria-label="Open menu" aria-expanded="false" aria-controls="${menuWrap.id}"><span></span></button>`,
    );
    menuToggle = qs(".cs_menu_toggle", nav);

    menuToggle.addEventListener("click", () => setMenu(!isMenuOpen()));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= MOBILE_MENU_BREAKPOINT && isMenuOpen()) setMenu(false);
    });
  }

  /*================================================================
    05. Sticky Header
  ==================================================================*/
  let stickyHeaders = [];

  function updateStickyHeader() {
    const active = window.scrollY >= 10 || isMenuOpen();
    stickyHeaders.forEach((el) => el.classList.toggle("cs_sticky_active", active));
  }

  function stickyHeader() {
    stickyHeaders = qsa(".cs_sticky_header");
    if (!stickyHeaders.length) return;
    updateStickyHeader();
    window.addEventListener("scroll", updateStickyHeader, { passive: true });
  }

  /*================================================================
    06. Dynamic Background
  ==================================================================*/
  function dynamicBackground() {
    qsa("[data-src]").forEach((el) => {
      el.style.backgroundImage = `url(${el.getAttribute("data-src")})`;
    });
  }

  /*================================================================
    07. Swiper Slider
    Options come from data attributes on .cs_slider_container
  ==================================================================*/
  function swiperInit() {
    if (typeof Swiper === "undefined") return;

    qsa(".cs_slider").forEach((slider) => {
      const container = qs(".cs_slider_container", slider);
      if (!container || !qs(".swiper-wrapper", slider)) return;

      const data = (name) => container.getAttribute(`data-${name}`);
      const int = (name, fallback) => parseInt(data(name), 10) || fallback;

      let autoplay = int("autoplay", 0);
      let autoplayDelay = 6000;
      if (autoplay > 1) {
        autoplayDelay = autoplay;
        autoplay = 1;
      }

      let slidesPerView = int("slides-per-view", 3);
      let breakpoints = {};
      if (data("slides-per-view") === "responsive") {
        breakpoints = {
          1024: { slidesPerView: int("lg-slides", 3) },
          768: { slidesPerView: int("md-slides", 2) },
          640: { slidesPerView: int("sm-slides", 1) },
          0: { slidesPerView: int("xs-slides", 1) },
        };
        slidesPerView = int("add-slides", 3);
      }

      const paginationEl = qs(".swiper-pagination", slider);

      new Swiper(container, {
        loop: Boolean(int("loop", 0)),
        speed: int("speed", 600),
        slidesPerView,
        slidesPerGroup: 1,
        spaceBetween: 24,
        centeredSlides: Boolean(int("center", 0)),
        effect: int("fade-slide", 0) === 1 ? "fade" : "slide",
        autoplay: autoplay
          ? { delay: autoplayDelay, disableOnInteraction: false }
          : false,
        navigation: {
          nextEl: qs(".cs_right_arrow", slider),
          prevEl: qs(".cs_left_arrow", slider),
        },
        pagination: paginationEl ? { el: paginationEl, clickable: true } : {},
        breakpoints,
      });
    });
  }

  /*================================================================
    08. Gallery Slider
    Main image slider linked to its thumbnail nav
  ==================================================================*/
  function gallerySlider() {
    if (typeof Swiper === "undefined" || !qs(".cs_single_property_slider")) return;

    const thumbs = new Swiper(".cs_single_property_nav", {
      spaceBetween: 40,
      slidesPerView: 3,
      freeMode: true,
      watchSlidesProgress: true,
      breakpoints: {
        320: { slidesPerView: 2, spaceBetween: 16 },
        768: { slidesPerView: 3, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 40 },
      },
    });

    new Swiper(".cs_single_property_slider", {
      spaceBetween: 0,
      slidesPerView: 1,
      effect: "fade",
      fadeEffect: { crossFade: true },
      thumbs: { swiper: thumbs },
      loop: false,
      autoplay: false,
    });
  }

  /*================================================================
    09. Video Modal
  ==================================================================*/
  function modalVideo() {
    if (!qs(".cs_video_open")) return;

    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="cs_video_popup">
          <div class="cs_video_popup-overlay"></div>
          <div class="cs_video_popup-content">
            <div class="cs_video_popup-layer"></div>
            <div class="cs_video_popup_container" role="dialog" aria-modal="true" aria-label="Video player">
              <div class="cs_video_popup-align">
                <div class="embed-responsive embed-responsive-16by9">
                  <iframe class="embed-responsive-item" src="about:blank" title="Video player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
                </div>
              </div>
              <button type="button" class="cs_video_popup_close" aria-label="Close video"></button>
            </div>
          </div>
        </div>
      `,
    );

    const popup = qs(".cs_video_popup");
    const iframe = qs(".cs_video_popup_container iframe", popup);
    const closeBtn = qs(".cs_video_popup_close", popup);
    let lastTrigger = null;

    const close = () => {
      if (!popup.classList.contains("active")) return;
      popup.classList.remove("active");
      iframe.setAttribute("src", "about:blank");
      if (lastTrigger) lastTrigger.focus();
    };

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(".cs_video_open");
      if (!trigger) return;
      e.preventDefault();
      lastTrigger = trigger;
      iframe.setAttribute("src", trigger.getAttribute("href"));
      popup.classList.add("active");
      setTimeout(() => closeBtn.focus(), 350);
    });

    qsa(".cs_video_popup_close, .cs_video_popup-layer", popup).forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        close();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /*================================================================
    10. Accordion
  ==================================================================*/
  function accordion() {
    const items = qsa(".cs_accordion");
    if (!items.length) return;

    const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
    const duration = () => (reducedMotion() ? 0 : 400);

    const frames = (el) => {
      const cs = getComputedStyle(el);
      return {
        open: {
          height: `${el.getBoundingClientRect().height}px`,
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          marginTop: cs.marginTop,
          marginBottom: cs.marginBottom,
        },
        closed: {
          height: "0px",
          paddingTop: "0px",
          paddingBottom: "0px",
          marginTop: "0px",
          marginBottom: "0px",
        },
      };
    };

    const slideDown = (el) => {
      if (!el || el.dataset.open === "1") return;
      el.dataset.open = "1";
      el.getAnimations().forEach((a) => a.cancel());
      el.style.display = "";
      const { open, closed } = frames(el);
      el.style.overflow = "hidden";
      el.animate([closed, open], { duration: duration(), easing: EASING }).onfinish = () => {
        el.style.overflow = "";
      };
    };

    const slideUp = (el) => {
      if (!el || el.dataset.open !== "1") return;
      el.dataset.open = "0";
      el.getAnimations().forEach((a) => a.cancel());
      const { open, closed } = frames(el);
      el.style.overflow = "hidden";
      el.animate([open, closed], { duration: duration(), easing: EASING }).onfinish = () => {
        el.style.display = "none";
        el.style.overflow = "";
      };
    };

    const setItem = (item, open) => {
      const head = qs(":scope > .cs_accordion_head", item);
      item.classList.toggle("active", open);
      if (head) head.setAttribute("aria-expanded", String(open));
      return qs(":scope > .cs_accordion_body", item);
    };

    items.forEach((item) => {
      const isActive = item.classList.contains("active");
      const body = setItem(item, isActive);
      if (!body) return;
      body.style.display = isActive ? "" : "none";
      body.dataset.open = isActive ? "1" : "0";
    });

    qsa(".cs_accordion_head").forEach((head) => {
      head.addEventListener("click", () => {
        const item = head.closest(".cs_accordion");
        if (!item || item.classList.contains("active")) return;
        slideDown(setItem(item, true));

        [...item.parentElement.children]
          .filter((sibling) => sibling !== item && sibling.classList.contains("cs_accordion"))
          .forEach((sibling) => slideUp(setItem(sibling, false)));
      });
    });
  }

  /*================================================================
    11. Counter Animation
    Rolling digit effect, each digit spins one turn before landing.
    Markup: <span class="cs_counter" data-count-to="250" data-suffix="+">250+</span>
    Optional: data-duration="3500" (ms)
  ==================================================================*/
  function counterInit() {
    const counters = qsa(".cs_counter[data-count-to]");
    if (!counters.length) return;

    const DIGIT_HEIGHT = 1.1;
    const WHEEL_DELAYS = [120, 320];
    const WIDTH_BLEND = 0.25;

    const ease = (function (x1, y1, x2, y2) {
      const bezier = (p1, p2, t) =>
        3 * p1 * t * (1 - t) ** 2 + 3 * p2 * t * t * (1 - t) + t ** 3;
      return (x) => {
        let lo = 0;
        let hi = 1;
        for (let i = 0; i < 20; i++) {
          const mid = (lo + hi) / 2;
          if (bezier(x1, x2, mid) < x) lo = mid;
          else hi = mid;
        }
        return bezier(y1, y2, (lo + hi) / 2);
      };
    })(0.25, 0.1, 0.25, 1);

    const smoothstep = (x) => {
      const t = Math.min(Math.max(x, 0), 1);
      return t * t * (3 - 2 * t);
    };

    const countDecimals = (value) => {
      const match = /^-?\d+(?:\.(\d+))?(?:e([+-]\d+))?$/i.exec(String(value));
      if (!match) return 0;
      const [, fraction = "", exponent = 0] = match;
      return Math.min(20, Math.max(0, fraction.length - Number(exponent)));
    };

    const formatNumber = (intPart, fracPart, negative) =>
      (negative ? "-" : "") +
      intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (fracPart ? `.${fracPart}` : "");

    const measureDigitWidths = (el, wheels) => {
      const fontSize = parseFloat(getComputedStyle(el).fontSize) || 1;
      return Array.from(
        wheels[0].strip.children,
        (digit) => digit.getBoundingClientRect().width / fontSize,
      );
    };

    const setWheel = (wheel, position, width) => {
      const digit = ((position % 10) + 10) % 10;
      const index = wheel.down ? 10 - digit : digit;
      wheel.strip.style.marginTop = `${-index * DIGIT_HEIGHT}em`;
      if (width != null) wheel.el.style.width = `${width}em`;
    };

    const wheelWidth = (wheel, widths, progress) => {
      const widest = Math.max(...widths);
      const start = widths[0];
      const end = widths[wheel.finalDigit];
      if (progress < WIDTH_BLEND) {
        return start + (widest - start) * smoothstep(progress / WIDTH_BLEND);
      }
      const t = (progress - (1 - WIDTH_BLEND)) / WIDTH_BLEND;
      return widest + (end - widest) * smoothstep(t);
    };

    const buildCounter = (el, places, digits, negative, suffix, label) => {
      if (!places.length || digits.some(Number.isNaN)) return null;

      const labelEl = document.createElement("span");
      labelEl.className = "cs_counter_label";
      labelEl.textContent = label;

      const reel = document.createElement("span");
      reel.className = "cs_counter_reel";
      reel.setAttribute("aria-hidden", "true");
      if (negative) reel.append("-");

      const digitsEl = document.createElement("span");
      digitsEl.className = "cs_counter_digits";

      const wheels = places.map((place, i) => {
        const wheelEl = document.createElement("span");
        wheelEl.className = "cs_counter_wheel";
        const strip = document.createElement("span");
        strip.className = "cs_counter_strip";
        const down = i % 2 === 1;
        strip.append(
          ...(down ? "09876543210" : "01234567890").split("").map((d) => {
            const span = document.createElement("span");
            span.textContent = d;
            return span;
          }),
        );
        wheelEl.append(strip);
        digitsEl.append(wheelEl);

        if (places[i + 1] !== undefined) {
          if (place === 0) digitsEl.append(".");
          else if (place % 3 === 0) digitsEl.append(",");
        }

        const wheel = {
          place,
          finalDigit: digits[i],
          down,
          delay: WHEEL_DELAYS[i % 2],
          el: wheelEl,
          strip,
        };
        setWheel(wheel, 0);
        return wheel;
      });

      reel.append(digitsEl);
      if (suffix) reel.append(suffix);
      el.replaceChildren(labelEl, reel);
      return wheels;
    };

    const animateCounter = (el, value, duration, suffix) => {
      const number = Number(value);
      if (!Number.isFinite(number)) return;

      const ms = Number(duration) > 0 ? Number(duration) : 3500;
      const suffixText = suffix == null ? "" : String(suffix);
      const [intPart, fracPart = ""] = Math.abs(number)
        .toFixed(countDecimals(number))
        .split(".");
      const digits = (intPart + fracPart).split("").map(Number);
      const places = [];
      for (let p = intPart.length - 1; p >= -fracPart.length; p--) places.push(p);

      const label = formatNumber(intPart, fracPart, number < 0) + suffixText;
      const wheels = buildCounter(el, places, digits, number < 0, suffixText, label);
      if (!wheels) {
        el.textContent = label;
        return;
      }

      let widths = measureDigitWidths(el, wheels);
      let finished = false;
      const finish = () => {
        finished = true;
        widths = measureDigitWidths(el, wheels);
        wheels.forEach((w) => setWheel(w, w.finalDigit, widths[w.finalDigit]));
      };

      if (document.fonts) {
        document.fonts.ready.then(() => {
          if (!wheels[0].el.isConnected) return;
          if (finished) finish();
          else widths = measureDigitWidths(el, wheels);
        });
      }

      if (reducedMotion()) {
        finish();
        return;
      }

      const maxDelay = Math.max(...wheels.map((w) => w.delay));
      const start = performance.now();
      const tick = (now) => {
        const elapsed = now - start;
        if (elapsed >= ms + maxDelay) {
          finish();
          return;
        }
        wheels.forEach((w) => {
          const progress = Math.min(Math.max((elapsed - w.delay) / ms, 0), 1);
          setWheel(w, (10 + w.finalDigit) * ease(progress), wheelWidth(w, widths, progress));
        });
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const run = (el) =>
      animateCounter(
        el,
        (el.dataset.countTo || "").replace(/,/g, ""),
        el.dataset.duration,
        el.dataset.suffix,
      );

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          run(target);
          observer.unobserve(target);
        });
      },
      { threshold: 0.3 },
    );

    counters.forEach((el) => {
      animateCounter(el, 0, 1);
      observer.observe(el);
    });
  }

  /*================================================================
    12. Light Gallery (GLightbox)
  ==================================================================*/
  function lightGallery() {
    if (typeof GLightbox === "undefined") return;
    const galleries = qsa(".cs_lightgallery");
    if (!galleries.length) return;

    galleries.forEach((gallery, index) => {
      qsa(".cs_gallery_item", gallery).forEach((item) => {
        item.setAttribute("data-gallery", `cs_gallery_${index + 1}`);
        item.setAttribute("data-type", "image");
      });
    });

    GLightbox({
      selector: ".cs_lightgallery .cs_gallery_item",
      loop: true,
      touchNavigation: true,
    });
  }

  /*================================================================
    13. Smooth Page Scroll (Lenis)
  ==================================================================*/
  function smoothScroll() {
    if (typeof Lenis === "undefined" || reducedMotion() || window.lenisInstance) return;

    const lenis = new Lenis({
      duration: 1.2,
      smooth: true,
      smoothTouch: false,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    window.lenisInstance = lenis;

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      return;
    }

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  /*================================================================
    14. Contact Form (Web3Forms)
  ==================================================================*/
  function contactForm() {
    const form = document.getElementById("cs_form");
    const result = document.getElementById("cs_result");
    if (!form || !result) return;

    let hideTimer = null;
    const showResult = (message) => {
      clearTimeout(hideTimer);
      result.style.display = "";
      result.textContent = message;
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const key = String(formData.get("access_key") || "");
      if (!key || key === "YOUR_ACCESS_KEY_HERE") {
        showResult("Form is not configured yet. Add your Web3Forms access key in contact.html.");
        return;
      }

      const submitBtn = qs('[type="submit"]', form);
      if (submitBtn) submitBtn.disabled = true;
      showResult("Please wait...");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          showResult(data.message || (response.ok ? "Message sent!" : "Something went wrong!"));
          if (response.ok) form.reset();
        })
        .catch(() => showResult("Something went wrong! Please try again."))
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
          hideTimer = setTimeout(() => {
            result.style.display = "none";
          }, 5000);
        });
    });
  }

  /*================================================================
    15. Newsletter Form
    Demo confirmation until a provider is connected (action="#")
  ==================================================================*/
  function newsletterForm() {
    qsa(".cs_newsletter_form").forEach((form) => {
      if (form.getAttribute("action") !== "#") return;

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = qs('input[type="email"]', form);
        if (!input) return;

        const message = "Thank you for subscribing!";
        input.value = "";
        input.placeholder = message;

        let status = qs(".cs_newsletter_status", form);
        if (!status) {
          status = document.createElement("span");
          status.className = "cs_newsletter_status visually-hidden";
          status.setAttribute("role", "status");
          form.append(status);
        }
        status.textContent = message;
      });
    });
  }

  /*================================================================
    16. Scroll Up
  ==================================================================*/
  function scrollUp() {
    const buttons = qsa(".cs_scrolltop_btn");
    if (!buttons.length) return;

    const toggle = () => {
      const visible = window.scrollY >= 350;
      buttons.forEach((btn) => btn.classList.toggle("active", visible));
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.lenisInstance) window.lenisInstance.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
      });
    });

    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  /*================================================================
    17. Current Year
  ==================================================================*/
  function currentYear() {
    const year = new Date().getFullYear();
    qsa(".cs_getting_year").forEach((el) => {
      el.textContent = year;
    });
  }

  /*================================================================
    18. AOS Animation
  ==================================================================*/
  function aosInit() {
    if (typeof AOS === "undefined") return;
    AOS.init({
      disable: reducedMotion(),
      offset: 100,
      duration: 800,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
})();
