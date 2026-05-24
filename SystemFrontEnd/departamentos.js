const STORAGE_KEY = "sistema-gestao-funcionarios";
const DEPARTMENTS_KEY = "sistema-gestao-departamentos";
const THEME_KEY = "tema-claro";
const API_URL = "http://localhost:8080/api";

const DEP_META = {
  tecnologia: { icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 5h16v10H4zm2 2v6h12V7zm-2 10h16v2H4z"/></svg>', cor: "#3b82f6", bg: "#dbeafe" },
  design: { icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a9 9 0 0 0-1 17.94V15.5A2.5 2.5 0 0 1 8.5 13 2.5 2.5 0 0 1 6 10.5V10a2 2 0 0 1 2-2h1.5A2.5 2.5 0 0 1 12 5.5 2.5 2.5 0 0 1 14.5 8H15a2 2 0 0 1 0 4h-1a2 2 0 0 0 0 4h4.32A9 9 0 0 0 12 3"/></svg>', cor: "#ec4899", bg: "#fce7f3" },
  marketing: { icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 10v4h3l4 3V7L6 10zm11-3h7v2h-7zm2 5h5v2h-5zm-2 5h7v2h-7z"/></svg>', cor: "#f59e0b", bg: "#fef3c7" },
  financeiro: { icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6zm1 17.93V20h-2v-.07A4 4 0 0 1 8 16h2a2 2 0 1 0 2-2 4 4 0 0 1 0-8V4h2v2a4 4 0 0 1 3 3.87h-2A2 2 0 1 0 12 12a4 4 0 0 1 1 7.93"/></svg>', cor: "#10b981", bg: "#d1fae5" },
  rh: { icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 2c-2.327 0-7 1.17-7 3.5V19h14v-2.5C23 14.17 18.327 13 16 13Zm-8 0c-.29 0-.62.02-.97.058A5.575 5.575 0 0 1 9 16.5V19H1v-2.5C1 14.17 5.673 13 8 13Z"/></svg>', cor: "#8b5cf6", bg: "#ede9fe" },
  suporte: { icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a8 8 0 0 0-8 8v5a3 3 0 0 0 3 3h2v-8H6v-1a6 6 0 0 1 12 0v1h-3v8h2a3 3 0 0 0 3-3v-5a8 8 0 0 0-8-8"/></svg>', cor: "#06b6d4", bg: "#cffafe" },
  vendas: { icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m4 19 5-6 4 3 7-9v12H4z"/></svg>', cor: "#ef4444", bg: "#fee2e2" },
  geral: { icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 21h18v-2H3zm2-4h4V7H5zm5 0h4V3h-4zm5 0h4V10h-4z"/></svg>', cor: "#64748b", bg: "#f1f5f9" }
};

const AVATAR_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6", "#f59e0b"];

let departamentos = [];
let departamentosRenderizados = [];
let funcionarios = [];

function normalizar(texto = "") {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatarNomeDepartamento(nome = "") {
  const limpo = nome.trim().replace(/\s+/g, " ");

  if (!limpo) {
    return "";
  }

  return limpo
    .split(" ")
    .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
    .join(" ");
}

function formatarMoedaKz(valor) {
  return `Kz ${Number(valor || 0).toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function getMeta(nome) {
  return DEP_META[normalizar(nome)] || DEP_META.geral;
}

function carregarDepartamentos() {
  try {
    const data = localStorage.getItem(DEPARTMENTS_KEY);
    departamentos = data ? JSON.parse(data) : [];
  }
  catch {
    departamentos = [];
  }

  departamentos = departamentos
    .map(dep => formatarNomeDepartamento(typeof dep === "string" ? dep : dep?.nome || ""))
    .filter(Boolean)
    .filter((dep, index, lista) =>
      lista.findIndex(item => normalizar(item) === normalizar(dep)) === index
    )
    .sort((a, b) => a.localeCompare(b, "pt"));
}

function salvarDepartamentosStorage() {
  localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departamentos));
}

function carregarFuncionarios() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    funcionarios = data ? JSON.parse(data) : [];
  }
  catch {
    funcionarios = [];
  }

  funcionarios = funcionarios.map(funcionario => ({
    ...funcionario,
    departamento: formatarNomeDepartamento(funcionario.departamento || "Geral"),
    salario: Number(funcionario.salario) || 0
  }));
}

function garantirDepartamentosDosFuncionarios() {
  let alterou = false;

  funcionarios.forEach(funcionario => {
    const nome = formatarNomeDepartamento(funcionario.departamento || "Geral");

    funcionario.departamento = nome;

    if (!departamentos.some(dep => normalizar(dep) === normalizar(nome))) {
      departamentos.push(nome);
      alterou = true;
    }
  });

  if (alterou) {
    departamentos.sort((a, b) => a.localeCompare(b, "pt"));
    salvarDepartamentosStorage();
  }
}

function gerarDepartamentos() {
  const mapa = new Map();

  departamentos.forEach((nome, index) => {
    const meta = getMeta(nome);

    mapa.set(normalizar(nome), {
      id: index + 1,
      nome,
      membros: 0,
      ativos: 0,
      folha: 0,
      funcionarios: [],
      icon: meta.icon,
      cor: meta.cor,
      bg: meta.bg
    });
  });

  funcionarios.forEach(funcionario => {
    const chave = normalizar(funcionario.departamento || "Geral");
    const nomeFormatado = formatarNomeDepartamento(funcionario.departamento || "Geral");

    if (!mapa.has(chave)) {
      const meta = getMeta(nomeFormatado);

      mapa.set(chave, {
        id: mapa.size + 1,
        nome: nomeFormatado,
        membros: 0,
        ativos: 0,
        folha: 0,
        funcionarios: [],
        icon: meta.icon,
        cor: meta.cor,
        bg: meta.bg
      });
    }

    const departamento = mapa.get(chave);
    departamento.funcionarios.push(funcionario);
    departamento.membros += 1;
    departamento.folha += Number(funcionario.salario) || 0;

    if (normalizar(funcionario.status) === "ativo") {
      departamento.ativos += 1;
    }
  });

  return Array.from(mapa.values());
}

function renderDepartamentos(filtro = "") {
  carregarDepartamentos();
  carregarFuncionarios();
  garantirDepartamentosDosFuncionarios();

  departamentosRenderizados = gerarDepartamentos();

  const grid = document.getElementById("deps-grid");
  const empty = document.getElementById("deps-empty");
  const total = document.getElementById("total-deps");

  total.textContent = departamentosRenderizados.length;

  const lista = departamentosRenderizados.filter(dep =>
    normalizar(dep.nome).includes(normalizar(filtro))
  );

  if (!lista.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  grid.innerHTML = lista.map(dep => {
    const porcentagem = dep.membros === 0 ? 0 : Math.min(100, (dep.ativos / dep.membros) * 100);

    return `
      <div class="dep-card" onclick="abrirDetalhes(${dep.id})" style="--dc:${dep.cor}; --db:${dep.bg}">
        <div class="card-top">
          <div class="card-icon-group">
            <div class="card-icon">${dep.icon}</div>
            <div>
              <div class="card-name">${dep.nome}</div>
              <div class="card-sub">Departamento criado pelo admin</div>
            </div>
          </div>

          <div class="card-status-badge">
            ${dep.ativos}/${dep.membros}
          </div>
        </div>

        <div class="card-progress-row">
          <span class="card-progress-label">Folha do departamento</span>
          <span class="card-progress-value">${formatarMoedaKz(dep.folha)}</span>
        </div>

        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${porcentagem}%"></div>
        </div>

        <div class="card-footer">
          <div class="avatares-stack">
            ${dep.funcionarios.slice(0, 4).map((funcionario, index) => {
              const iniciais = (funcionario.nome || "SN")
                .split(" ")
                .slice(0, 2)
                .map(parte => parte[0])
                .join("")
                .toUpperCase();

              return `
                <div class="av" style="background:${AVATAR_COLORS[index % AVATAR_COLORS.length]}">
                  ${iniciais}
                </div>
              `;
            }).join("")}
          </div>

          <span class="card-members-label">${dep.membros} membros</span>
        </div>
      </div>
    `;
  }).join("");
}

function abrirDetalhes(id) {
  const departamento = departamentosRenderizados.find(item => item.id === id);

  if (!departamento) {
    return;
  }

  const modalIcon = document.getElementById("md-icon");
  modalIcon.innerHTML = departamento.icon;
  modalIcon.style.background = departamento.bg;
  modalIcon.style.color = departamento.cor;

  document.getElementById("md-title").textContent = departamento.nome;
  document.getElementById("md-subtitle").textContent = `${departamento.membros} membros`;

  document.getElementById("md-stats").innerHTML = `
    <div class="detail-stat">
      <div class="detail-stat-value">${departamento.membros}</div>
      <div class="detail-stat-label">Total</div>
    </div>

    <div class="detail-stat">
      <div class="detail-stat-value" style="color:#10b981">${departamento.ativos}</div>
      <div class="detail-stat-label">Ativos</div>
    </div>

    <div class="detail-stat">
      <div class="detail-stat-value">${formatarMoedaKz(departamento.folha)}</div>
      <div class="detail-stat-label">Folha</div>
    </div>
  `;

  document.getElementById("md-members").innerHTML =
    departamento.funcionarios.length === 0
      ? `
        <div class="member-row empty-members">
          <div>
            <div class="member-name">Sem funcionarios ainda</div>
            <div class="member-role">Esse departamento ja pode ser escolhido no cadastro.</div>
          </div>
        </div>
      `
      : departamento.funcionarios.map((funcionario, index) => {
          const iniciais = (funcionario.nome || "SN")
            .split(" ")
            .slice(0, 2)
            .map(parte => parte[0])
            .join("")
            .toUpperCase();

          return `
            <div class="member-row">
              <div class="member-av" style="background:${AVATAR_COLORS[index % AVATAR_COLORS.length]}">
                ${iniciais}
              </div>

              <div>
                <div class="member-name">${funcionario.nome}</div>
                <div class="member-role">
                  ${funcionario.cargo || "Sem cargo"} • ${formatarMoedaKz(funcionario.salario)}
                </div>
              </div>
            </div>
          `;
        }).join("");

  document.getElementById("modal-detail-overlay").classList.add("open");
}

function fecharModalDetalhes() {
  document.getElementById("modal-detail-overlay").classList.remove("open");
}

function abrirModalDepartamento() {
  document.getElementById("department-name").value = "";
  document.getElementById("department-modal-overlay").classList.add("open");
  document.getElementById("department-name").focus();
}

function fecharModalDepartamento(event) {
  if (event && event.target !== document.getElementById("department-modal-overlay")) {
    return;
  }

  document.getElementById("department-modal-overlay").classList.remove("open");
}

function salvarDepartamento() {
  carregarDepartamentos();

  const campo = document.getElementById("department-name");
  const nomeFormatado = formatarNomeDepartamento(campo.value);

  if (!nomeFormatado) {
    alert("Digite o nome do departamento.");
    return;
  }

  const existe = departamentos.some(dep => normalizar(dep) === normalizar(nomeFormatado));

  if (existe) {
    alert("Esse departamento ja existe, mesmo com letras maiusculas ou minusculas diferentes.");
    return;
  }

  departamentos.push(nomeFormatado);
  departamentos.sort((a, b) => a.localeCompare(b, "pt"));
  salvarDepartamentosStorage();
  fecharModalDepartamento();
  renderDepartamentos(document.getElementById("search-input").value);
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarTema();
  renderDepartamentos();

  const busca = document.getElementById("search-input");

  busca.addEventListener("input", event => {
    renderDepartamentos(event.target.value);
  });

  document.getElementById("btn-close-detail").addEventListener("click", fecharModalDetalhes);
  document.getElementById("btn-close-detail2").addEventListener("click", fecharModalDetalhes);

  document.getElementById("modal-detail-overlay").addEventListener("click", event => {
    if (event.target.id === "modal-detail-overlay") {
      fecharModalDetalhes();
    }
  });
});

function iniciarTema() {
  const toggle = document.getElementById("theme-toggle");

  carregarTema();

  if (toggle) {
    toggle.addEventListener("click", trocarTema);
    atualizarEstadoToggle();
  }
}

function trocarTema() {
  document.body.classList.toggle("light-mode");
  localStorage.setItem(THEME_KEY, String(document.body.classList.contains("light-mode")));
  atualizarEstadoToggle();
}

function carregarTema() {
  if (localStorage.getItem(THEME_KEY) === "true") {
    document.body.classList.add("light-mode");
  }

  atualizarEstadoToggle();
}

function atualizarEstadoToggle() {
  const toggle = document.getElementById("theme-toggle");

  if (!toggle) {
    return;
  }

  toggle.setAttribute("aria-pressed", String(document.body.classList.contains("light-mode")));
}
