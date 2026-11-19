/* Swiftron E-Tech India Pvt. Ltd. — site interactions */
(function () {
  "use strict";

  var WA_NUMBER = "918432712525";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("navLinks");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("click", function (e) {
      if (!links.contains(e.target) && !toggle.contains(e.target)) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- WhatsApp links ---------- */
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    var msg = el.getAttribute("data-wa") ||
      "Hello Swiftron E-Tech, I would like to enquire about your products and services.";
    el.setAttribute("href", "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  /* ---------- Product filter (products page) ---------- */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    var buttons = filterBar.querySelectorAll("button");
    var items = document.querySelectorAll("[data-cat]");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      buttons.forEach(function (b) { b.classList.toggle("active", b === btn); });
      var cat = btn.getAttribute("data-filter");
      items.forEach(function (item) {
        item.style.display = (cat === "all" || item.getAttribute("data-cat") === cat) ? "" : "none";
      });
    });
  }

  /* ---------- Enquiry form → WhatsApp + email ---------- */
  var form = document.getElementById("enquiryForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var lines = [
        "New enquiry from swiftron.in",
        "",
        "Name: " + (data.get("name") || "-"),
        "Company: " + (data.get("company") || "-"),
        "Mobile: " + (data.get("mobile") || "-"),
        "Email: " + (data.get("email") || "-"),
        "Interested in: " + (data.get("interest") || "-"),
        "",
        "Requirement: " + (data.get("message") || "-")
      ];
      window.open(
        "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n")),
        "_blank",
        "noopener"
      );
    });

    var mail = document.getElementById("sendByEmail");
    if (mail) {
      mail.addEventListener("click", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        var data = new FormData(form);
        var body = [
          "Name: " + (data.get("name") || "-"),
          "Company: " + (data.get("company") || "-"),
          "Mobile: " + (data.get("mobile") || "-"),
          "Email: " + (data.get("email") || "-"),
          "Interested in: " + (data.get("interest") || "-"),
          "",
          "Requirement:",
          (data.get("message") || "-")
        ].join("\n");
        window.location.href = "mailto:sales@swiftron.in" +
          "?subject=" + encodeURIComponent("Website enquiry — " + (data.get("name") || "New enquiry")) +
          "&body=" + encodeURIComponent(body);
      });
    }
  }
})();
