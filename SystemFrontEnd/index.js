const DEPARTMENTS_KEY = "sistema-gestao-departamentos";
const THEME_KEY = "tema-claro";
const API_URL = "http://localhost:8080/api";

let funcionarios = [];
let departamentos = [];
let modoEdicao = null;
let dataCalendarioAdmin = new Date();

document.addEventListener("DOMContentLoaded", () => {
    iniciarTema();

    if (!document.getElementById("tabela-funcionarios")) {
        return;
    }

    carregarTudo();
    iniciarCalendarioAdmin();

    const buscaInput = document.getElementById("input-busca");
    if (buscaInput) {
        buscaInput.addEventListener("input", filtrarFuncionarios);
    }
});

// ==========================================
// CARREGAR DADOS DA API
// ==========================================

async function carregarTudo() {
    await carregarFuncionarios();
    carregarDepartamentos();
    popularSelectDepartamentos();
}

async function carregarFuncionarios() {
    try {
        const res = await fetch(`${API_URL}/functionaries`);
        if (!res.ok) throw new Error("Erro ao carregar funcionários");
        const dados = await res.json();
        funcionarios = dados.map(f => ({
            id: f.id,
            nome: f.name,
            email: f.email || "email@empresa.com",
            cargo: f.jobTitle || "Não definido",
            departamento: f.department || "Geral",
            salario: f.totalSalary || f.baseSalary || 0,
            baseSalario: f.baseSalary || 0,
            status: f.status || "Ativo",
            bi: f.bi || ""
        }));
        renderizarTabelaFuncionarios();
        atualizarEstatisticas();
    } catch (err) {
        console.error("Erro ao carregar funcionários:", err);
        alert("Erro ao carregar funcionários. Verifique se o servidor está ativo.");
        funcionarios = [];
    }
}

// ==========================================
// DEPARTAMENTOS (ainda em localStorage até ter API própria)
// ==========================================

function carregarDepartamentos() {
    try {
        const dados = localStorage.getItem(DEPARTMENTS_KEY);
        departamentos = dados ? JSON.parse(dados) : [];
    } catch {
        departamentos = [];
    }

    departamentos = departamentos
        .map(dep => formatarNomeDepartamento(typeof dep === "string" ? dep : dep?.nome || ""))
        .filter(Boolean)
        .filter((dep, i, lista) =>
            lista.findIndex(item => normalizarTexto(item) === normalizarTexto(dep)) === i
        );
}

function salvarDepartamentos() {
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departamentos));
}

// ==========================================
// MODAL — ABRIR / FECHAR
// ==========================================

function abrirModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) {
        overlay.classList.add("open");
    }
}

function fecharModal(event) {
    const overlay = document.getElementById("modal-overlay");
    if (!overlay) return;

    // Se chamado por clique no overlay, só fecha se clicou no fundo
    if (event && event.target !== overlay) return;

    overlay.classList.remove("open");
    limparModal();
    modoEdicao = null;
}

function limparModal() {
    atualizarTexto("modal-titulo", "Novo Funcionário");
    const campos = ["modal-id", "modal-nome", "modal-email", "modal-cargo", "modal-salario", "modal-ajuste"];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    popularSelectDepartamentos();

    const statusAtivo = document.querySelector('input[name="modal-status"][value="Ativo"]');
    if (statusAtivo) statusAtivo.checked = true;
}

// ==========================================
// ADICIONAR FUNCIONÁRIO — abre o modal
// ==========================================

function adicionarFuncionario() {
    carregarDepartamentos();

    if (departamentos.length === 0) {
        alert("Crie um departamento primeiro na página de Departamentos.");
        window.location.href = "departamentos.html";
        return;
    }

    modoEdicao = null;
    limparModal();
    abrirModal();
}

// ==========================================
// EDITAR FUNCIONÁRIO
// ==========================================

function editarFuncionario(id) {
    carregarDepartamentos();

    const funcionario = funcionarios.find(item => item.id === id);
    if (!funcionario) return;

    modoEdicao = id;

    atualizarTexto("modal-titulo", "Editar Funcionário");
    document.getElementById("modal-id").value = funcionario.id;
    document.getElementById("modal-nome").value = funcionario.nome;
    document.getElementById("modal-email").value = funcionario.email;
    document.getElementById("modal-cargo").value = funcionario.cargo;
    document.getElementById("modal-salario").value = funcionario.baseSalario;
    document.getElementById("modal-ajuste").value = funcionario.ajusteSalarial || "";
    popularSelectDepartamentos(funcionario.departamento);

    const statusSelecionado = document.querySelector(
        `input[name="modal-status"][value="${funcionario.status}"]`
    );
    if (statusSelecionado) statusSelecionado.checked = true;

    abrirModal();
}

// ==========================================
// SALVAR MODAL (criar ou editar) — ASYNC
// ==========================================

