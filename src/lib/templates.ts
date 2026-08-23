export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Hours = {
  /** minutos desde 00:00; null = fechado no dia */
  [day in Weekday]: { open: number; close: number } | null;
};

export type Item = {
  id: string;
  name: string;
  desc?: string;
  price: number;
  /** minutos (serviços) */
  duration?: number;
};

export type Category = { id: string; name: string; note?: string; items: Item[] };

export type BizTemplate = {
  slug: string;
  niche: string;
  name: string;
  tagline: string;
  /** pedido = carrinho + entrega | agendamento = serviços + data/hora */
  kind: "pedido" | "agendamento";
  accent: string;
  accentSoft: string;
  headerFrom: string;
  headerTo: string;
  whatsapp: string;
  address: string;
  hours: Hours;
  closedNotice: string;
  ctaLabel: string;
  categories: Category[];
  prompt: string;
};

const h = (open: number, close: number) => ({ open, close });
const week = (
  segSex: { open: number; close: number } | null,
  sab = segSex,
  dom: { open: number; close: number } | null = segSex,
): Hours => ({ 0: dom, 1: segSex, 2: segSex, 3: segSex, 4: segSex, 5: segSex, 6: sab });

const m = (hh: number, mm = 0) => hh * 60 + mm;

export const templates: BizTemplate[] = [
  {
    slug: "pizzaria",
    niche: "Pizzaria",
    name: "Bella Massa",
    tagline: "Pizzaria artesanal · forno a lenha",
    kind: "pedido",
    accent: "oklch(0.58 0.19 25)",
    accentSoft: "oklch(0.35 0.10 25)",
    headerFrom: "oklch(0.32 0.11 25)",
    headerTo: "oklch(0.18 0.05 25)",
    whatsapp: "5581999990001",
    address: "Rua das Oliveiras, 220 — Boa Viagem, Recife",
    hours: week(h(m(18), m(23, 30)), h(m(18), m(23, 30)), h(m(18), m(23))),
    closedNotice:
      "Estamos fechados agora. Você já pode montar o pedido e enviar quando abrirmos.",
    ctaLabel: "Enviar pedido no WhatsApp",
    prompt:
      "Crie um site de pizzaria com cardápio por categorias (salgadas, doces, bebidas, sobremesas), status aberto/fechado automático, carrinho e envio do pedido pelo WhatsApp.",
    categories: [
      {
        id: "salgadas",
        name: "Pizzas Salgadas",
        note: "grande · 8 fatias · meio a meio disponível",
        items: [
          { id: "marg", name: "Margherita", desc: "molho de tomate, muçarela, manjericão", price: 49.9 },
          { id: "cala", name: "Calabresa", desc: "calabresa fatiada, cebola roxa, orégano", price: 52.9 },
          { id: "port", name: "Portuguesa", desc: "presunto, ovo, ervilha, cebola, muçarela", price: 56.9 },
          { id: "quat", name: "Quatro Queijos", desc: "muçarela, provolone, gorgonzola, parmesão", price: 59.9 },
          { id: "frang", name: "Frango com Catupiry", desc: "frango desfiado e catupiry original", price: 57.9 },
        ],
      },
      {
        id: "doces",
        name: "Pizzas Doces",
        items: [
          { id: "choco", name: "Chocolate com Morango", price: 54.9 },
          { id: "romeu", name: "Romeu e Julieta", desc: "goiabada cremosa e queijo", price: 49.9 },
        ],
      },
      {
        id: "bebidas",
        name: "Bebidas",
        items: [
          { id: "coca2", name: "Coca-Cola 2L", price: 14 },
          { id: "guar", name: "Guaraná 1,5L", price: 10 },
          { id: "agua", name: "Água mineral 500ml", price: 4 },
        ],
      },
      {
        id: "sobremesas",
        name: "Sobremesas",
        items: [
          { id: "pud", name: "Pudim de leite", price: 12 },
          { id: "mousse", name: "Mousse de maracujá", price: 11 },
        ],
      },
    ],
  },
  {
    slug: "hamburgueria",
    niche: "Hamburgueria",
    name: "Bendito Burger",
    tagline: "Hamburgueria artesanal · na chapa",
    kind: "pedido",
    accent: "oklch(0.78 0.16 75)",
    accentSoft: "oklch(0.42 0.09 75)",
    headerFrom: "oklch(0.26 0.03 75)",
    headerTo: "oklch(0.16 0.02 75)",
    whatsapp: "5581999990002",
    address: "Av. Central, 1180 — Espinheiro, Recife",
    hours: week(h(m(18), m(23)), h(m(18), m(23, 59)), h(m(18), m(23))),
    closedNotice:
      "Estamos fechados agora. Você pode montar o pedido e enviar quando abrirmos.",
    ctaLabel: "Enviar pedido no WhatsApp",
    prompt:
      "Crie um site de hamburgueria artesanal com cardápio, adicionais, carrinho e pedido enviado pelo WhatsApp com endereço de entrega.",
    categories: [
      {
        id: "burgers",
        name: "Burgers",
        note: "pão brioche · blend 180g",
        items: [
          { id: "classic", name: "Bendito Classic", desc: "blend, cheddar, alface, tomate, maionese da casa", price: 32 },
          { id: "bacon", name: "Bacon Duplo", desc: "dois blends, cheddar e bacon crocante", price: 42 },
          { id: "cheddar", name: "Cheddar Melt", desc: "cheddar cremoso e cebola caramelizada", price: 38 },
          { id: "veg", name: "Veggie da Casa", desc: "burger de grão-de-bico e queijo coalho", price: 34 },
        ],
      },
      {
        id: "acomp",
        name: "Acompanhamentos",
        items: [
          { id: "fritas", name: "Batata frita", price: 16 },
          { id: "cheesef", name: "Cheese fries com bacon", price: 24 },
          { id: "onion", name: "Onion rings", price: 18 },
        ],
      },
      {
        id: "bebidas",
        name: "Bebidas",
        items: [
          { id: "refri", name: "Refrigerante lata", price: 7 },
          { id: "suco", name: "Suco natural 500ml", price: 12 },
          { id: "cerv", name: "Cerveja long neck", price: 12 },
        ],
      },
      {
        id: "sobremesas",
        name: "Sobremesas",
        items: [{ id: "milk", name: "Milkshake 400ml", price: 18 }],
      },
    ],
  },
  {
    slug: "pastelaria",
    niche: "Pastelaria",
    name: "Império do Pastel",
    tagline: "Pastel na hora · caldo de cana geladinho",
    kind: "pedido",
    accent: "oklch(0.62 0.18 35)",
    accentSoft: "oklch(0.38 0.09 35)",
    headerFrom: "oklch(0.30 0.09 35)",
    headerTo: "oklch(0.17 0.04 35)",
    whatsapp: "5581999990003",
    address: "Feira de Casa Amarela, box 12 — Recife",
    hours: week(h(m(10), m(22)), h(m(10), m(22)), h(m(10), m(20))),
    closedNotice: "Estamos fechados agora. Monte seu pedido e envie quando abrirmos.",
    ctaLabel: "Enviar pedido no WhatsApp",
    prompt:
      "Crie um site de pastelaria com pastéis salgados, especiais, doces e caldo de cana, com carrinho e pedido pelo WhatsApp.",
    categories: [
      {
        id: "salgados",
        name: "Pastéis Salgados",
        note: "feitos na hora, bem crocantes",
        items: [
          { id: "carne", name: "Carne", price: 9 },
          { id: "queijo", name: "Queijo", price: 9 },
          { id: "frango", name: "Frango com catupiry", price: 11 },
          { id: "pizza", name: "Pizza", price: 10 },
        ],
      },
      {
        id: "especiais",
        name: "Pastéis Especiais",
        items: [
          { id: "camarao", name: "Camarão", price: 18 },
          { id: "carneseca", name: "Carne de sol com queijo coalho", price: 16 },
        ],
      },
      {
        id: "doces",
        name: "Pastéis Doces",
        items: [
          { id: "banana", name: "Banana com canela", price: 9 },
          { id: "brig", name: "Brigadeiro com morango", price: 11 },
        ],
      },
      {
        id: "caldo",
        name: "Caldo de cana",
        items: [
          { id: "c300", name: "Copo 300ml", price: 6 },
          { id: "c500", name: "Copo 500ml", price: 8 },
          { id: "jarra", name: "Jarra 1L", price: 15 },
        ],
      },
    ],
  },
  {
    slug: "marmitaria",
    niche: "Marmitaria fitness",
    name: "Marmita Leve",
    tagline: "Comida fitness · congelada e do dia",
    kind: "pedido",
    accent: "oklch(0.70 0.16 150)",
    accentSoft: "oklch(0.38 0.08 150)",
    headerFrom: "oklch(0.30 0.08 155)",
    headerTo: "oklch(0.17 0.04 155)",
    whatsapp: "5581999990004",
    address: "Rua do Sol, 45 — Torre, Recife",
    hours: week(h(m(10), m(20)), h(m(10), m(16)), null),
    closedNotice: "Estamos fechados agora. Monte o pedido e envie quando abrirmos.",
    ctaLabel: "Enviar pedido no WhatsApp",
    prompt:
      "Crie um site de marmitaria fitness com marmitas tradicionais, low carb, saladas e sucos, com carrinho e pedido pelo WhatsApp.",
    categories: [
      {
        id: "trad",
        name: "Marmitas Tradicionais",
        note: "tamanho P, M ou G",
        items: [
          { id: "frangoarroz", name: "Frango grelhado + arroz integral + legumes", price: 22 },
          { id: "carnepure", name: "Patinho ao molho + purê de batata doce", price: 25 },
          { id: "tilapia", name: "Tilápia assada + arroz sete grãos", price: 27 },
        ],
      },
      {
        id: "lowcarb",
        name: "Low Carb",
        items: [
          { id: "omelete", name: "Omelete de forno com frango", price: 24 },
          { id: "abobrinha", name: "Escondidinho de abobrinha com carne", price: 26 },
        ],
      },
      {
        id: "saladas",
        name: "Saladas & Bowls",
        items: [
          { id: "caesar", name: "Bowl caesar com frango", price: 23 },
          { id: "quinoa", name: "Bowl de quinoa com legumes", price: 21 },
        ],
      },
      {
        id: "sucos",
        name: "Sucos & Snacks",
        items: [
          { id: "detox", name: "Suco detox 500ml", price: 12 },
          { id: "barra", name: "Barra proteica", price: 9 },
        ],
      },
    ],
  },
  {
    slug: "hortifruti",
    niche: "Hortifruti",
    name: "Quintal Hortifruti",
    tagline: "Frutas, verduras e legumes fresquinhos · entrega no bairro",
    kind: "pedido",
    accent: "oklch(0.74 0.17 140)",
    accentSoft: "oklch(0.38 0.09 140)",
    headerFrom: "oklch(0.31 0.09 145)",
    headerTo: "oklch(0.17 0.04 145)",
    whatsapp: "5581999990005",
    address: "Rua Verde, 88 — Casa Forte, Recife",
    hours: week(h(m(7), m(19)), h(m(7), m(14)), null),
    closedNotice: "Estamos fechados agora. Monte sua feira e envie quando abrirmos.",
    ctaLabel: "Enviar feira no WhatsApp",
    prompt:
      "Crie um site de hortifruti com frutas, verduras, cestas prontas e ovos/laticínios, carrinho por unidade/kg e pedido pelo WhatsApp.",
    categories: [
      {
        id: "frutas",
        name: "Frutas",
        note: "colhidas no ponto",
        items: [
          { id: "banana", name: "Banana prata (dúzia)", price: 8 },
          { id: "manga", name: "Manga tommy (kg)", price: 7.5 },
          { id: "morango", name: "Morango (bandeja)", price: 14 },
        ],
      },
      {
        id: "verduras",
        name: "Verduras & Legumes",
        items: [
          { id: "alface", name: "Alface crespa (unid.)", price: 4 },
          { id: "tomate", name: "Tomate italiano (kg)", price: 9 },
          { id: "cenoura", name: "Cenoura (kg)", price: 6.5 },
        ],
      },
      {
        id: "cestas",
        name: "Cestas prontas",
        items: [
          { id: "cesta1", name: "Cesta semanal pequena", desc: "8 itens variados", price: 59 },
          { id: "cesta2", name: "Cesta semanal família", desc: "15 itens variados", price: 99 },
        ],
      },
      {
        id: "ovos",
        name: "Ovos & Laticínios",
        items: [
          { id: "ovos", name: "Ovos caipira (dúzia)", price: 16 },
          { id: "queijo", name: "Queijo coalho (500g)", price: 28 },
        ],
      },
    ],
  },
  {
    slug: "distribuidora",
    niche: "Distribuidora de bebidas",
    name: "Gelada Express",
    tagline: "Distribuidora de bebidas · entrega rápida e gelada",
    kind: "pedido",
    accent: "oklch(0.70 0.16 240)",
    accentSoft: "oklch(0.38 0.09 240)",
    headerFrom: "oklch(0.28 0.09 250)",
    headerTo: "oklch(0.16 0.04 250)",
    whatsapp: "5581999990006",
    address: "Av. Beira Rio, 900 — Madalena, Recife",
    hours: week(h(m(10), m(23)), h(m(10), m(23, 59)), h(m(10), m(22))),
    closedNotice: "Estamos fechados agora. Monte o pedido e envie quando abrirmos.",
    ctaLabel: "Enviar pedido no WhatsApp",
    prompt:
      "Crie um site de distribuidora de bebidas com cervejas, refrigerantes, águas e destilados, carrinho e pedido pelo WhatsApp com entrega.",
    categories: [
      {
        id: "cervejas",
        name: "Cervejas",
        items: [
          { id: "fardo", name: "Fardo lata 350ml (12un)", price: 52 },
          { id: "longneck", name: "Long neck (unid.)", price: 7 },
          { id: "litrao", name: "Litrão retornável", price: 12 },
        ],
      },
      {
        id: "refri",
        name: "Refrigerantes",
        items: [
          { id: "coca2", name: "Coca-Cola 2L", price: 13 },
          { id: "guarana", name: "Guaraná 2L", price: 10 },
        ],
      },
      {
        id: "aguas",
        name: "Águas & Energéticos",
        items: [
          { id: "agua", name: "Água com gás 500ml", price: 4 },
          { id: "energ", name: "Energético 473ml", price: 12 },
        ],
      },
      {
        id: "dest",
        name: "Destilados",
        items: [
          { id: "vodka", name: "Vodka 1L", price: 45 },
          { id: "gin", name: "Gin 750ml", price: 89 },
        ],
      },
    ],
  },
  {
    slug: "barbearia",
    niche: "Barbearia",
    name: "Dom Rocha",
    tagline: "Barbearia clássica · hora marcada",
    kind: "agendamento",
    accent: "oklch(0.80 0.13 85)",
    accentSoft: "oklch(0.40 0.07 85)",
    headerFrom: "oklch(0.24 0.02 85)",
    headerTo: "oklch(0.15 0.01 85)",
    whatsapp: "5581999990007",
    address: "Rua do Príncipe, 310 — Soledade, Recife",
    hours: week(h(m(9), m(20)), h(m(9), m(18)), null),
    closedNotice: "Estamos fechados agora. Você já pode deixar seu horário agendado.",
    ctaLabel: "Confirmar agendamento no WhatsApp",
    prompt:
      "Crie um site de barbearia com lista de serviços, duração, escolha de data e horário e agendamento enviado pelo WhatsApp.",
    categories: [
      {
        id: "cortes",
        name: "Cortes",
        items: [
          { id: "social", name: "Corte social", price: 45, duration: 40 },
          { id: "degrade", name: "Degradê navalhado", price: 55, duration: 50 },
          { id: "infantil", name: "Corte infantil", price: 40, duration: 30 },
        ],
      },
      {
        id: "barba",
        name: "Barba",
        items: [
          { id: "barba", name: "Barba na navalha", price: 40, duration: 30 },
          { id: "aparar", name: "Aparar e hidratar", price: 30, duration: 20 },
        ],
      },
      {
        id: "combos",
        name: "Combos",
        items: [
          { id: "combo1", name: "Corte + barba", price: 80, duration: 70 },
          { id: "combo2", name: "Corte + barba + sobrancelha", price: 95, duration: 85 },
        ],
      },
      {
        id: "extras",
        name: "Tratamentos & Extras",
        items: [
          { id: "pigment", name: "Pigmentação", price: 35, duration: 25 },
          { id: "relax", name: "Relaxamento capilar", price: 60, duration: 45 },
        ],
      },
    ],
  },
  {
    slug: "salao-de-beleza",
    niche: "Salão de beleza",
    name: "Studio Bella Hair",
    tagline: "Salão de beleza · cabelo, unhas & make",
    kind: "agendamento",
    accent: "oklch(0.72 0.14 10)",
    accentSoft: "oklch(0.40 0.08 10)",
    headerFrom: "oklch(0.32 0.07 10)",
    headerTo: "oklch(0.18 0.03 10)",
    whatsapp: "5581999990008",
    address: "Rua das Flores, 77 — Graças, Recife",
    hours: week(h(m(9), m(19)), h(m(8), m(17)), null),
    closedNotice:
      "Estamos fechadas agora. Você pode escolher seus serviços e já deixar o horário agendado.",
    ctaLabel: "Confirmar agendamento no WhatsApp",
    prompt:
      "Crie um site de salão de beleza com serviços de cabelo, unhas e rosto, escolha de data/hora e agendamento pelo WhatsApp.",
    categories: [
      {
        id: "cabelo",
        name: "Cabelo",
        note: "corte, cor, tratamentos",
        items: [
          { id: "corte", name: "Corte feminino", price: 70, duration: 60 },
          { id: "escova", name: "Escova modelada", price: 60, duration: 50 },
          { id: "colora", name: "Coloração", price: 180, duration: 120 },
        ],
      },
      {
        id: "unhas",
        name: "Unhas",
        items: [
          { id: "maopé", name: "Mão e pé", price: 60, duration: 70 },
          { id: "gel", name: "Alongamento em gel", price: 160, duration: 120 },
        ],
      },
      {
        id: "rosto",
        name: "Rosto",
        items: [
          { id: "design", name: "Design de sobrancelha", price: 40, duration: 30 },
          { id: "make", name: "Maquiagem social", price: 130, duration: 60 },
        ],
      },
    ],
  },
  {
    slug: "petshop",
    niche: "Petshop",
    name: "Pet Amigo",
    tagline: "Banho & tosa · seu pet nas melhores mãos",
    kind: "agendamento",
    accent: "oklch(0.72 0.15 235)",
    accentSoft: "oklch(0.40 0.08 235)",
    headerFrom: "oklch(0.30 0.08 235)",
    headerTo: "oklch(0.17 0.04 235)",
    whatsapp: "5581999990009",
    address: "Rua dos Bichos, 150 — Aflitos, Recife",
    hours: week(h(m(8), m(18)), h(m(8), m(14)), null),
    closedNotice: "Estamos fechados agora. Monte seu agendamento e escolha a melhor data.",
    ctaLabel: "Confirmar agendamento no WhatsApp",
    prompt:
      "Crie um site de petshop com banho e tosa por porte, cuidados extras, escolha de data/hora e agendamento pelo WhatsApp.",
    categories: [
      {
        id: "banho",
        name: "Banho & Tosa",
        note: "escolha o porte do seu pet",
        items: [
          { id: "bpeq", name: "Banho porte pequeno", price: 50, duration: 60 },
          { id: "bmed", name: "Banho porte médio", price: 70, duration: 75 },
          { id: "tosa", name: "Tosa higiênica", price: 45, duration: 40 },
          { id: "tosac", name: "Tosa completa", price: 90, duration: 90 },
        ],
      },
      {
        id: "cuidados",
        name: "Cuidados & Mimos",
        items: [
          { id: "unhas", name: "Corte de unhas", price: 25, duration: 20 },
          { id: "dentes", name: "Escovação dental", price: 35, duration: 25 },
          { id: "hidr", name: "Hidratação de pelos", price: 60, duration: 40 },
        ],
      },
    ],
  },
  {
    slug: "dentista",
    niche: "Dentista",
    name: "Sorriso Odonto",
    tagline: "Clínica odontológica · avaliação gratuita",
    kind: "agendamento",
    accent: "oklch(0.75 0.13 205)",
    accentSoft: "oklch(0.40 0.07 205)",
    headerFrom: "oklch(0.29 0.06 210)",
    headerTo: "oklch(0.17 0.03 210)",
    whatsapp: "5581999990010",
    address: "Av. Conselheiro Aguiar, 2200 — sala 704, Recife",
    hours: week(h(m(8), m(18)), h(m(8), m(12)), null),
    closedNotice:
      "Estamos fechados agora. Você pode escolher data e horário e enviar seu agendamento mesmo assim.",
    ctaLabel: "Enviar agendamento no WhatsApp",
    prompt:
      "Crie um site de clínica odontológica com avaliação gratuita, serviços de estética e tratamentos, e agendamento pelo WhatsApp.",
    categories: [
      {
        id: "comece",
        name: "Comece por aqui",
        items: [
          { id: "aval", name: "Avaliação gratuita", desc: "diagnóstico e plano de tratamento", price: 0, duration: 40 },
          { id: "limpeza", name: "Limpeza e profilaxia", price: 180, duration: 50 },
        ],
      },
      {
        id: "estetica",
        name: "Estética",
        items: [
          { id: "clare", name: "Clareamento a laser", price: 900, duration: 90 },
          { id: "faceta", name: "Faceta em resina (por dente)", price: 650, duration: 80 },
        ],
      },
      {
        id: "trat",
        name: "Tratamentos",
        items: [
          { id: "canal", name: "Tratamento de canal", price: 800, duration: 90 },
          { id: "apar", name: "Instalação de aparelho", price: 1200, duration: 60 },
        ],
      },
    ],
  },
  {
    slug: "personal-trainer",
    niche: "Personal trainer",
    name: "Corpo em Foco",
    tagline: "Personal training · avaliação física gratuita",
    kind: "agendamento",
    accent: "oklch(0.78 0.19 145)",
    accentSoft: "oklch(0.40 0.09 145)",
    headerFrom: "oklch(0.24 0.05 145)",
    headerTo: "oklch(0.15 0.02 145)",
    whatsapp: "5581999990011",
    address: "Parque da Jaqueira — ponto de encontro portão 2, Recife",
    hours: week(h(m(6), m(21)), h(m(6), m(12)), null),
    closedNotice: "Fora do horário de atendimento. Você já pode deixar seu horário marcado.",
    ctaLabel: "Agendar no WhatsApp",
    prompt:
      "Crie um site de personal trainer com planos, avaliação física gratuita e agendamento de horário pelo WhatsApp.",
    categories: [
      {
        id: "planos",
        name: "Planos",
        items: [
          { id: "aval", name: "Avaliação física gratuita", price: 0, duration: 45 },
          { id: "p2x", name: "Plano 2x por semana", price: 320, duration: 60 },
          { id: "p3x", name: "Plano 3x por semana", price: 450, duration: 60 },
        ],
      },
      {
        id: "avulsas",
        name: "Aulas avulsas",
        items: [
          { id: "avulsa", name: "Aula avulsa", price: 80, duration: 60 },
          { id: "dupla", name: "Aula em dupla (por pessoa)", price: 55, duration: 60 },
        ],
      },
    ],
  },
  {
    slug: "quadra-society",
    niche: "Quadra society",
    name: "Arena Gol de Placa",
    tagline: "Society · areia · churrasqueira",
    kind: "agendamento",
    accent: "oklch(0.72 0.17 150)",
    accentSoft: "oklch(0.38 0.08 150)",
    headerFrom: "oklch(0.23 0.05 150)",
    headerTo: "oklch(0.14 0.02 150)",
    whatsapp: "5581999990012",
    address: "Rod. dos Esportes, km 4 — Jaboatão",
    hours: week(h(m(8), m(23)), h(m(8), m(23)), h(m(8), m(20))),
    closedNotice: "Estamos fechados agora. Você pode reservar seu horário pra qualquer dia.",
    ctaLabel: "Reservar no WhatsApp",
    prompt:
      "Crie um site de quadra society com reserva de horário por quadra, adicionais (bola, colete, churrasqueira) e envio pelo WhatsApp.",
    categories: [
      {
        id: "quadras",
        name: "Quadras",
        items: [
          { id: "society1", name: "Society 1 (grama sintética) — 1h", price: 140, duration: 60 },
          { id: "society2", name: "Society 2 (coberta) — 1h", price: 170, duration: 60 },
          { id: "areia", name: "Quadra de areia — 1h", price: 110, duration: 60 },
        ],
      },
      {
        id: "adicionais",
        name: "Adicionais",
        items: [
          { id: "colete", name: "Jogo de coletes", price: 20 },
          { id: "bola", name: "Bola oficial", price: 15 },
          { id: "churras", name: "Churrasqueira + mesas", price: 80 },
        ],
      },
    ],
  },
  {
    slug: "loja-de-roupa",
    niche: "Loja de roupa",
    name: "Boutique Lila",
    tagline: "Moda feminina · peças que vestem você",
    kind: "pedido",
    accent: "oklch(0.74 0.12 40)",
    accentSoft: "oklch(0.42 0.06 40)",
    headerFrom: "oklch(0.33 0.05 40)",
    headerTo: "oklch(0.18 0.02 40)",
    whatsapp: "5581999990013",
    address: "Rua da Moda, 501 — Boa Vista, Recife",
    hours: week(h(m(9), m(19)), h(m(9), m(14)), null),
    closedNotice: "Estamos fechadas agora. Monte a sacola e envie quando abrirmos.",
    ctaLabel: "Enviar sacola no WhatsApp",
    prompt:
      "Crie um site de loja de roupa feminina com catálogo por categoria, sacola de compras e pedido enviado pelo WhatsApp.",
    categories: [
      {
        id: "vestidos",
        name: "Vestidos",
        items: [
          { id: "midi", name: "Vestido midi floral", price: 189 },
          { id: "longo", name: "Vestido longo de festa", price: 349 },
        ],
      },
      {
        id: "blusas",
        name: "Blusas & Tops",
        items: [
          { id: "cropped", name: "Cropped canelado", price: 79 },
          { id: "camisa", name: "Camisa de linho", price: 149 },
        ],
      },
      {
        id: "calcas",
        name: "Calças & Saias",
        items: [
          { id: "jeans", name: "Calça jeans wide leg", price: 219 },
          { id: "saia", name: "Saia midi plissada", price: 159 },
        ],
      },
      {
        id: "acess",
        name: "Acessórios",
        items: [
          { id: "bolsa", name: "Bolsa de palha", price: 129 },
          { id: "brinco", name: "Brinco dourado", price: 49 },
        ],
      },
    ],
  },
  {
    slug: "materiais-de-construcao",
    niche: "Materiais de construção",
    name: "ConstruBem",
    tagline: "Material de construção · direto do depósito",
    kind: "pedido",
    accent: "oklch(0.75 0.17 60)",
    accentSoft: "oklch(0.42 0.09 60)",
    headerFrom: "oklch(0.28 0.06 60)",
    headerTo: "oklch(0.16 0.03 60)",
    whatsapp: "5581999990014",
    address: "Rod. BR-101, km 12 — Depósito 3, Jaboatão",
    hours: week(h(m(7), m(18)), h(m(7), m(13)), null),
    closedNotice:
      "Estamos fechados agora. Monte seu orçamento e envie — a gente separa e confirma assim que abrir.",
    ctaLabel: "Pedir orçamento no WhatsApp",
    prompt:
      "Crie um site de loja de materiais de construção com itens por categoria, lista de orçamento e envio pelo WhatsApp.",
    categories: [
      {
        id: "basico",
        name: "Básico da Obra",
        items: [
          { id: "cimento", name: "Cimento CP-II 50kg", price: 42 },
          { id: "areia", name: "Areia média (m³)", price: 130 },
          { id: "brita", name: "Brita 1 (m³)", price: 150 },
        ],
      },
      {
        id: "alven",
        name: "Alvenaria",
        items: [
          { id: "tijolo", name: "Tijolo 8 furos (milheiro)", price: 890 },
          { id: "bloco", name: "Bloco estrutural (unid.)", price: 4.2 },
        ],
      },
      {
        id: "tintas",
        name: "Tintas & Acabamento",
        items: [
          { id: "acrilica", name: "Tinta acrílica 18L", price: 289 },
          { id: "massa", name: "Massa corrida 25kg", price: 78 },
        ],
      },
      {
        id: "hidraulica",
        name: "Hidráulica",
        items: [
          { id: "cano", name: "Cano PVC 25mm (barra 6m)", price: 34 },
          { id: "conexao", name: "Kit conexões 25mm", price: 48 },
        ],
      },
    ],
  },
  {
    slug: "pousada",
    niche: "Pousada",
    name: "Recanto Verde",
    tagline: "Pousada · natureza e sossego na serra",
    kind: "agendamento",
    accent: "oklch(0.72 0.13 160)",
    accentSoft: "oklch(0.40 0.07 160)",
    headerFrom: "oklch(0.27 0.06 160)",
    headerTo: "oklch(0.16 0.03 160)",
    whatsapp: "5581999990015",
    address: "Estrada da Serra, s/n — Gravatá",
    hours: week(h(m(8), m(20)), h(m(8), m(20)), h(m(8), m(20))),
    closedNotice:
      "A recepção está fechada agora. Você pode montar sua reserva e enviar — respondemos assim que abrir.",
    ctaLabel: "Enviar reserva no WhatsApp",
    prompt:
      "Crie um site de pousada com tipos de quarto, experiências extras, escolha de data de check-in e reserva pelo WhatsApp.",
    categories: [
      {
        id: "quartos",
        name: "Acomodações",
        note: "diária com café colonial incluso",
        items: [
          { id: "casal", name: "Chalé casal", price: 390, duration: 0 },
          { id: "familia", name: "Chalé família (4 pessoas)", price: 620, duration: 0 },
          { id: "suite", name: "Suíte com hidro", price: 780, duration: 0 },
        ],
      },
      {
        id: "extras",
        name: "Experiências",
        items: [
          { id: "trilha", name: "Trilha guiada", price: 90 },
          { id: "jantar", name: "Jantar romântico", price: 260 },
          { id: "cavalo", name: "Passeio a cavalo", price: 120 },
        ],
      },
    ],
  },
  {
    slug: "aluguel-de-festa",
    niche: "Aluguel de festa",
    name: "Festa & Alegria",
    tagline: "Aluguel de brinquedos e equipamentos de festa",
    kind: "pedido",
    accent: "oklch(0.68 0.20 300)",
    accentSoft: "oklch(0.40 0.10 300)",
    headerFrom: "oklch(0.30 0.10 300)",
    headerTo: "oklch(0.17 0.05 300)",
    whatsapp: "5581999990016",
    address: "Rua da Alegria, 33 — Olinda",
    hours: week(h(m(8), m(20)), h(m(8), m(20)), h(m(8), m(18))),
    closedNotice:
      "Fora do horário de atendimento. Monte sua lista e envie o orçamento quando quiser.",
    ctaLabel: "Pedir orçamento no WhatsApp",
    prompt:
      "Crie um site de aluguel de itens para festa com combos, brinquedos, mesas e estrutura, lista de orçamento e envio pelo WhatsApp.",
    categories: [
      {
        id: "combos",
        name: "Combos",
        note: "kits prontos que economizam",
        items: [
          { id: "kit1", name: "Kit aniversário infantil", desc: "pula-pula + piscina de bolinha + 4 mesas", price: 480 },
          { id: "kit2", name: "Kit festa completa", desc: "brinquedos + som + 8 mesas + tenda", price: 1200 },
        ],
      },
      {
        id: "brinquedos",
        name: "Brinquedos",
        items: [
          { id: "pula", name: "Pula-pula 3x3m (diária)", price: 220 },
          { id: "bolinha", name: "Piscina de bolinhas", price: 180 },
          { id: "tobo", name: "Tobogã inflável", price: 350 },
        ],
      },
      {
        id: "mesas",
        name: "Mesas & Cadeiras",
        items: [
          { id: "mesa", name: "Mesa plástica + 4 cadeiras", price: 25 },
          { id: "toalha", name: "Toalha de mesa", price: 8 },
        ],
      },
      {
        id: "estrutura",
        name: "Estrutura",
        items: [
          { id: "tenda", name: "Tenda 4x4m", price: 260 },
          { id: "som", name: "Som com DJ (4h)", price: 700 },
        ],
      },
    ],
  },
];

