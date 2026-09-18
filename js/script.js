/* ================================================================
   Rakibul Hasan — Portfolio interactions
   Vanilla JavaScript with progressive enhancement.
   ================================================================ */

"use strict";

document.body.classList.add("js-enabled");

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".primary-navigation");
const navigationLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main > section[id]")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const projectCards = [
  ...document.querySelectorAll(".project-card, .compact-project-card"),
];
const copyEmailButton = document.querySelector("#copy-email-button");
const copyMessage = document.querySelector("#copy-message");
const currentYear = document.querySelector("#current-year");
const backToTop = document.querySelector(".back-to-top");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* Mobile navigation */

function closeMobileMenu() {
  if (!menuButton || !navigation) return;

  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.querySelector("span").textContent = "Menu";
}

function toggleMobileMenu() {
  if (!menuButton || !navigation) return;

  const isOpen = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.querySelector("span").textContent = isOpen ? "Close" : "Menu";
}

menuButton?.addEventListener("click", toggleMobileMenu);

navigationLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 700) closeMobileMenu();
});

/* Active navigation state */

function setActiveNavigation(sectionId) {
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

      if (visibleSections[0]) {
        setActiveNavigation(visibleSections[0].target.id);
      }
    },
    {
      rootMargin: "-22% 0px -58% 0px",
      threshold: [0.05, 0.2, 0.45],
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

/* Project filtering */

const projectSection = document.querySelector("#projects .section-content");
const filterStatus = document.createElement("p");
filterStatus.className = "sr-only";
filterStatus.setAttribute("role", "status");
filterStatus.setAttribute("aria-live", "polite");
projectSection?.prepend(filterStatus);

function filterProjects(category) {
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const categories = (card.dataset.category || "").split(/\s+/);
    const shouldShow = category === "all" || categories.includes(category);

    card.hidden = !shouldShow;
    if (shouldShow) visibleCount += 1;
  });

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === category;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const activeButton = filterButtons.find(
    (button) => button.dataset.filter === category,
  );
  const categoryName = activeButton?.textContent.trim() || "selected";
  filterStatus.textContent = `${visibleCount} ${categoryName} projects displayed.`;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterProjects(button.dataset.filter || "all");
  });
});

/* Copy email */

async function writeToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = text;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";
  document.body.appendChild(temporaryInput);
  temporaryInput.select();

  const copied = document.execCommand("copy");
  temporaryInput.remove();

  if (!copied) throw new Error("Clipboard copy was unavailable.");
}

copyEmailButton?.addEventListener("click", async () => {
  const email = copyEmailButton.dataset.email;
  if (!email || !copyMessage) return;

  try {
    await writeToClipboard(email);
    copyEmailButton.textContent = "Copied";
    copyMessage.textContent = `${email} copied to your clipboard.`;
  } catch {
    copyEmailButton.textContent = "Copy unavailable";
    copyMessage.textContent = `Please copy the email manually: ${email}`;
  }

  window.setTimeout(() => {
    copyEmailButton.textContent = "Copy Email";
    copyMessage.textContent = "";
  }, 3000);
});

/* Current year and back-to-top visibility */

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

function updateBackToTop() {
  backToTop?.classList.toggle("is-visible", window.scrollY > 600);
}

let scrollFrameRequested = false;

window.addEventListener(
  "scroll",
  () => {
    if (scrollFrameRequested) return;

    scrollFrameRequested = true;
    window.requestAnimationFrame(() => {
      updateBackToTop();
      scrollFrameRequested = false;
    });
  },
  { passive: true },
);

updateBackToTop();

/* Subtle scroll-reveal animation */

const revealItems = [
  ...document.querySelectorAll(
    ".section-heading, .timeline-item, .project-card, .compact-project-card, " +
      ".research-card, .skill-group, .supporting-details article, " +
      ".contact-section .section-content",
  ),
];

revealItems.forEach((item) => item.classList.add("reveal-item"));

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08,
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}
