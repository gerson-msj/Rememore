// Executado antes da pintura; a preferência do laboratório não se aplica à Página Inicial.
try {
    const theme = localStorage.getItem("rememore:lab:theme")
    if (theme === "light" || theme === "dark") {
        document.documentElement.dataset.theme = theme
    }
} catch {
    // Armazenamento indisponível: o CSS acompanha o sistema.
}
