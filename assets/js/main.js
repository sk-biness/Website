(function () {
  "use strict";

  /* ---------- contact form endpoint ----------
     Paste your Google Apps Script Web App URL here after deploying it.
     See google-apps-script.gs and README.md for the 5-minute setup.
     Until this is filled in, the form will show an error instead of sending. */
  var CONTACT_FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbzvpqAZfFFtntgOd6d-ho8DNGIyfrE9t2DNKajHyZKD1B93aKpGe0B-RVrE_RTb3UWlgQ/exec";

  /* ---------- sticky header state ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };
  if (header) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobile nav toggle ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- project cards: auto-slide + lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");

  var currentGallery = [];
  var currentIndex = -1;
  var SLIDE_INTERVAL = 2000;

  function showAt(index) {
    if (!currentGallery.length) return;
    currentIndex = (index + currentGallery.length) % currentGallery.length;
    var item = currentGallery[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = item.caption || "";
  }

  function openLightbox(gallery, startIndex) {
    currentGallery = gallery;
    showAt(startIndex || 0);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function () {
      showAt(currentIndex - 1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener("click", function () {
      showAt(currentIndex + 1);
    });
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showAt(currentIndex - 1);
      if (e.key === "ArrowRight") showAt(currentIndex + 1);
    });
  }

  document.querySelectorAll(".project-card").forEach(function (card) {
    var slides = Array.prototype.slice.call(card.querySelectorAll(".project-card__slide"));
    var dots = Array.prototype.slice.call(card.querySelectorAll(".project-card__dots .dot"));
    var infoEl = card.querySelector(".project-card__info h3");
    var metaEl = card.querySelector(".project-card__meta");
    var caption = infoEl ? infoEl.textContent + (metaEl ? " \u00b7 " + metaEl.textContent : "") : "";
    var activeIndex = 0;
    var timer = null;

    function goTo(i) {
      if (!slides.length) return;
      slides[activeIndex].classList.remove("is-active");
      if (dots[activeIndex]) dots[activeIndex].classList.remove("is-active");
      activeIndex = (i + slides.length) % slides.length;
      slides[activeIndex].classList.add("is-active");
      if (dots[activeIndex]) dots[activeIndex].classList.add("is-active");
    }

    function start() {
      if (slides.length < 2) return;
      stop();
      timer = setInterval(function () {
        goTo(activeIndex + 1);
      }, SLIDE_INTERVAL);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    start();
    card.addEventListener("mouseenter", stop);
    card.addEventListener("mouseleave", start);
    card.addEventListener("focus", stop);
    card.addEventListener("blur", start);

    card.addEventListener("click", function () {
      var gallery = slides.map(function (img) {
        return { src: img.src, alt: img.alt, caption: caption };
      });
      openLightbox(gallery, activeIndex);
    });
  });

  /* ---------- testimonial carousel controls ---------- */
  var testiTrack = document.querySelector(".testi-track");
  var prevBtn = document.querySelector(".testi-prev");
  var nextBtn = document.querySelector(".testi-next");
  if (testiTrack && prevBtn && nextBtn) {
    var scrollByCard = function (dir) {
      var card = testiTrack.querySelector(".testi-card");
      var amount = card ? card.getBoundingClientRect().width + 22 : 320;
      testiTrack.scrollBy({ left: dir * amount, behavior: "smooth" });
    };
    prevBtn.addEventListener("click", function () {
      scrollByCard(-1);
    });
    nextBtn.addEventListener("click", function () {
      scrollByCard(1);
    });
  }

  /* ---------- services carousel controls ---------- */
  var servicesTrack = document.querySelector(".services-track");
  var servicesPrev = document.querySelector(".services-prev");
  var servicesNext = document.querySelector(".services-next");
  if (servicesTrack && servicesPrev && servicesNext) {
    var scrollByService = function (dir) {
      var card = servicesTrack.querySelector(".service-card");
      var amount = card ? card.getBoundingClientRect().width + 18 : 320;
      servicesTrack.scrollBy({ left: dir * amount, behavior: "smooth" });
    };
    servicesPrev.addEventListener("click", function () {
      scrollByService(-1);
    });
    servicesNext.addEventListener("click", function () {
      scrollByService(1);
    });
  }

  /* ---------- current year in footer ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- contact form: send via Google Apps Script (Gmail) ---------- */
  var contactForm = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");
  var formSubmit = document.getElementById("form-submit");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameField = document.getElementById("cf-name");
      var emailField = document.getElementById("cf-email");

      if (!nameField.value.trim() || !emailField.value.trim()) {
        formStatus.textContent = "Please fill in your name and email.";
        return;
      }

      if (!CONTACT_FORM_ENDPOINT || CONTACT_FORM_ENDPOINT.indexOf("PASTE_YOUR") === 0) {
        formStatus.textContent = "Form isn't connected yet — see README.md to finish setup.";
        return;
      }

      var originalLabel = formSubmit.textContent;
      formSubmit.disabled = true;
      formSubmit.textContent = "Sending...";
      formStatus.textContent = "Sending your message...";

      var formData = new FormData(contactForm);

      fetch(CONTACT_FORM_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      })
        .then(function () {
          window.location.href = "thank-you.html";
        })
        .catch(function () {
          formSubmit.disabled = false;
          formSubmit.textContent = originalLabel;
          formStatus.textContent = "Something went wrong — please email us directly at skbusiness576@gmail.com.";
        });
    });
  }
})();
