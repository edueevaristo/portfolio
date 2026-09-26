// Positions are world coordinates. All names and editable copy live here.
const entries = [
  ["MySQL", "Raízes · dados", [-2.1, -3.35, 1.9]],
  ["SQL", "Raízes · dados", [0, -3.65, 2.25]],
  ["PostgreSQL", "Raízes · dados", [2.2, -3.35, 1.9]],
  ["GraphQL", "Tronco · conexões", [0, -2.15, 1.3]],
  ["REST", "Tronco · conexões", [0, -1.05, 1.3]],
  ["Docker", "Tronco · infraestrutura", [-0.85, -0.12, 1.3]],
  ["Git", "Tronco · colaboração", [0.85, -0.2, 1.3]],
  ["API", "Tronco · conexões", [0, 0.83, 1.4]],
  ["PHP", "Galhos · desenvolvimento", [-3.05, 1.65, 1.9]],
  ["Laravel", "Galhos · desenvolvimento", [-1.72, 2.02, 2]],
  ["JavaScript", "Galhos · desenvolvimento", [-2.95, 3.02, 2]],
  ["Vue.js", "Galhos · interfaces", [-1.08, 3.27, 2.05]],
  ["React", "Galhos · interfaces", [0.96, 3.12, 2.05]],
  ["Tailwind CSS", "Galhos · interfaces", [1.85, 1.98, 1.9]],
  ["Bootstrap", "Galhos · interfaces", [3.28, 1.45, 1.95]],
  ["GSAP", "Galhos · movimento", [2.83, 2.82, 2.05]],
  ["Three.js", "Copa · experiências", [-1.92, 4.53, 1.5]],
  ["Grafana", "Copa · observabilidade", [-3.65, 4.7, 1.35]],
  ["Hubs", "Copa · integrações", [-4.78, 3.47, 1.2]],
  ["ERPs", "Copa · integrações", [-4.82, 1.97, 1.35]],
  ["Figma", "Copa · design", [1.86, 4.62, 1.4]],
  ["AWS", "Copa · infraestrutura", [0, 5.42, 1.3]],
  ["WordPress", "Copa · publicação", [3.63, 4.2, 1.3]],
  ["Marketplaces", "Copa · comércio", [4.87, 3.15, 1.4]],
  ["NF-e / SEFAZ", "Copa · integrações", [4.9, 1.72, 1.5]],
];

export const technologies = entries.map(([name, zone, position], id) => ({
  id,
  name,
  zone,
  position: [position[0], position[1], position[2] + 2.15],
  // Replace each placeholder with Eduardo's own first-person account.
  content: `[CONTEÚDO SOBRE ${name.toLocaleUpperCase("pt-BR")}]`,
}));