async function salvarModal() {
    carregarDepartamentos();

    const nome = document.getElementById("modal-nome")?.value.trim();
    const email = document.getElementById("modal-email")?.value.trim();
    const cargo = document.getElementById("modal-cargo")?.value.trim();
    const departamento = formatarNomeDepartamento(
        document.getElementById("modal-departamento")?.value || ""
    );
    const salario = parseSalario(document.getElementById("modal-salario")?.value);
    const status = document.querySelector('input[name="modal-status"]:checked')?.value || "Ativo";

    if (!nome) {
        alert("Digite o nome do funcionário.");
        return;
    }

    if (!departamento) {
        alert("Selecione um departamento válido.");
        return;
    }

    const corpo = {
        name: nome,
        email: email || "email@empresa.com",
        jobTitle: cargo || "Não definido",
        department: departamento,
        baseSalary: salario,
        status: status,
        bi: modoEdicao
            ? (funcionarios.find(f => f.id === modoEdicao)?.bi || "TEMP-" + Date.now())
            : "TEMP-" + Date.now()
    };

    try {
        let res;

        if (modoEdicao) {
            // Editar funcionário existente
            res = await fetch(`${API_URL}/functionaries/${modoEdicao}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(corpo)
            });
        } else {
            // Criar novo funcionário
            res = await fetch(`${API_URL}/functionaries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(corpo)
            });
        }

        if (res.ok) {
            alert(modoEdicao ? "Funcionário atualizado com sucesso!" : "Funcionário criado com sucesso!");
            await carregarFuncionarios(); // recarregar da API
            fecharModal();
        } else {
            const erro = await res.text();
            alert("Erro ao salvar: " + erro);
        }
    } catch (err) {
        console.error("Erro ao salvar funcionário:", err);
        alert("Erro de ligação ao servidor.");
    }
}

// ==========================================
// REMOVER FUNCIONÁRIO
// ==========================================

