const EVENTOS_KEY = "sistema-gestao-eventos";
const THEME_KEY = "tema-claro";
const API_URL = "http://localhost:8080/api";

let eventos = [];
let eventoEditandoId = null;

window.addEventListener("DOMContentLoaded", () => {
    iniciarTema();
    carregarEventos();
    renderizarEventosAdmin();

    document.getElementById("salvarEvento")?.addEventListener("click", salvarEvento);
    document.getElementById("limparEvento")?.addEventListener("click", limparFormEvento);
    document.getElementById("buscaEvento")?.addEventListener("input", filtrarEventos);
    document.getElementById("eventoImagem")?.addEventListener("change", atualizarNomeArquivoEvento);
    atualizarNomeArquivoEvento();
});

function carregarEventos() {
    eventos = JSON.parse(localStorage.getItem(EVENTOS_KEY) || "[]")
        .map(evento => ({
            ...evento,
            comentarios: Array.isArray(evento.comentarios) ? evento.comentarios : []
        }))
        .sort((a, b) => obterTimestampData(a.data) - obterTimestampData(b.data));
}

function salvarEventosStorage() {
    localStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
}

function renderizarEventosAdmin(lista = eventos) {
    const container = document.getElementById("lista-eventos-admin");
    if (!container) return;

    if (lista.length === 0) {
        container.innerHTML = '<div class="vazio-eventos">Nenhum evento cadastrado no momento.</div>';
        return;
    }

    container.innerHTML = lista.map(evento => {
        const comentarios = Array.isArray(evento.comentarios) ? evento.comentarios : [];
        return `
            <article class="evento-admin-card">
                ${evento.imagem ? `<img class="evento-admin-imagem" src="${evento.imagem}" alt="${escaparHtml(evento.titulo)}">` : ""}
                <div class="evento-admin-conteudo">
                    <div class="evento-admin-topo">
                        <div class="evento-admin-meta">
                            <span>${formatarDataEvento(evento.data)}</span>
                            <span>${comentarios.length} comentário${comentarios.length === 1 ? "" : "s"}</span>
                        </div>
                        <div class="evento-admin-acoes">
                            <button class="btn-edit" onclick="editarEvento(${evento.id})">Editar</button>
                            <button class="btn-delete" onclick="deletarEvento(${evento.id})">Excluir</button>
                        </div>
                    </div>
                    <h3>${escaparHtml(evento.titulo)}</h3>
                    <p>${escaparHtml(evento.descricao).replace(/\n/g, "<br>")}</p>
                </div>
            </article>
        `;
    }).join("");
}

async function salvarEvento() {
    const titulo = document.getElementById("eventoTitulo")?.value.trim();
    const dataDigitada = document.getElementById("eventoData")?.value.trim();
    const descricao = document.getElementById("eventoDescricao")?.value.trim();
    const imagemInput = document.getElementById("eventoImagem");

    if (!titulo || !dataDigitada || !descricao) {
        alert("Preencha titulo, data e descricao do evento.");
        return;
    }

    const data = normalizarDataEvento(dataDigitada);

    if (!data) {
        alert("Digite uma data valida no formato dd/mm/aaaa ou aaaa-mm-dd.");
        return;
    }

    let imagem = "";
    const eventoExistente = eventoEditandoId ? eventos.find(item => item.id === eventoEditandoId) : null;

    if (imagemInput?.files?.[0]) {
        imagem = await converterArquivoParaDataUrl(imagemInput.files[0]);
    }
    else if (eventoExistente?.imagem) {
        imagem = eventoExistente.imagem;
    }

    if (eventoEditandoId && eventoExistente) {
        eventoExistente.titulo = titulo;
        eventoExistente.data = data;
        eventoExistente.descricao = descricao;
        eventoExistente.imagem = imagem;
        eventoEditandoId = null;
    }
    else {
        eventos.unshift({
            id: `evt-${Date.now()}`,
            titulo,
            data,
            descricao,
            imagem,
            comentarios: []
        });
    }

    eventos.sort((a, b) => obterTimestampData(a.data) - obterTimestampData(b.data));
    salvarEventosStorage();
    renderizarEventosAdmin();
    limparFormEvento();
}

function limparFormEvento() {
    const titulo = document.getElementById("eventoTitulo");
    const data = document.getElementById("eventoData");
    const descricao = document.getElementById("eventoDescricao");
    const imagem = document.getElementById("eventoImagem");

    if (titulo) titulo.value = "";
    if (data) data.value = "";
    if (descricao) descricao.value = "";
    if (imagem) imagem.value = "";

    eventoEditandoId = null;
    document.getElementById("salvarEvento").textContent = "Salvar Evento";
    atualizarNomeArquivoEvento();
}

function editarEvento(id) {
    const evento = eventos.find(item => item.id === id);

    if (!evento) {
        return;
    }

    document.getElementById("eventoTitulo").value = evento.titulo;
    document.getElementById("eventoData").value = formatarDataDigitavel(evento.data);
    document.getElementById("eventoDescricao").value = evento.descricao;
    document.getElementById("eventoImagem").value = "";
    eventoEditandoId = id;
    document.getElementById("salvarEvento").textContent = "Atualizar Evento";
    atualizarNomeArquivoEvento("Imagem atual mantida ate escolher outra");
}

function deletarEvento(id) {
    if (!confirm("Deseja realmente excluir este evento?")) {
        return;
    }

    eventos = eventos.filter(item => item.id !== id);
    salvarEventosStorage();
    renderizarEventosAdmin();
    limparFormEvento();
}

function filtrarEventos(event) {
    const termo = event.target.value.trim().toLowerCase();

    if (!termo) {
        renderizarEventosAdmin();
        return;
    }

    renderizarEventosAdmin(
        eventos.filter(item =>
            item.titulo.toLowerCase().includes(termo) ||
            item.descricao.toLowerCase().includes(termo)
        )
    );
}

function converterArquivoParaDataUrl(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = reject;
        leitor.readAsDataURL(arquivo);
    });
}

function formatarDataEvento(data) {
    if (!data) {
        return "Sem data";
    }

    return new Date(`${normalizarDataEvento(data)}T00:00:00`).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

function formatarDataDigitavel(data) {
    const normalizada = normalizarDataEvento(data);

    if (!normalizada) {
        return "";
    }

    const [ano, mes, dia] = normalizada.split("-");
    return `${dia}/${mes}/${ano}`;
}

function normalizarDataEvento(valor) {
    const texto = String(valor || "").trim();

    if (!texto) {
        return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        return texto;
    }

    const partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (!partes) {
        return "";
    }

    const [, dia, mes, ano] = partes;
    const data = new Date(`${ano}-${mes}-${dia}T00:00:00`);

    if (
        Number.isNaN(data.getTime()) ||
        data.getDate() !== Number(dia) ||
        data.getMonth() + 1 !== Number(mes) ||
        data.getFullYear() !== Number(ano)
    ) {
        return "";
    }

    return `${ano}-${mes}-${dia}`;
}

function obterTimestampData(data) {
    const normalizada = normalizarDataEvento(data);
    return normalizada ? new Date(`${normalizada}T00:00:00`).getTime() : 0;
}

function escaparHtml(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function atualizarNomeArquivoEvento(textoManual = "") {
    const input = document.getElementById("eventoImagem");
    const nome = document.getElementById("eventoImagemNome");

    if (!nome) {
        return;
    }

    if (textoManual) {
        nome.textContent = textoManual;
        return;
    }

    const arquivo = input?.files?.[0];
    nome.textContent = arquivo ? arquivo.name : "Nenhum arquivo selecionado";
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
