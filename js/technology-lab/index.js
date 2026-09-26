import { gsap } from "gsap";
import { domains } from "./data.js";

export function initTechnologyLab({ reduceMotion, lowPowerDevice }) {
  const lab = document.querySelector("[data-technology-lab]");
  if (!lab) return;
  const tabs = [...lab.querySelectorAll("[data-domain]")],
    panel = lab.querySelector("[data-lab-panel]"),
    chips = lab.querySelector("[data-lab-chips]");
  const motion = lab.querySelector("[data-lab-motion]"),
    status = lab.querySelector("[data-lab-status]");
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let selected = 0,
    scene = null,
    started = false,
    paused = reduceMotion;
  const updatePause = () => {
    motion.textContent = paused ? "Retomar movimento" : "Pausar movimento";
    motion.setAttribute("aria-pressed", String(paused));
    scene?.setPaused(paused);
  };
  function select(index, animate = true) {
    selected = index;
    const domain = domains[index];
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tabs[index].id);
    panel.querySelector("[data-lab-number]").textContent = domain.number;
    panel.querySelector("h3").textContent = domain.title;
    panel.querySelector("[data-lab-description]").textContent =
      domain.description;
    panel.querySelector("[data-lab-role]").textContent = domain.role;
    lab.querySelector("[data-lab-caption]").textContent =
      domain.code + " / " + domain.label;
    lab.dataset.active = domain.id;
    chips.replaceChildren(
      ...domain.technologies.map((name) => {
        const chip = document.createElement("span");
        chip.textContent = name;
        return chip;
      }),
    );
    if (animate && !media.matches)
      gsap.fromTo(
        panel.querySelector(".lab-panel-content"),
        { opacity: 0.35, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
          overwrite: true,
        },
      );
    scene?.select(index);
    lab
      .querySelectorAll("[data-map-domain]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.mapDomain) === index),
        ),
      );
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
      select(next);
      tabs[next].focus({ preventScroll: true });
      tabs[next].scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
    });
  });
  lab
    .querySelectorAll("[data-map-domain]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        select(Number(button.dataset.mapDomain)),
      ),
    );
  motion.addEventListener("click", () => {
    paused = !paused;
    updatePause();
  });
  lab
    .querySelector("[data-lab-reset]")
    .addEventListener("click", () => scene?.reset());
  media.addEventListener("change", (event) => {
    paused = event.matches;
    scene?.setReduced(event.matches);
    updatePause();
  });
  updatePause();
  select(0, false);
  function failed() {
    scene = null;
    lab.classList.remove("lab-ready");
    lab.classList.add("lab-static");
    status.textContent = "Mapa interativo";
    motion.disabled = true;
    lab.querySelector("[data-lab-reset]").disabled = true;
  }
  async function load() {
    if (started) return;
    started = true;
    try {
      const { createLabScene } = await import("./scene.js");
      scene = createLabScene({
        canvas: lab.querySelector("canvas"),
        host: lab.querySelector(".lab-visual"),
        compact: lowPowerDevice || innerWidth < 700,
        reduced: media.matches,
        onSelect: select,
        onFailure: failed,
      });
      scene.select(selected, true);
      scene.setPaused(paused);
      lab.classList.add("lab-ready");
      status.textContent = "Modelo 3D interativo";
    } catch (error) {
      console.warn(
        "Modo 3D indisponível; mapa e tecnologias preservados.",
        error,
      );
      failed();
    }
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        load();
      }
    },
    { rootMargin: "300px" },
  );
  observer.observe(lab);
}
