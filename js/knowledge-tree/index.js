import { gsap } from "gsap";
import { technologies } from "./data.js";

export function initKnowledgeTree({ reduceMotion, lowPowerDevice }) {
  const section = document.querySelector("[data-tree-experience]");
  if (!section) return;
  const viewport = section.querySelector("[data-tree-viewport]");
  const panel = section.querySelector(".tree-detail");
  const status = section.querySelector(".tree-state");
  const pause = section.querySelector("[data-tree-motion]");
  const directory = section.querySelector(".tree-directory");
  let scene = null,
    started = false,
    paused = reduceMotion,
    selected = null,
    returnFocus = null;
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");

  function select(id) {
    const tech = technologies[id];
    if (!tech) return;
    returnFocus = document.activeElement;
    selected = id;
    panel.querySelector("h3").textContent = tech.name;
    panel.querySelector(".tree-detail-zone").textContent = tech.zone;
    panel.querySelector(".tree-detail-content").textContent = tech.content;
    panel.hidden = false;
    gsap.fromTo(
      panel,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: motionQuery.matches ? 0 : 0.55,
        ease: "power3.out",
        overwrite: true,
      },
    );
    scene?.focus(id);
    section
      .querySelectorAll(".tree-directory-buttons button")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(Number(b.dataset.tech) === id)),
      );
    panel.querySelector("[data-tree-back]").focus({ preventScroll: true });
  }
  function close(reset = false) {
    gsap.killTweensOf(panel);
    panel.hidden = true;
    selected = null;
    scene?.overview(reset);
    section
      .querySelectorAll(".tree-directory-buttons button")
      .forEach((b) => b.setAttribute("aria-pressed", "false"));
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }
  function setPause() {
    pause.setAttribute("aria-pressed", String(paused));
    pause.textContent = paused ? "Retomar movimento" : "Pausar movimento";
    scene?.setPaused(paused);
  }
  setPause();
  pause.addEventListener("click", () => {
    paused = !paused;
    setPause();
  });
  panel
    .querySelector("[data-tree-back]")
    .addEventListener("click", () => close());
  section
    .querySelector("[data-tree-reset]")
    .addEventListener("click", () => close(true));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selected !== null) close();
  });
  // Outside the detail card, a click returns to overview; orbit drags stay intact.
  section.addEventListener("click", (event) => {
    if (selected !== null && event.target === viewport) close();
  });
  motionQuery.addEventListener("change", (event) => {
    paused = event.matches;
    scene?.setReduced(event.matches);
    setPause();
  });
  technologies.forEach((tech) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tech.name;
    button.dataset.tech = String(tech.id);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      select(tech.id);
      if (!scene)
        panel.scrollIntoView({
          behavior: motionQuery.matches ? "auto" : "smooth",
          block: "center",
        });
    });
    section.querySelector(".tree-directory-buttons").append(button);
  });
  const failed = () => {
    scene = null;
    section.classList.remove("tree-ready");
    section.classList.add("tree-unavailable");
    status.textContent = "Explore as tecnologias pela lista";
    directory.open = true;
    pause.disabled = true;
  };
  async function load() {
    if (started) return;
    started = true;
    status.textContent = "Dando vida às conexões…";
    try {
      const { createKnowledgeScene } = await import("./scene.js");
      scene = createKnowledgeScene({
        host: viewport,
        canvas: section.querySelector("canvas"),
        labels: section.querySelector(".tree-labels"),
        compact: lowPowerDevice || innerWidth < 760,
        reduced: motionQuery.matches,
        onSelect: select,
        onBack: close,
        onFailure: failed,
      });
      section.classList.add("tree-ready");
      status.textContent = "Árvore viva · 25 conexões";
      scene.setPaused(paused);
    } catch (error) {
      console.warn(
        "Árvore 3D indisponível; lista acessível preservada.",
        error,
      );
      failed();
    }
  }
  // Loading is lazy: the portrait and first section never wait for the 3D runtime.
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        load();
      }
    },
    { rootMargin: "450px" },
  );
  observer.observe(viewport);
}
