// Content is intentionally separated from the scene and its geometry.
export const domains = [
  {
    id: "interfaces",
    number: "01",
    code: "UI",
    highlight: "Vue.js · React",
    label: "Interfaces",
    title: "A experiência começa aqui.",
    description:
      "Interfaces responsivas, componentes e páginas que dão forma ao produto — do primeiro contato às tarefas do dia a dia.",
    role: "A camada que as pessoas usam.",
    technologies: [
      "JavaScript",
      "Vue.js",
      "React",
      "Tailwind CSS",
      "Bootstrap",
      "WordPress",
    ],
    position: [-2.6, 0, -1.8],
  },
  {
    id: "backend",
    number: "02",
    code: "API",
    highlight: "PHP · Laravel",
    label: "Backend",
    title: "Lógica que sustenta o produto.",
    description:
      "Regras de negócio, serviços e APIs conectam a interface aos processos que acontecem por trás dela.",
    role: "A camada que organiza as regras.",
    technologies: ["PHP", "Laravel", "API", "REST", "GraphQL"],
    position: [0, 0, -2.7],
  },
  {
    id: "dados",
    number: "03",
    code: "SQL",
    highlight: "PostgreSQL · MySQL",
    label: "Dados",
    title: "Informação com estrutura.",
    description:
      "Modelagem, consultas e persistência fazem parte da base de um sistema consistente e de integrações confiáveis.",
    role: "A camada que preserva o contexto.",
    technologies: ["SQL", "MySQL", "PostgreSQL"],
    position: [2.6, 0, -1.8],
  },
  {
    id: "integracoes",
    number: "04",
    code: "SYNC",
    highlight: "REST · GraphQL",
    label: "Integrações",
    title: "Sistemas que conversam.",
    description:
      "Conexões entre marketplaces, hubs e ERPs, incluindo fluxos de NF-e e comunicação com a SEFAZ via API.",
    role: "A camada que conecta operações.",
    technologies: ["Marketplaces", "Hubs", "ERPs", "NF-e / SEFAZ"],
    position: [2.6, 0, 1.8],
  },
  {
    id: "experiencia",
    number: "05",
    code: "FX",
    highlight: "GSAP · Three.js",
    label: "Design & motion",
    title: "Detalhes que fazem sentir.",
    description:
      "Design de interfaces, movimento e experiências WebGL dão ritmo, hierarquia e personalidade ao que aparece na tela.",
    role: "A camada que dá expressão.",
    technologies: ["Three.js", "GSAP", "Figma"],
    position: [0, 0, 2.7],
  },
  {
    id: "infra",
    number: "06",
    code: "OPS",
    highlight: "Docker · AWS",
    label: "Infra & observabilidade",
    title: "Do código à operação.",
    description:
      "Versionamento, ambientes, publicação e observabilidade acompanham o produto depois que ele sai do editor.",
    role: "A camada que acompanha a entrega.",
    technologies: ["Docker", "Git", "AWS", "Grafana"],
    position: [-2.6, 0, 1.8],
  },
];

export const technologyNames = domains.flatMap((domain) => domain.technologies);
