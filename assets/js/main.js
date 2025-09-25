(function ($) {
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
  | 01. Preloader
  | 02. Mobile Menu
  | 03. Sticky Header
  | 04. Dynamic Background
  | 05. Swipper Slider
  | 06. Video Modal
  | 07. Accordian
  | 08. Counter Animation
  | 09. Light Gallery
  | 10. Smooth Page Scroll
  | 11. Dynamic contact form
  | 12. Scroll Up
  | 13. AOS Animation
  |
  */

  /*================================================================
    Scripts initialization
  ==================================================================*/
  if (!$.exists) {
    $.exists = (selector) => $(selector).length > 0;
  }
  $(window).on("load", function () {
    preloader();
  });
  $(window).on("scroll", function () {
    stickyHeader();
    showScrollUp();
  });

  $(function () {
    stickyHeader();
    mainNav();
    dynamicBackground();
    swiperInit();
    modalVideo();
    accordian();
    counterInit();
    lightGallery();
    smoothScroll();
    scrollUp();
    aosInit();
    if ($.exists(".cs_getting_year")) {
      const date = new Date();
      $(".cs_getting_year").text(date.getFullYear());
    }
  });
  // Run on window resize
  $(window).on("resize", function () {
    const mobileWidth = 1199;
    if ($(window).width() >= mobileWidth) {
      $(
        ".cs_site_header_style_1,.cs_menu_toggle,.cs_nav_list_wrap"
      ).removeClass("active");
    }
  });
  /*===========================================================
    01. Preloader
  =============================================================*/
  function preloader() {
    $(".cs_preloader_in").fadeOut();
    $(".cs_preloader").delay(150).fadeOut("slow");
  }
  /*===========================================================
    02. Mobile Menu
  =============================================================*/
  function mainNav() {
    $(".cs_nav").append('<span class="cs_menu_toggle"><span></span></span>');
    $(".menu-item-has-children").append(
      '<span class="cs_menu_dropdown_toggle"><span></span></span>'
    );
    $(".cs_menu_toggle").on("click", function () {
      $(this)
        .toggleClass("active")
        .siblings(".cs_nav_list_wrap")
        .toggleClass("active");
      $(".cs_site_header_style_1").toggleClass("active");
    });
  }
  /*===========================================================
    03. Sticky Header
  =============================================================*/
  function stickyHeader() {
    var scroll = $(window).scrollTop();
    var isMenuActive = $(".cs_nav_list_wrap").hasClass("active");
    if (scroll >= 10 || isMenuActive) {
      $(".cs_sticky_header").addClass("cs_sticky_active");
    } else {
      $(".cs_sticky_header").removeClass("cs_sticky_active");
    }
  }
  /*===========================================================
    04. Dynamic Background
  =============================================================*/
  function dynamicBackground() {
    $("[data-src]").each(function () {
      var src = $(this).attr("data-src");
      $(this).css({
        "background-image": "url(" + src + ")",
      });
    });
  }
  /*===========================================================
    05. Swipper Slider
  =============================================================*/
  function swiperInit() {
    if (typeof Swiper === "undefined") {
      console.warn("Swiper library not loaded");
      return;
    }
    const sliders = document.querySelectorAll(".cs_slider");

    sliders.forEach((slider) => {
      const container = slider.querySelector(".cs_slider_container");
      const swiperWrapper = slider.querySelector(".swiper-wrapper");
      const status = slider.querySelector(".cs_slider_number");
      if (!container || !swiperWrapper) {
        return;
      }
      // Read data attributes
      let autoPlayVar =
        parseInt(container.getAttribute("data-autoplay"), 10) || 0;
      let autoplaySpdVar = 6000; // default like your example
      if (autoPlayVar > 1) {
        autoplaySpdVar = autoPlayVar;
        autoPlayVar = 1;
      }

      const speedVar =
        parseInt(container.getAttribute("data-speed"), 10) || 600;
      const loopVar = Boolean(
        parseInt(container.getAttribute("data-loop"), 10)
      );
      const centerVar = Boolean(
        parseInt(container.getAttribute("data-center"), 10)
      );
      const fadeVar = parseInt(container.getAttribute("data-fade-slide")) === 1;

      let slidesPerView =
        parseInt(container.getAttribute("data-slides-per-view"), 10) || 3;

      // Responsive breakpoints
      let breakpoints = {};
      if (container.getAttribute("data-slides-per-view") === "responsive") {
        const lg = parseInt(container.getAttribute("data-lg-slides"), 10) || 3;
        const md = parseInt(container.getAttribute("data-md-slides"), 10) || 2;
        const sm = parseInt(container.getAttribute("data-sm-slides"), 10) || 1;
        const xs = parseInt(container.getAttribute("data-xs-slides"), 10) || 1;
        breakpoints = {
          1024: { slidesPerView: lg },
          768: { slidesPerView: md },
          640: { slidesPerView: sm },
          0: { slidesPerView: xs },
        };
        slidesPerView =
          parseInt(container.getAttribute("data-add-slides"), 10) || 3;
      }

      // Navigation & pagination
      const nextEl = slider.querySelector(".cs_right_arrow");
      const prevEl = slider.querySelector(".cs_left_arrow");
      const paginationEl = slider.querySelector(".swiper-pagination");
      const hasPagination = paginationEl !== null;

      // Initialize Swiper
      const swiper = new Swiper(container, {
        loop: loopVar,
        speed: speedVar,
        slidesPerView: slidesPerView,
        slidesPerGroup: 1,
        spaceBetween: 24,
        centeredSlides: centerVar,
        effect: fadeVar ? "fade" : "slide",
        autoplay: autoPlayVar
          ? { delay: autoplaySpdVar, disableOnInteraction: false }
          : false,
        navigation: {
          nextEl: nextEl,
          prevEl: prevEl,
        },
        pagination: hasPagination ? { el: paginationEl, clickable: true } : {},
        breakpoints: breakpoints,
        on: {
          init: function () {
            if (status) {
              const current = this.realIndex + 1;
              const total =
                this.slides.length - (loopVar ? this.loopedSlides * 2 : 0);
              status.innerHTML = `
              <span class="cs_current_number" data-number="${current}"><span>${current}</span></span>
              <span class="cs_slider_number_seperator"></span>
              <span class="cs_total_numbers" data-number="${total}"><span>${total}</span></span>
            `;
            }
          },
          slideChange: function () {
            if (status) {
              const current = this.realIndex + 1;
              const total =
                this.slides.length - (loopVar ? this.loopedSlides * 2 : 0);
              status.innerHTML = `
              <span class="cs_current_number" data-number="${current}"><span>${current}</span></span>
              <span class="cs_slider_number_seperator"></span>
              <span class="cs_total_numbers" data-number="${total}"><span>${total}</span></span>
            `;
            }
          },
        },
      });
    });
    // Product Single Slider
    if ($(".cs_single_property_slider").length > 0) {
      // Initialize Thumbnail slider first
      const propertyNav = new Swiper(".cs_single_property_nav", {
        spaceBetween: 40,
        slidesPerView: 3,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
          320: {
            slidesPerView: 2,
            spaceBetween: 10,
          },

          768: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
        },
      });

      // Initialize Main slider with connection to thumbnails
      new Swiper(".cs_single_property_slider", {
        spaceBetween: 0,
        slidesPerView: 1,
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
        thumbs: {
          swiper: propertyNav,
        },
        loop: false,
        autoplay: false,
      });
    }
  }
  /*===========================================================
    06. Video Modal
  =============================================================*/
  function modalVideo() {
    if ($.exists(".cs_video_open")) {
      $("body").append(`
        <div class="cs_video_popup">
          <div class="cs_video_popup-overlay"></div>
          <div class="cs_video_popup-content">
            <div class="cs_video_popup-layer"></div>
            <div class="cs_video_popup_container">
              <div class="cs_video_popup-align">
                <div class="embed-responsive embed-responsive-16by9">
                  <iframe class="embed-responsive-item" src="about:blank"></iframe>
                </div>
              </div>
              <div class="cs_video_popup_close"></div>
            </div>
          </div>
        </div>
      `);
      $(document).on("click", ".cs_video_open", function (e) {
        e.preventDefault();
        var video = $(this).attr("href");

        $(".cs_video_popup_container iframe").attr("src", `${video}`);

        $(".cs_video_popup").addClass("active");
      });
      $(".cs_video_popup_close, .cs_video_popup-layer").on(
        "click",
        function (e) {
          $(".cs_video_popup").removeClass("active");
          $("html").removeClass("overflow-hidden");
          $(".cs_video_popup_container iframe").attr("src", "about:blank");
          e.preventDefault();
        }
      );
    }
  }
  /*===========================================================
    07. Accordian
  =============================================================*/
  function accordian() {
    $(".cs_accordian").children(".cs_accordian_body").hide();
    $(".cs_accordian.active").children(".cs_accordian_body").show();
    $(".cs_accordian_head").on("click", function () {
      $(this)
        .siblings(".cs_accordian_body")
        .slideDown(300)
        .parent(".cs_accordian")
        .siblings()
        .children(".cs_accordian_body")
        .slideUp(300);
      /* Accordian Active Class */
      $(this).parents(".cs_accordian").addClass("active");
      $(this).parent(".cs_accordian").siblings().removeClass("active");
    });
  }
  /*===========================================================
    08. Counter Animation
  =============================================================*/
  function counterInit() {
    if ($(".odometer").length > 0) {
      let triggered = [];

      $(window).on("scroll.counterInit", function () {
        let scrollPos = $(window).scrollTop(),
          winHeight = $(window).height(),
          scrollPosition = Math.round(scrollPos + winHeight / 1.2);

        $(".odometer").each(function (index) {
          let $this = $(this);
          let elemOffset = $this.offset().top;

          // Run only once per element
          if (elemOffset < scrollPosition && !triggered[index]) {
            $this.html($this.data("count-to"));
            triggered[index] = true;
          }
        });
      });
    }
  }
  /*===========================================================
    09. Light Gallery
  =============================================================*/
  function lightGallery() {
    $(".cs_lightgallery").each(function () {
      $(this).lightGallery({
        selector: ".cs_gallery_item",
        subHtmlSelectorRelative: false,
        thumbnail: false,
        mousewheel: true,
      });
    });
  }
  /*===========================================================
    10. Smooth Page Scroll
  =============================================================*/
  function smoothScroll() {
    if (typeof Lenis !== "undefined") {
      const lenis = new Lenis({
        duration: 1.2,
        smooth: true,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    }
  }
  /*==============================================================
    11. Dynamic contact form
  ================================================================*/
  if ($.exists("#cs_form")) {
    const form = document.getElementById("cs_form");
    const result = document.getElementById("cs_result");

    form.addEventListener("submit", function (e) {
      const formData = new FormData(form);
      e.preventDefault();
      var object = {};
      formData.forEach((value, key) => {
        object[key] = value;
      });
      var json = JSON.stringify(object);
      result.innerHTML = "Please wait...";

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      })
        .then(async (response) => {
          let json = await response.json();
          if (response.status == 200) {
            result.innerHTML = json.message;
          } else {
            console.log(response);
            result.innerHTML = json.message;
          }
        })
        .catch((error) => {
          console.log(error);
          result.innerHTML = "Something went wrong!";
        })
        .then(function () {
          form.reset();
          setTimeout(() => {
            result.style.display = "none";
          }, 5000);
        });
    });
  }
  /*=============================================================
    12. Scroll Up
  ===============================================================*/
  function scrollUp() {
    $(".cs_scrolltop_btn").on("click", function (e) {
      e.preventDefault();
      $("html,body").animate(
        {
          scrollTop: 0,
        },
        0
      );
    });
  }
  /* For Scroll Up */
  function showScrollUp() {
    let scroll = $(window).scrollTop();
    if (scroll >= 350) {
      $(".cs_scrolltop_btn").addClass("active");
    } else {
      $(".cs_scrolltop_btn").removeClass("active");
    }
  }
  /*=============================================================
    13. AOS Animation
  ===============================================================*/
  function aosInit() {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
})(jQuery); // End of use strict
