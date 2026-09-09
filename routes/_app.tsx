import { define } from "../utils.ts"

export default define.page(function App({ Component, url }) {
    return (
        <html lang="pt-BR">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Rememore</title>
                <link rel="stylesheet" href="/css/all.min.css" />
                {url.pathname.replace(/\/$/, "") === "/laboratorio" && <script src="/laboratorio-theme.js" />}
            </head>
            <body>
                <Component />
            </body>
        </html>
    )
})
