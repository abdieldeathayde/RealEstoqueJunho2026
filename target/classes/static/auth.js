// verifica se usuário está logado
export function isAuthenticated() {
    return localStorage.getItem("token") !== null;
}

// pega token
export function getToken() {
    return localStorage.getItem("token");
}

// logout
export function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// requisição autenticada
export async function authFetch(url, options = {}) {

    const token = getToken();

    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    return fetch(url, options);
}
