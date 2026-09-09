import { Head } from "fresh/runtime"
import { define } from "../utils.ts"
import LaboratorioControls from "../islands/LaboratorioControls.tsx"
import LaboratorioComponents from "../islands/LaboratorioComponents.tsx"

const colors = [
    ["primary", "Principal"],
    ["link", "Link"],
    ["info", "Informação"],
    ["success", "Sucesso"],
    ["warning", "Atenção"],
    ["danger", "Perigo"]
] as const

export default define.page(function Laboratorio() {
    return (
        <main class="rememore-container" id="laboratorio">
            <Head>
                <title>Laboratório visual — Rememore</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <header class="lab-section">
                <p class="is-size-7 has-text-weight-semibold mb-3">REMEMORE · DESENVOLVIMENTO</p>
                <h1 class="title is-2">Laboratório visual</h1>
                <p class="rememore-reading mb-5">
                    Um espaço para comparar fontes, temas e elementos básicos antes de construir as páginas. Redimensione a janela e
                    percorra as amostras também com o teclado.
                </p>
                <LaboratorioControls />
                <nav class="lab-sample-row mt-5" aria-label="Seções do laboratório">
                    <a href="#componentes">Cabeçalho e popup</a>
                    <a href="#tipografia">Tipografia</a>
                    <a href="#cores">Cores e estados</a>
                    <a href="#campos">Campos</a>
                    <a href="#superficies">Superfícies</a>
                    <a href="#layout">Layout e rolagem</a>
                </nav>
            </header>

            <LaboratorioComponents />

            <section class="lab-section" id="tipografia" aria-labelledby="titulo-tipografia">
                <h2 class="title is-3" id="titulo-tipografia">Tipografia</h2>
                <div class="lab-grid">
                    <div class="content">
                        <h1>Título de primeiro nível</h1>
                        <h2>Título de segundo nível</h2>
                        <h3>Título de terceiro nível</h3>
                        <h4>Título de quarto nível</h4>
                        <h5>Título de quinto nível</h5>
                        <h6>Título de sexto nível</h6>
                    </div>
                    <div class="content rememore-reading">
                        <p class="is-size-4">Nem todos os dias são iguais. Às vezes, é a memória que os torna parecidos.</p>
                        <p>Uma lembrança pode começar com um detalhe: o cheiro do café, uma conversa ou a luz entrando pela janela.</p>
                        <p>
                            <strong>Texto em destaque</strong>, <em>texto em itálico</em>, <a href="#campos">link de exemplo</a>,
                            <small>texto pequeno</small> e <code>trecho de código</code>.
                        </p>
                        <p>Acentos: ação, coração, infância, bênção, avó, avô. Números: 0123456789. Símbolos: @ # % &amp; € R$.</p>
                        <ul>
                            <li>Uma caminhada no fim da tarde.</li>
                            <li>Um encontro que vale lembrar.</li>
                        </ul>
                        <ol>
                            <li>Observe o tamanho das letras.</li>
                            <li>Compare o ritmo da leitura.</li>
                        </ol>
                        <blockquote>O cotidiano também merece ser lembrado.</blockquote>
                        <p class="has-text-weight-light">Peso leve (300)</p>
                        <p class="has-text-weight-normal">Peso normal (400)</p>
                        <p class="has-text-weight-semibold">Peso seminegrito (600)</p>
                        <p class="has-text-weight-bold">Peso negrito (700)</p>
                    </div>
                </div>
            </section>

            <section class="lab-section" id="cores" aria-labelledby="titulo-cores">
                <h2 class="title is-3" id="titulo-cores">Cores e estados</h2>
                <p class="mb-5">Compare fundos, texto e bordas. Passe o mouse e use Tab para observar o foco real.</p>
                <div class="lab-grid">
                    {colors.map(([color, label]) => (
                        <article key={color}>
                            <h3 class="title is-5">{label}</h3>
                            <div class={"lab-swatch has-background-" + color + " has-text-" + color + "-invert mb-3"}>
                                {label} sobre a cor base
                            </div>
                            <div class="buttons">
                                <button type="button" class={"button is-" + color}>Normal</button>
                                <button type="button" class={"button is-" + color + " is-light"}>Suave</button>
                                <button type="button" class={"button is-" + color + " is-outlined"}>Contorno</button>
                                <button type="button" class={"button is-" + color + " is-hovered"}>Hover</button>
                                <button type="button" class={"button is-" + color + " is-focused"}>Foco</button>
                                <button type="button" class={"button is-" + color + " is-active"}>Ativo</button>
                                <button type="button" class={"button is-" + color} disabled>Desabilitado</button>
                                <button
                                    type="button"
                                    class={"button is-" + color + " is-loading"}
                                    disabled
                                    aria-label={label + ": carregando"}
                                >
                                    Carregando
                                </button>
                            </div>
                            <div class={"notification is-" + color + " is-light"}>Notificação de exemplo: {label.toLowerCase()}.</div>
                            <article class={"message is-" + color}>
                                <div class="message-header">
                                    <p>{label}</p>
                                </div>
                                <div class="message-body">Mensagem para observar texto, fundo e borda.</div>
                            </article>
                            <div class="tags">
                                <span class={"tag is-" + color}>{label}</span>
                                <span class={"tag is-" + color + " is-light"}>Variação suave</span>
                            </div>
                            <progress class={"progress is-" + color} value="60" max="100" aria-label={label + ": 60%"}>60%</progress>
                        </article>
                    ))}
                </div>
            </section>

            <section class="lab-section" id="campos" aria-labelledby="titulo-campos">
                <h2 class="title is-3" id="titulo-campos">Campos e controles</h2>
                <div class="lab-grid">
                    <div>
                        <div class="field">
                            <label class="label" for="sample-normal">Texto</label>
                            <div class="control">
                                <input class="input" id="sample-normal" placeholder="Digite uma lembrança de exemplo" />
                            </div>
                            <p class="help">Campo livre para experimentar foco e seleção de texto.</p>
                        </div>
                        <div class="field">
                            <label class="label" for="sample-success">Estado de sucesso</label>
                            <input
                                class="input is-success"
                                id="sample-success"
                                defaultValue="Uma tarde tranquila"
                                aria-describedby="help-success"
                            />
                            <p class="help is-success" id="help-success">Mensagem de sucesso de exemplo.</p>
                        </div>
                        <div class="field">
                            <label class="label" for="sample-danger">Estado de erro</label>
                            <input
                                class="input is-danger"
                                id="sample-danger"
                                defaultValue="Exemplo"
                                aria-invalid="true"
                                aria-describedby="help-danger"
                            />
                            <p class="help is-danger" id="help-danger">Mensagem de erro de exemplo.</p>
                        </div>
                        <div class="field">
                            <label class="label" for="sample-disabled">Desabilitado</label>
                            <input class="input" id="sample-disabled" value="Campo indisponível" disabled />
                        </div>
                        <div class="field">
                            <label class="label" for="sample-readonly">Somente leitura</label>
                            <input class="input" id="sample-readonly" value="Conteúdo preservado" readOnly />
                        </div>
                    </div>
                    <div>
                        <div class="field">
                            <label class="label" for="sample-textarea">Texto longo</label>
                            <textarea
                                class="textarea"
                                id="sample-textarea"
                                placeholder="Observe linhas, espaçamento e redimensionamento."
                                rows={4}
                            />
                        </div>
                        <div class="field">
                            <label class="label" for="sample-select">Seleção</label>
                            <div class="select is-fullwidth">
                                <select id="sample-select">
                                    <option>Primeira opção</option>
                                    <option>Segunda opção</option>
                                </select>
                            </div>
                        </div>
                        <div class="field">
                            <label class="checkbox">
                                <input type="checkbox" /> Opção de exemplo
                            </label>
                        </div>
                        <fieldset class="field">
                            <legend class="label">Grupo de opções</legend>
                            <label class="radio">
                                <input type="radio" name="sample-radio" defaultChecked /> Primeira
                            </label>
                            <label class="radio">
                                <input type="radio" name="sample-radio" /> Segunda
                            </label>
                        </fieldset>
                        <div class="field">
                            <label class="checkbox">
                                <input type="checkbox" disabled /> Opção desabilitada
                            </label>
                        </div>
                        <div class="field">
                            <div class="file">
                                <label class="file-label">
                                    <input class="file-input" type="file" aria-label="Escolher arquivo de exemplo" />
                                    <span class="file-cta">
                                        <span class="file-label">Escolher arquivo</span>
                                    </span>
                                </label>
                            </div>
                            <p class="help">Amostra local; nenhum arquivo é enviado.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="lab-section" id="superficies" aria-labelledby="titulo-superficies">
                <h2 class="title is-3" id="titulo-superficies">Superfícies e elementos</h2>
                <div class="lab-grid">
                    <div class="box">
                        <h3 class="title is-5">Caixa com sombra</h3>
                        <p>
                            Texto normal, <strong>texto forte</strong> e bordas arredondadas.
                        </p>
                    </div>
                    <article class="card">
                        <header class="card-header">
                            <p class="card-header-title">Cartão de exemplo</p>
                        </header>
                        <div class="card-content">
                            <p>Uma superfície para comparar preenchimento, contraste e sombra.</p>
                        </div>
                        <footer class="card-footer">
                            <a class="card-footer-item" href="#tipografia">Ver tipografia</a>
                        </footer>
                    </article>
                    <div class="lab-surface lab-surface-bis">
                        <h3 class="title is-5">Superfície secundária</h3>
                        <p>Fundo bis com borda.</p>
                    </div>
                    <div class="lab-surface lab-surface-ter">
                        <h3 class="title is-5">Superfície terciária</h3>
                        <p>Fundo ter com borda.</p>
                    </div>
                </div>
                <div class="tabs is-boxed mt-5">
                    <ul>
                        <li class="is-active">
                            <a href="#superficies" aria-current="true">Amostra ativa</a>
                        </li>
                        <li>
                            <a href="#layout">Layout</a>
                        </li>
                    </ul>
                </div>
                <div class="table-container">
                    <table class="table is-striped is-hoverable is-fullwidth">
                        <caption class="has-text-left mb-3">Tabela de amostra para observar linhas, hover e alinhamento.</caption>
                        <thead>
                            <tr>
                                <th scope="col">Elemento</th>
                                <th scope="col">Descrição</th>
                                <th scope="col">Quantidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">Texto</th>
                                <td>Uma lembrança do cotidiano</td>
                                <td>12</td>
                            </tr>
                            <tr class="is-selected">
                                <th scope="row">Seleção</th>
                                <td>Linha selecionada</td>
                                <td>24</td>
                            </tr>
                            <tr>
                                <th scope="row">Detalhe</th>
                                <td>Acentuação e números</td>
                                <td>36</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <details class="box">
                    <summary>Conteúdo expansível</summary>
                    <p class="mt-3">Observe o foco, a abertura e o espaço interno deste elemento nativo.</p>
                </details>
            </section>

            <section class="lab-section" id="layout" aria-labelledby="titulo-layout">
                <h2 class="title is-3" id="titulo-layout">Layout e rolagem</h2>
                <p class="rememore-reading mb-5">
                    A largura útil, as margens e os espaçamentos são globais. As colunas abaixo usam a responsividade do Bulma e se empilham
                    em telas pequenas.
                </p>
                <div class="columns">
                    {[1, 2, 3].map((number) => (
                        <div class="column" key={number}>
                            <div class="lab-surface">Coluna {number}</div>
                        </div>
                    ))}
                </div>
                <div class="lab-scroll content" tabIndex={0} role="region" aria-label="Amostra de rolagem vertical">
                    {Array.from(
                        { length: 10 },
                        (_, index) => (
                            <p key={index}>Linha {index + 1}. Role esta área para avaliar a barra, o fundo e a leitura no tema atual.</p>
                        )
                    )}
                </div>
                <p class="help mt-3">O sistema operacional pode ocultar as barras até o início da rolagem.</p>
            </section>
        </main>
    )
})
