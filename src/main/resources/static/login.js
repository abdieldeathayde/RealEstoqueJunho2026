const form = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {


e.preventDefault();

const username =
    document.getElementById("username").value.trim();

const password =
    document.getElementById("password").value.trim();

if (!username || !password) {

    mensagem.innerText =
        "Preencha usuário e senha.";

    mensagem.style.color = "red";

    return;
}

try {

    const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })
        }
    );

    const text = await response.text();

    let data = null;

    if (text) {

        try {
            data = JSON.parse(text);
        } catch (error) {

            console.error(
                "Resposta não é JSON:",
                text
            );
        }
    }

    if (!response.ok) {

        console.error(
            "Erro HTTP:",
            response.status,
            data
        );

        mensagem.innerText =
            data?.message ||
            data?.error ||
            `Erro ao realizar login. HTTP ${response.status}`;

        mensagem.style.color = "red";

        return;
    }

    if (!data?.token) {

        console.error(
            "Resposta sem token:",
            data
        );

        mensagem.innerText =
            "Login realizado, mas o token não foi recebido.";

        mensagem.style.color = "red";

        return;
    }

    localStorage.setItem(
        "token",
        data.token
    );

    mensagem.innerText =
        "Login realizado com sucesso!";

    mensagem.style.color = "green";

    setTimeout(() => {

        window.location.href =
            "index.html";

    }, 500);

} catch (error) {

    console.error(
        "Erro ao realizar login:",
        error
    );

    mensagem.innerText =
        "Não foi possível conectar ao servidor.";

    mensagem.style.color = "red";
}


});
