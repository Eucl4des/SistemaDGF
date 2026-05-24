const RELATORIOS_KEY = "sistema-gestao-relatorios";
const THEME_KEY = "tema-claro";
const API_URL = "http://localhost:8080/api";

let relatorios = [];
let relatorioEditandoId = null;

window.addEventListener("DOMContentLoaded", () => {
    iniciarTema();
    carregarRelatorios();

    document.getElementById("salvarRelatorio")?.addEventListener("click", salvarRelatorio);
    document.getElementById("limparRelatorio")?.addEventListener("click", limparFormRelatorio);
    document.getElementById("buscaRelatorio")?.addEventListener("input", filtrarRelatorios);
});

async function carregarRelatorios() {
    try {
        const res = await fetch(`${API_URL}/relatorios`);
        relatorios = await res.json();
        renderizarRelatorios();
    } catch (err) {
        console.error("Erro ao carregar relatórios:", err);
        alert("Erro ao carregar relatórios. Verifique se o servidor está ativo.");
    }
}

async function salvarRelatorio() {
    const titulo = document.getElementById("relatorioTitulo")?.value.trim();
    const conteudo = document.getElementById("relatorioConteudo")?.value.trim();

    if (!titulo || !conteudo) {
        alert("Preencha o título e o conteúdo do relatório.");
        return;
    }

    const dataHora = new Date().toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });

    const corpo = { titulo, texto: conteudo, dataHora };

    try {
        if (relatorioEditandoId) {
            await fetch(`${API_URL}/relatorios/${relatorioEditandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(corpo)
            });
            relatorioEditandoId = null;
        } else {
            await fetch(`${API_URL}/relatorios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(corpo)
            });
        }

        await carregarRelatorios();
        limparFormRelatorio();
    } catch (err) {
        console.error("Erro ao salvar relatório:", err);
        alert("Erro ao salvar relatório.");
    }
}

async function deletarRelatorio(id) {
    if (!confirm("Deseja realmente excluir este relatório?")) return;

    try {
        await fetch(`${API_URL}/relatorios/${id}`, { method: "DELETE" });
        await carregarRelatorios();
    } catch (err) {
        console.error("Erro ao excluir relatório:", err);
        alert("Erro ao excluir relatório.");
    }
}

function editarRelatorio(id) {
    // id aqui é número (Long do Java), não string como era antes
    const relatorio = relatorios.find(item => item.id === id);
    if (!relatorio) return;

    document.getElementById("relatorioTitulo").value = relatorio.titulo;
    document.getElementById("relatorioConteudo").value = relatorio.texto;
    relatorioEditandoId = id;
}

function renderizarRelatorios(lista = relatorios) {
    const tabela = document.getElementById("relatoriosTable");
    if (!tabela) return;

    tabela.innerHTML = lista.map(rel => `
        <tr>
            <td>${escaparHtml(rel.titulo)}</td>
            <td>${escaparHtml(rel.dataHora)}</td>
            <td>${escaparHtml(rel.texto).replace(/\n/g, "<br>")}</td>
            <td class="text-center">
                <div class="report-actions">
                    <button class="btn-edit" type="button" onclick="editarRelatorio(${rel.id})">Editar</button>
                    <button class="btn-delete" type="button" onclick="deletarRelatorio(${rel.id})">Excluir</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function limparFormRelatorio() {
    const titulo = document.getElementById("relatorioTitulo");
    const conteudo = document.getElementById("relatorioConteudo");
    if (titulo) titulo.value = "";
    if (conteudo) conteudo.value = "";
    relatorioEditandoId = null;
}

function filtrarRelatorios(event) {
    const termo = event.target.value.trim().toLowerCase();
    if (!termo) {
        renderizarRelatorios();
        return;
    }
    renderizarRelatorios(
        relatorios.filter(item =>
            item.titulo.toLowerCase().includes(termo) ||
            item.texto.toLowerCase().includes(termo)
        )
    );
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
