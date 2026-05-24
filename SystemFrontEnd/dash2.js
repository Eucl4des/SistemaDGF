const STORAGE_KEY = "sistema-gestao-funcionarios";
const EVENTOS_KEY = "sistema-gestao-eventos";
const THEME_KEY = "tema-claro";
const API_URL = "http://localhost:8080/api";

let funcionarioAtual = null;

document.addEventListener("DOMContentLoaded", iniciarDashboard);

async function iniciarDashboard() {
    iniciarTema();

   const logado = JSON.parse(localStorage.getItem("funcionarioLogado") || "null");
    if (!logado) {
        alert("Faça login primeiro.");
        window.location.href = "login.html";
        return;
    }

    // Buscar dados actualizados da API
    try {
        const res = await fetch(`${API_URL}/functionaries/${logado.id}`);
        if (!res.ok) throw new Error("Funcionário não encontrado");
        const dto = await res.json();

        // Mapear DTO da API para o formato que o dash usa
        funcionarioAtual = {
            id: dto.id,
            nome: dto.name,
            email: dto.email,
            departamento: dto.department,
            cargo: dto.jobTitle,
            status: dto.status,
            salario: dto.totalSalary
        };

        localStorage.setItem("funcionarioLogado", JSON.stringify(funcionarioAtual));
    } catch (err) {
        console.error("Erro ao buscar funcionário:", err);
        funcionarioAtual = logado; // fallback para dados locais
    }

    preencherDados(funcionarioAtual);
    await renderizarEventosFuncionario();
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
    const claro = localStorage.getItem(THEME_KEY) === "true";

    if (claro) {
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

function preencherDados(funcionario) {
    const iniciais = obterIniciais(funcionario.nome || "Funcionário");

    atualizarTexto("titulo-pagina", `Bem-vindo, ${funcionario.nome}`);
    atualizarTexto("funcionario-departamento", funcionario.departamento || "Geral");
    atualizarTexto("funcionario-salario", formatarMoedaKz(funcionario.salario || 0));
    atualizarTexto("funcionario-salario-card", formatarMoedaKz(funcionario.salario || 0));
    atualizarTexto("funcionario-status-card", funcionario.status || "Ativo");
    atualizarTexto("sidebar-nome", funcionario.nome);
    atualizarTexto("sidebar-cargo", funcionario.cargo || "Sem cargo");
    atualizarTexto("sidebar-avatar", iniciais);

    const selecaoStatus = document.getElementById("status-selecao");
    const inputMotivo = document.getElementById("status-motivo");

    if (selecaoStatus) {
        selecaoStatus.value = funcionario.status || "Ativo";
    }

    if (inputMotivo) {
        inputMotivo.value = funcionario.statusMotivo || "";
    }

    atualizarStatus(funcionario.status || "Ativo", funcionario.statusMotivo || "");
}

function atualizarStatus(status, motivo = "") {
    const badge = document.getElementById("status-badge");
    const motivoAtual = document.getElementById("status-motivo-atual");

    if (badge) {
        badge.textContent = status;
        badge.classList.remove("status-ativo", "status-desativo", "status-licenca");

        if (status === "Ativo") {
            badge.classList.add("status-ativo");
        } else if (status === "Desativo") {
            badge.classList.add("status-desativo");
        } else {
            badge.classList.add("status-licenca");
        }
    }

    atualizarTexto("funcionario-status-card", status);

    if (motivoAtual) {
        motivoAtual.textContent = motivo ? `Motivo: ${motivo}` : "Sem motivo informado.";
    }
}

function trocarAba(nome) {
    const secoes = ["dashboard", "ponto", "recibos", "ferias"];

    secoes.forEach(secao => {
        document.getElementById(`secao-${secao}`)?.classList.remove("ativa");
        document.getElementById(`btn-${secao}`)?.classList.remove("ativo");
    });

    document.getElementById(`secao-${nome}`)?.classList.add("ativa");
    document.getElementById(`btn-${nome}`)?.classList.add("ativo");
}

function abrirModalStatus() {
    document.getElementById("modal-status-overlay")?.classList.add("open");
}

function fecharModalStatus(event) {
    const overlay = document.getElementById("modal-status-overlay");

    if (!overlay) {
        return;
    }

    if (event && event.target !== overlay) {
        return;
    }

    overlay.classList.remove("open");

    if (funcionarioAtual) {
        document.getElementById("status-selecao").value = funcionarioAtual.status || "Ativo";
        document.getElementById("status-motivo").value = funcionarioAtual.statusMotivo || "";
    }
}

function obterFuncionarioAtualizado() {
    const funcionarioLogado = JSON.parse(localStorage.getItem("funcionarioLogado") || "null");

    if (!funcionarioLogado) {
        return null;
    }

    const funcionarios = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const funcionarioAtualizado = funcionarios.find(funcionario => funcionario.id === funcionarioLogado.id) || funcionarioLogado;

    localStorage.setItem("funcionarioLogado", JSON.stringify(funcionarioAtualizado));

    return funcionarioAtualizado;
}

async function renderizarEventosFuncionario() {
    const container = document.getElementById("lista-eventos-funcionario");
    const contador = document.getElementById("contador-eventos");

     if (!container) return;

    try {
        const res = await fetch(`${API_URL}/events`);
        const todos = await res.json();

        const futuros = todos.filter(evento => {
            const timestamp = obterTimestampDataEvento(evento.data);
            return !timestamp || timestamp >= zerarHorario(new Date()).getTime();
        });

        if (contador) {
            contador.textContent = `${futuros.length} Evento${futuros.length === 1 ? "" : "s"}`;
        }

        if (futuros.length === 0) {
            container.innerHTML = '<div class="sem-eventos">Nenhum evento futuro publicado.</div>';
            return;
        }

        container.innerHTML = futuros.map(evento => {
            const comentarios = Array.isArray(evento.comentarios) ? evento.comentarios : [];
            return `
                <article class="evento-card">
                    <div class="evento-meta">
                        <span>${formatarDataEvento(evento.data)}</span>
                        <span>${comentarios.length} comentário${comentarios.length === 1 ? "" : "s"}</span>
                    </div>
                    <h4>${escaparHtml(evento.titulo)}</h4>
                    <p>${escaparHtml(evento.descricao).replace(/\n/g, "<br>")}</p>
                    ${evento.imagem ? `<img src="${evento.imagem}" alt="${escaparHtml(evento.titulo)}">` : ""}
                    <div class="comentarios">
                        <h5>Comentários</h5>
                        ${comentarios.length
                            ? comentarios.map(c => `
                                <div class="comentario-item">
                                    <strong>${escaparHtml(c.autor)}</strong>
                                    <p>${escaparHtml(c.texto)}</p>
                                    <span>${escaparHtml(c.dataHora)}</span>
                                </div>`).join("")
                            : '<p>Ainda não há comentários.</p>'}
                        <form class="comentario-form" onsubmit="adicionarComentario(event, ${evento.id})">
                            <input type="text" name="comentario" maxlength="280" placeholder="Escreve um comentário...">
                            <button type="submit">Comentar</button>
                        </form>
                    </div>
                </article>
            `;
        }).join("");
    } catch (err) {
        console.error("Erro ao carregar eventos:", err);
        container.innerHTML = '<div class="sem-eventos">Erro ao carregar eventos.</div>';
    }
}

async function adicionarComentario(event, eventoId) {
    event.preventDefault();

    const input = event.target.querySelector('input[name="comentario"]');
    const texto = input?.value.trim();

    if (!texto || !funcionarioAtual) {
        return;
    }

    const eventos = obterEventos();
    const eventoEncontrado = eventos.find(item => item.id === eventoId);

    if (!eventoEncontrado) {
        return;
    }

    try {
        await fetch(`${API_URL}/events/${eventoId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                autor: funcionarioAtual.nome,
                funcionarioId: funcionarioAtual.id,
                texto,
                dataHora: new Date().toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short"
                })
            })
        });
        input.value = "";
        await renderizarEventosFuncionario();
    } catch (err) {
        console.error("Erro ao adicionar comentário:", err);
        alert("Erro ao adicionar comentário.");
    }
}

async function salvarStatusFuncionario() {
    if (!funcionarioAtual) {
        return;
    }

    const novoStatus = document.getElementById("status-selecao")?.value || "Ativo";
    const motivo = document.getElementById("status-motivo")?.value.trim() || "";

    if ((novoStatus === "Desativo" || novoStatus === "Licença") && !motivo) {
        alert("Explique o motivo ao escolher Desativo ou Licença.");
        return;
    }

    

    try {
        // Actualizar via API — envia o funcionário completo com novo status
        await fetch(`${API_URL}/functionaries/${funcionarioAtual.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: funcionarioAtual.nome,
                bi: funcionarioAtual.bi || "",
                jobTitle: funcionarioAtual.cargo,
                department: funcionarioAtual.departamento,
                status: novoStatus,
                baseSalary: funcionarioAtual.salario,
                email: funcionarioAtual.email
            })
        });

        funcionarioAtual.status = novoStatus;
        funcionarioAtual.statusMotivo = motivo;
        localStorage.setItem("funcionarioLogado", JSON.stringify(funcionarioAtual));
        atualizarStatus(novoStatus, motivo);
        fecharModalStatus();
        alert("Status atualizado com sucesso.");
    } catch (err) {
        console.error("Erro ao atualizar status:", err);
        alert("Erro ao atualizar status.");
    }
}

function obterEventos() {
    const dados = JSON.parse(localStorage.getItem(EVENTOS_KEY) || "[]");

    return dados
        .map(evento => ({
            ...evento,
            comentarios: Array.isArray(evento.comentarios) ? evento.comentarios : []
        }))
        .sort((a, b) => obterTimestampDataEvento(a.data) - obterTimestampDataEvento(b.data));
}

function salvarEventos(eventos) {
    localStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
}

function formatarMoedaKz(valor) {
    return `Kz ${Number(valor || 0).toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function formatarDataEvento(data) {
    const normalizada = normalizarDataEvento(data);

    if (!normalizada) {
        return "Sem data definida";
    }

    return new Date(`${normalizada}T00:00:00`).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
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
    return `${ano}-${mes}-${dia}`;
}

function obterTimestampDataEvento(data) {
    const normalizada = normalizarDataEvento(data);
    return normalizada ? new Date(`${normalizada}T00:00:00`).getTime() : 0;
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

function atualizarTexto(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}

function zerarHorario(data) {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function escaparHtml(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
