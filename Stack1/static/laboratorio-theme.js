// Executado antes da pintura; a preferência do laboratório não se aplica à Página Inicial.
try {
    const tema = localStorage.getItem("rememore:lab:theme")
    if (tema === "light" || tema === "dark") {
        document.documentElement.dataset.theme = tema
    }
} catch {
    // Armazenamento indisponível: o CSS acompanha o sistema.
}
