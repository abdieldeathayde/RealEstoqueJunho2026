const form = document.getElementById("cadastroForm");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    // ✅ validação simples
    if (!username || !password) {
        mensagem.innerText = "Preencha todos os campos";
        mensagem.style.color = "red";
        return;
    }

    if (password.length < 4) {
        mensagem.innerText = "Senha deve ter no mínimo 4 caracteres";
        mensagem.style.color = "red";
        return;
    }

    try {

        const response = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                role
            })
        });

        if (response.ok) {
            mensagem.innerText = "Usuário cadastrado com sucesso!";
            mensagem.style.color = "green";

            setTimeout(() => {
                        window.location.href = "login.html";
                    }, 1000);

            form.reset();
        } else {
            const text = await response.text();
            mensagem.innerText = text || "Erro ao cadastrar usuário";
            mensagem.style.color = "red";
        }

    } catch (error) {
        console.error(error);
        mensagem.innerText = "Erro ao conectar com servidor";
        mensagem.style.color = "red";
    }
});