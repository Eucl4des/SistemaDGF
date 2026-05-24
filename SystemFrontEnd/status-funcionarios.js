const STORAGE_KEY = "sistema-gestao-funcionarios";
const THEME_KEY = "tema-claro";
const API_URL = "http://localhost:8080/api";

let funcionarios = [];

document.addEventListener("DOMContentLoaded", () => {
    iniciarTema();
    carregarFuncionarios();
    renderizarStatusFuncionarios();

    document.getElementById("busca-status")?.addEventListener("input", filtrarStatusFuncionarios);
});

async function carregarFuncionarios() {
     try {
        const res = await fetch(`${API_URL}/functionaries`);
        // A API devolve FunctionaryDTO — mapear campos para o que o HTML espera
        const dados = await res.json();
        funcionarios = dados.map(f => ({
            id: f.id,
            nome: f.name,              // API usa "name", JS usava "nome"
            email: f.email,
            departamento: f.department, // API usa "department", JS usava "departamento"
            status: f.status,
            cargo: f.jobTitle,
            salario: f.totalSalary
        }));
        renderizarStatusFuncionarios();
    } catch (err) {
        console.error("Erro ao carregar funcionários:", err);
        alert("Erro ao carregar funcionários.");
    }
}

function renderizarStatusFuncionarios(lista = funcionarios) {
    const tabela = document.getElementById("tabela-status-funcionarios");
    const vazio = document.getElementById("status-vazio");

    if (!tabela) {
        return;
    }

    if (lista.length === 0) {
        tabela.innerHTML = "";

        if (vazio) {
            vazio.style.display = "block";
        }

        return;
    }

    if (vazio) {
        vazio.style.display = "none";
    }

    tabela.innerHTML = lista.map(funcionario => {
        const iniciais = obterIniciais(funcionario.nome || "Funcionário");
        const status = funcionario.status || "Ativo";
        const motivo = funcionario.statusMotivo || "Sem motivo informado.";
        const badgeClass = status === "Desativo"
            ? "badge-inactive"
            : status === "Licença" || status === "Licenca"
                ? "badge-leave"
                : "badge-active";

        return `
            <tr>
                <td>${funcionario.id || "-"}</td>
                <td>
                    <div class="table-user">
                        <div class="avatar-sm">${iniciais}</div>
                        <div>
                            <span class="user-name">${escaparHtml(funcionario.nome || "Sem nome")}</span>
                            <span class="user-email">${escaparHtml(funcionario.email || "Sem e-mail")}</span>
                        </div>
                    </div>
                </td>
                <td>${escaparHtml(funcionario.departamento || "Geral")}</td>
                <td>
                    <span class="status-badge ${badgeClass}">${escaparHtml(status)}</span>
                </td>
                <td>${escaparHtml(motivo)}</td>
            </tr>
        `;
    }).join("");
}

function filtrarStatusFuncionarios(event) {
    const termo = normalizarTexto(event.target.value);

    if (!termo) {
        renderizarStatusFuncionarios();
        return;
    }

    renderizarStatusFuncionarios(
        funcionarios.filter(funcionario =>
            normalizarTexto(funcionario.nome || "").includes(termo) ||
            normalizarTexto(funcionario.departamento || "").includes(termo) ||
            normalizarTexto(funcionario.status || "").includes(termo) ||
            normalizarTexto(funcionario.statusMotivo || "").includes(termo)
        )
    );
}

function obterIniciais(nome) {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0])
        .join("")
        .toUpperCase();
}

function normalizarTexto(texto = "") {
    return texto
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function escaparHtml(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

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