async function removerFuncionario(id) {
    if (!confirm("Deseja remover este funcionário?")) return;

    try {
        const res = await fetch(`${API_URL}/functionaries/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            await carregarFuncionarios();
        } else {
            const erro = await res.text();
            alert("Erro ao remover: " + erro);
        }
    } catch (err) {
        console.error("Erro ao remover funcionário:", err);
        alert("Erro de ligação ao servidor.");
    }
}

// ==========================================
// RENDERIZAR TABELA
// ==========================================

function renderizarTabelaFuncionarios(lista = funcionarios) {
    const tabela = document.getElementById("tabela-funcionarios");
    const tabelaVazia = document.getElementById("tabela-vazia");

    if (!tabela) return;

    if (lista.length === 0) {
        tabela.innerHTML = "";
        if (tabelaVazia) tabelaVazia.style.display = "block";
        return;
    }

    if (tabelaVazia) tabelaVazia.style.display = "none";

    tabela.innerHTML = lista.map(funcionario => {
        const iniciais = (funcionario.nome || "??")
            .split(" ")
            .slice(0, 2)
            .map(p => p[0])
            .join("")
            .toUpperCase();

        let badgeClass = "badge-active";
        const statusNorm = normalizarTexto(funcionario.status || "");
        if (statusNorm === "desativo") badgeClass = "badge-inactive";
        else if (statusNorm === "licenca" || statusNorm === "licença") badgeClass = "badge-leave";

        return `
            <tr>
                <td>${funcionario.id}</td>
                <td>
                    <div class="table-user">
                        <div class="avatar-sm">${iniciais}</div>
                        <div>
                            <span class="user-name">${escaparHtml(funcionario.nome)}</span>
                            <span class="user-email">${escaparHtml(funcionario.email)}</span>
                        </div>
                    </div>
                </td>
                <td>${escaparHtml(funcionario.cargo)}</td>
                <td>${escaparHtml(funcionario.departamento)}</td>
                <td class="salary-cell">${formatarMoedaKz(parseSalario(funcionario.salario))}</td>
                <td>
                    <span class="status-badge ${badgeClass}">${escaparHtml(funcionario.status)}</span>
                </td>
                <td class="text-center">
                    <div class="table-actions">
                        <button class="btn-action edit" type="button"
                            onclick="editarFuncionario(${funcionario.id})"
                            aria-label="Editar funcionário">
                            <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zm17.71-10.04a1 1 0 0 0 0-1.41L18.2 3.29a1 1 0 0 0-1.41 0l-1.96 1.96 3.75 3.75z"/>
                            </svg>
                        </button>
                        <button class="btn-action delete" type="button"
                            onclick="removerFuncionario(${funcionario.id})"
                            aria-label="Remover funcionário">
                            <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M9 3h6l1 2h5v2H3V5h5zm1 6h2v8h-2zm4 0h2v8h-2zM6 9h2v8H6zm1 12a2 2 0 0 1-2-2V8h14v11a2 2 0 0 1-2 2z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// ESTATÍSTICAS
// ==========================================

function atualizarEstatisticas() {
    let ativos = 0, desativos = 0, licenca = 0, folhaSalarial = 0;

    funcionarios.forEach(f => {
        const status = normalizarTexto(f.status || "");
        if (status === "ativo") ativos++;
        else if (status === "desativo") desativos++;
        else licenca++;
        folhaSalarial += parseSalario(f.salario);
    });

    atualizarTexto("qtd-ativos", ativos);
    atualizarTexto("qtd-desativos", desativos);
    atualizarTexto("qtd-licenca", licenca);
    atualizarTexto("qtd-total-funcionarios", funcionarios.length);
    atualizarTexto("folha-total", formatarMoedaKz(folhaSalarial));
    atualizarTexto("despesa-total", formatarMoedaKz(folhaSalarial));
    atualizarGraficosStatus({ ativos, desativos, licenca, total: funcionarios.length });
}

function atualizarGraficosStatus({ ativos, desativos, licenca, total }) {
    const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;
    atualizarTexto("pct-ativos", `${pct(ativos)}%`);
    atualizarTexto("pct-desativos", `${pct(desativos)}%`);
    atualizarTexto("pct-licenca", `${pct(licenca)}%`);
    atualizarProgressoGrafico("grafico-ativos", pct(ativos));
    atualizarProgressoGrafico("grafico-desativos", pct(desativos));
    atualizarProgressoGrafico("grafico-licenca", pct(licenca));
}

function atualizarProgressoGrafico(id, percentual) {
    const el = document.getElementById(id);
    if (el) el.style.setProperty("--percent", `${percentual}%`);
}

// ==========================================
// FILTRAR
// ==========================================

function filtrarFuncionarios(event) {
    const termo = normalizarTexto(event.target.value);
    const filtrados = funcionarios.filter(f =>
        normalizarTexto(f.nome).includes(termo) ||
        normalizarTexto(f.cargo).includes(termo) ||
        normalizarTexto(f.departamento).includes(termo) ||
        String(f.id).includes(termo)
    );
    renderizarTabelaFuncionarios(filtrados);
}

// ==========================================
// SELECT DEPARTAMENTOS
// ==========================================

function popularSelectDepartamentos(valorSelecionado = "") {
    const select = document.getElementById("modal-departamento");
    if (!select) return;

    if (departamentos.length === 0) {
        select.innerHTML = '<option value="">Crie um departamento primeiro</option>';
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.innerHTML = departamentos
        .map(dep => `<option value="${dep}">${dep}</option>`)
        .join("");

    if (valorSelecionado) {
        const encontrado = departamentos.find(dep =>
            normalizarTexto(dep) === normalizarTexto(valorSelecionado)
        );
        select.value = encontrado || departamentos[0];
    } else {
        select.value = departamentos[0];
    }
}

// ==========================================
// UTILITÁRIOS
// ==========================================

function normalizarTexto(texto = "") {
    return texto.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatarNomeDepartamento(nome = "") {
    const limpo = nome.trim().replace(/\s+/g, " ");
    if (!limpo) return "";
    return limpo.split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ");
}

function parseSalario(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}

function formatarMoedaKz(valor) {
    return `Kz ${valor.toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function atualizarTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
}

function escaparHtml(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// ==========================================
// TEMA
// ==========================================

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
    if (toggle) {
        toggle.setAttribute("aria-pressed", String(document.body.classList.contains("light-mode")));
    }
}

// ==========================================
// CALENDÁRIO
// ==========================================

function iniciarCalendarioAdmin() {
    document.getElementById("admin-calendario-anterior")?.addEventListener("click", () => {
        dataCalendarioAdmin = new Date(
            dataCalendarioAdmin.getFullYear(),
            dataCalendarioAdmin.getMonth() - 1, 1
        );
        renderizarCalendarioAdmin();
    });

    document.getElementById("admin-calendario-proximo")?.addEventListener("click", () => {
        dataCalendarioAdmin = new Date(
            dataCalendarioAdmin.getFullYear(),
            dataCalendarioAdmin.getMonth() + 1, 1
        );
        renderizarCalendarioAdmin();
    });

    dataCalendarioAdmin = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    renderizarCalendarioAdmin();
}

function renderizarCalendarioAdmin() {
    const titulo = document.getElementById("admin-calendario-mes");
    const grade = document.getElementById("admin-calendario-grade");
    if (!titulo || !grade) return;

    const ano = dataCalendarioAdmin.getFullYear();
    const mes = dataCalendarioAdmin.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const deslocamento = (primeiroDia.getDay() + 6) % 7;
    const hoje = new Date();

    titulo.textContent = primeiroDia.toLocaleDateString("pt-PT", {
        month: "long", year: "numeric"
    });

    const dias = [];
    for (let i = 0; i < deslocamento; i++) dias.push('<div class="calendar-day empty"></div>');
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const ehHoje = hoje.getDate() === dia && hoje.getMonth() === mes && hoje.getFullYear() === ano;
        dias.push(`<div class="calendar-day${ehHoje ? " today" : ""}">${dia}</div>`);
    }

    grade.innerHTML = dias.join("");
}