export const getTemplate = (slug: string) => templates.find((t) => t.slug === slug);

export const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function fmtMinutes(v: number) {
  const hh = Math.floor(v / 60);
  const mm = v % 60;
  return `${String(hh).padStart(2, "0")}h${mm ? String(mm).padStart(2, "0") : ""}`;
}

export function hoursSummary(hours: Hours) {
  const parts: string[] = [];
  let i = 0;
  while (i < 7) {
    const day = ((i + 1) % 7) as Weekday; // começa na segunda
    const cur = hours[day];
    let j = i;
    while (j + 1 < 7) {
      const next = hours[((j + 2) % 7) as Weekday];
      const same =
        (cur === null && next === null) ||
        (cur && next && cur.open === next.open && cur.close === next.close);
      if (!same) break;
      j++;
    }
    const startName = dayNames[(i + 1) % 7];
    const endName = dayNames[(j + 1) % 7];
    const label = i === j ? startName : `${startName} a ${endName}`;
    parts.push(cur ? `${label} ${fmtMinutes(cur.open)}–${fmtMinutes(cur.close)}` : `${label} fechado`);
    i = j + 1;
  }
  return parts.join(" · ");
}

export type OpenState = { open: boolean; nextOpenLabel: string };

export function getOpenState(hours: Hours, now: Date): OpenState {
  const day = now.getDay() as Weekday;
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = hours[day];
  if (today && mins >= today.open && mins < today.close) {
    return { open: true, nextOpenLabel: "" };
  }
  for (let offset = 0; offset < 8; offset++) {
    const d = ((day + offset) % 7) as Weekday;
    const slot = hours[d];
    if (!slot) continue;
    if (offset === 0 && mins >= slot.open) continue;
    const when =
      offset === 0 ? "hoje" : offset === 1 ? "amanhã" : `${dayNames[d]}`;
    return { open: false, nextOpenLabel: `${when} às ${fmtMinutes(slot.open)}` };
  }
  return { open: false, nextOpenLabel: "em breve" };
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
