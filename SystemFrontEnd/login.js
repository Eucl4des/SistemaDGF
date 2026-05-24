const API_URL = "http://localhost:8080/api";

/* LOGIN.JS */

const STORAGE_KEY =
    "sistema-gestao-funcionarios";

const THEME_KEY = "tema-claro";

function normalizarTexto(texto = "") {

    return texto
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}

/* ==========================================
   ELEMENTOS
========================================== */

const container =
    document.getElementById(
        "container"
    );

const registerBtn =
    document.getElementById(
        "register"
    );

const loginBtn =
    document.getElementById(
        "login"
    );

/* ==========================================
   ANIMAÇÃO
========================================== */

if (registerBtn) {

    registerBtn.addEventListener(
        "click",
        () => {

            container.classList.add(
                "active"
            );

        }
    );

}

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        () => {

            container.classList.remove(
                "active"
            );

        }
    );

}

/* ==========================================
   LOGIN FUNCIONÁRIO
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        iniciarTema();

        const formFuncionario =
            document.getElementById(
                "form-funcionario"
            );

        if (formFuncionario) {

            formFuncionario.addEventListener(
                "submit",
                loginFuncionario
            );

        }

        const formAdmin =
            document.getElementById(
                "form-admin"
            );

        if (formAdmin) {

            formAdmin.addEventListener(
                "submit",
                loginAdmin
            );

        }

    }
);

function iniciarTema() {

    const toggle =
        document.getElementById(
            "theme-toggle"
        );

    carregarTema();

    if (toggle) {

        toggle.addEventListener(
            "click",
            trocarTema
        );

        atualizarEstadoToggle();

    }

}

function trocarTema() {

    document.body.classList.toggle(
        "light-mode"
    );

    const claro =
        document.body.classList.contains(
            "light-mode"
        );

    localStorage.setItem(
        THEME_KEY,
        String(claro)
    );

    atualizarEstadoToggle();

}

function carregarTema() {

    const claro =
        localStorage.getItem(
            THEME_KEY
        ) === "true";

    if (claro) {

        document.body.classList.add(
            "light-mode"
        );

    }

    atualizarEstadoToggle();

}

function atualizarEstadoToggle() {

    const toggle =
        document.getElementById(
            "theme-toggle"
        );

    if (!toggle) {
        return;
    }

    const claro =
        document.body.classList.contains(
            "light-mode"
        );

    toggle.setAttribute(
        "aria-pressed",
        String(claro)
    );

}

function loginFuncionario(event) {

    event.preventDefault();

    const id =
        document.getElementById(
            "funcionario-id"
        ).value.trim();

    const email =
        document.getElementById(
            "funcionario-email"
        )
        .value
        .trim()
        .toLowerCase();

    const senha =
        document.getElementById(
            "funcionario-senha"
        )
        .value
        .trim();

    if (
        !id ||
        !email ||
        !senha
    ) {

        alert(
            "Preencha todos os campos."
        );

        return;

    }

    const funcionarios =
        JSON.parse(
            localStorage.getItem(
                STORAGE_KEY
            )
        ) || [];

    const funcionario =
        funcionarios.find(f =>

            String(f.id)
            === String(id)

            &&

            normalizarTexto(
                f.email
            ) === normalizarTexto(email)

        );

    if (!funcionario) {

        alert(
            "Funcionário não encontrado."
        );

        return;

    }

    if (senha !== "123") {

        alert(
            "Senha incorreta. Use 123."
        );

        return;

    }

    localStorage.setItem(
        "funcionarioLogado",
        JSON.stringify(funcionario)
    );

    window.location.href =
        "dash2.html";

}

/* ==========================================
   LOGIN ADMIN
========================================== */

function loginAdmin(event) {

    event.preventDefault();

    const email =
        document.getElementById(
            "admin-email"
        )
        .value
        .trim()
        .toLowerCase();

    const senha =
        document.getElementById(
            "admin-senha"
        )
        .value
        .trim();

    if (
        email === "admin@email.com"
        &&
        senha === "123"
    ) {

        localStorage.setItem(
            "admin-logado",
            "true"
        );

        window.location.href =
            "dashboard.html";

        return;

    }

    alert(
        "Credenciais inválidas."
    );

}
