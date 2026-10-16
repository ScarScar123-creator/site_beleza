// Número que recebe as solicitações de agendamento (demonstrativo — trocar pelo do salão)
const WHATSAPP = "5519999999999";

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ===== Catálogo de serviços =====
const SERVICOS = {
  cabelo: [
    { nome: "Corte feminino", desc: "Lavagem, corte e finalização", preco: 120, tempo: "1h" },
    { nome: "Corte masculino", desc: "Máquina e tesoura, com lavagem", preco: 60, tempo: "40min" },
    { nome: "Escova modelada", desc: "Lisa, ondulada ou com volume", preco: 70, tempo: "50min" },
    { nome: "Coloração", desc: "Raiz ou global, sem amônia", preco: 190, tempo: "2h" },
    { nome: "Mechas / Morena iluminada", desc: "Inclui tonalização e matização", preco: 450, tempo: "4h" },
    { nome: "Hidratação profunda", desc: "Cronograma personalizado", preco: 95, tempo: "1h" },
  ],
  unhas: [
    { nome: "Manicure", desc: "Cutilagem e esmaltação", preco: 35, tempo: "40min" },
    { nome: "Pedicure", desc: "Cutilagem, esfoliação e esmaltação", preco: 45, tempo: "50min" },
    { nome: "Esmaltação em gel", desc: "Dura até 3 semanas", preco: 80, tempo: "1h" },
    { nome: "Alongamento em gel", desc: "Molde F1, formato à escolha", preco: 180, tempo: "2h30" },
  ],
  estetica: [
    { nome: "Design de sobrancelha", desc: "Com pinça e linha", preco: 45, tempo: "30min" },
    { nome: "Brow lamination", desc: "Fios alinhados por até 6 semanas", preco: 130, tempo: "1h" },
    { nome: "Lash lifting", desc: "Curvatura natural dos cílios", preco: 140, tempo: "1h" },
    { nome: "Limpeza de pele", desc: "Extração, máscara e hidratação", preco: 160, tempo: "1h20" },
  ],
  make: [
    { nome: "Maquiagem social", desc: "Para festas e eventos", preco: 180, tempo: "1h" },
    { nome: "Penteado", desc: "Preso, semi-preso ou ondas", preco: 150, tempo: "1h" },
    { nome: "Make + penteado", desc: "Combo para madrinhas e formandas", preco: 300, tempo: "2h" },
  ],
};

const PACOTES = {
  "Renovação": 289.9,
  "Dia da Noiva": 1290,
  "Pé & Mão Club": 149.9,
};

// ===== Menu mobile =====
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("menu");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Sombra no topo ao rolar
const topbar = document.querySelector(".topbar");
window.addEventListener("scroll", () => topbar.classList.toggle("scrolled", window.scrollY > 10), { passive: true });

// ===== Abas de serviços =====
const menuList = document.getElementById("menu-list");
const tabs = document.querySelectorAll(".tab");

function renderMenu(cat) {
  menuList.innerHTML = SERVICOS[cat]
    .map((s) => `
      <div class="menu-item">
        <div>
          <h3>${s.nome}</h3>
          <p>${s.desc} · <span>${s.tempo}</span></p>
        </div>
        <span class="menu-item__dots" aria-hidden="true"></span>
        <strong>${brl(s.preco)}</strong>
      </div>`)
    .join("");
}

tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.toggle("active", t === tab);
      t.setAttribute("aria-selected", t === tab);
    });
    renderMenu(tab.dataset.tab);
  })
);
renderMenu("cabelo");

// ===== Animação ao rolar =====
const revealables = document.querySelectorAll(".section__head, .about__media, .about__text, .plan, .member, .quote, .booking__intro, .form, .contact__inner > *");
revealables.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      io.unobserve(e.target);
    }
  }),
  { threshold: 0.15 }
);
revealables.forEach((el) => io.observe(el));

// ===== Formulário de agendamento =====
const form = document.getElementById("booking-form");
const choices = document.getElementById("choices");
const estimate = document.getElementById("estimate");
const estimateNote = document.getElementById("estimate-note");
const msg = document.getElementById("form-msg");

const opcoes = [
  ...Object.entries(PACOTES).map(([nome, preco]) => ({ nome, preco, pacote: true })),
  ...Object.values(SERVICOS).flat(),
];
choices.innerHTML = opcoes
  .map((s) => `
    <label class="choice${s.pacote ? " choice--pkg" : ""}">
      <input type="checkbox" name="servico" value="${s.nome}" data-price="${s.preco}">
      <span>${s.nome}</span><b>${brl(s.preco)}</b>
    </label>`)
  .join("");

form.data.min = new Date().toISOString().split("T")[0];

function calcEstimate() {
  const selecionados = [...form.querySelectorAll("input[name=servico]:checked")];
  const total = selecionados.reduce((acc, i) => acc + parseFloat(i.dataset.price), 0);
  const nomes = selecionados.map((i) => i.value);

  estimate.textContent = brl(total);
  estimateNote.textContent = nomes.length ? nomes.join(" + ") : "Selecione ao menos um serviço";
  return { nomes, total };
}
form.addEventListener("change", calcEstimate);
calcEstimate();

// Botões "Quero este" dos pacotes marcam o pacote no formulário
document.querySelectorAll("[data-package]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const input = form.querySelector(`input[name=servico][value="${btn.dataset.package}"]`);
    if (input) input.checked = true;
    calcEstimate();
    document.getElementById("agendar").scrollIntoView({ behavior: "smooth" });
  })
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const required = [form.nome, form.data];
  required.forEach((f) => f.classList.toggle("invalid", !f.value.trim()));
  const { nomes, total } = calcEstimate();

  if (required.some((f) => !f.value.trim()) || !nomes.length) {
    msg.textContent = "Preencha nome, data e escolha ao menos um serviço ✦";
    msg.className = "form__msg error";
    return;
  }

  const data = new Date(form.data.value + "T12:00").toLocaleDateString("pt-BR");

  const texto = [
    `Olá, Stan & Kais! ✨`,
    `Gostaria de agendar:`,
    `• Nome: ${form.nome.value.trim()}`,
    `• Serviços: ${nomes.join(", ")}`,
    `• Profissional: ${form.profissional.value}`,
    `• Data: ${data} às ${form.hora.value}`,
    `• Estimativa: ${brl(total)}`,
  ].join("\n");

  msg.textContent = "Abrindo o WhatsApp...";
  msg.className = "form__msg ok";
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
});

document.getElementById("wa-float").href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá, Stan & Kais! Gostaria de mais informações.")}`;
document.getElementById("ano").textContent = new Date().getFullYear();
