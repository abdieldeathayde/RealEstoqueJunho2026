const form = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // ✅ validação básica
    if (!username || !password) {
        mensagem.innerText = "Preencha usuário e senha";
        mensagem.style.color = "red";
        return;
    }

    try {

        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        // lê resposta apenas uma vez
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        // ✅ erro de login
        if (!response.ok) {
            mensagem.innerText =
                data?.error || "Usuário ou senha inválidos";
            mensagem.style.color = "red";
            return;
        }

        // ✅ valida token
        if (!data?.token) {
            mensagem.innerText = "Token não recebido do servidor";
            mensagem.style.color = "red";
            return;
        }

        // ✅ salva JWT
        localStorage.setItem("token", data.token);

        mensagem.innerText = "Login realizado!";
        mensagem.style.color = "green";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (error) {
        console.error("Erro login:", error);
        mensagem.innerText = "Erro ao conectar com servidor";
        mensagem.style.color = "red";
    }
});