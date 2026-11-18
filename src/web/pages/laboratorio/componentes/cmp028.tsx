import { useState } from "react";
import { usePopup, type TemaPopup } from "@web/components/popup/PopupContext";
import "./cmp028.css";

export function Cmp028() {
  const { abrirPopup } = usePopup();
  const [titulo, setTitulo] = useState("Aviso de exemplo");
  const [apresentarTitulo, setApresentarTitulo] = useState(false);
  const [apresentarIcone, setApresentarIcone] = useState(false);
  const [mensagemHtml, setMensagemHtml] = useState(
    "<p>Mensagem de exemplo do <strong>popup</strong>.</p><p>Você pode testar quebras de linha e formatação HTML.</p>",
  );
  const [temaPopup, setTemaPopup] = useState<TemaPopup>("normal");
  const [apresentarOk, setApresentarOk] = useState(true);
  const [textoOk, setTextoOk] = useState("OK");
  const [temaOk, setTemaOk] = useState<TemaPopup>("normal");
  const [apresentarCancelar, setApresentarCancelar] = useState(true);
  const [textoCancelar, setTextoCancelar] = useState("Cancelar");
  const [temaCancelar, setTemaCancelar] = useState<TemaPopup>("normal");
  const [ultimaAcao, setUltimaAcao] = useState<string>("Nenhuma ação recebida.");

  async function abrir() {
    const acao = await abrirPopup({
      titulo: apresentarTitulo ? titulo : undefined,
      icone: apresentarIcone ? "fa-solid fa-circle-info" : undefined,
      mensagemHtml,
      tema: temaPopup,
      botoes: {
        ok: { apresentar: apresentarOk, texto: textoOk, tema: temaOk },
        cancelar: { apresentar: apresentarCancelar, texto: textoCancelar, tema: temaCancelar },
      },
    });
    setUltimaAcao(acao);
  }

  return (
    <details className="bloco-teste cmp028-lab">
      <summary className="bloco-teste-titulo link">CMP-028 Popup</summary>
      <div className="bloco-teste-conteudo cmp028-lab-conteudo">
        <div className="cmp028-lab-controles">
          <div className="cmp028-lab-coluna">
            <div className="campo-texto">
              <label htmlFor="cmp028-titulo">Título</label>
              <input id="cmp028-titulo" className="controle-com-borda" type="text" value={titulo} onChange={(evento) => setTitulo(evento.currentTarget.value)} />
            </div>
            <label className="cmp028-lab-opcao campo-checkbox">
              <input className="controle-com-borda" type="checkbox" checked={apresentarTitulo} onChange={(evento) => setApresentarTitulo(evento.currentTarget.checked)} />
              Apresentar título
            </label>
            <label className="cmp028-lab-opcao campo-checkbox">
              <input className="controle-com-borda" type="checkbox" checked={apresentarIcone} onChange={(evento) => setApresentarIcone(evento.currentTarget.checked)} />
              Apresentar ícone
            </label>
            <div className="campo-texto cmp028-lab-mensagem">
              <label htmlFor="cmp028-mensagem">Mensagem HTML</label>
              <textarea id="cmp028-mensagem" className="controle-com-borda" rows={4} value={mensagemHtml} onChange={(evento) => setMensagemHtml(evento.currentTarget.value)} />
            </div>
          </div>
          <div className="cmp028-lab-coluna">
            <div className="campo-texto">
              <label htmlFor="cmp028-tema">Tema do popup</label>
              <select id="cmp028-tema" className="controle-com-borda" value={temaPopup} onChange={(evento) => setTemaPopup(evento.currentTarget.value as TemaPopup)}>
                <option value="normal">Normal</option>
                <option value="link">Link</option>
                <option value="perigo">Perigo</option>
                <option value="alerta">Alerta</option>
              </select>
            </div>
            <fieldset className="cmp028-lab-botao">
              <legend>Botão OK</legend>
              <label className="cmp028-lab-opcao campo-checkbox">
                <input className="controle-com-borda" type="checkbox" checked={apresentarOk} onChange={(evento) => setApresentarOk(evento.currentTarget.checked)} />
                Apresentar
              </label>
              <div className="campo-texto">
                <label htmlFor="cmp028-texto-ok">Texto</label>
                <input id="cmp028-texto-ok" className="controle-com-borda" type="text" value={textoOk} onChange={(evento) => setTextoOk(evento.currentTarget.value)} />
              </div>
              <div className="campo-texto">
                <label htmlFor="cmp028-tema-ok">Tema</label>
                <select id="cmp028-tema-ok" className="controle-com-borda" value={temaOk} onChange={(evento) => setTemaOk(evento.currentTarget.value as TemaPopup)}>
                  <option value="normal">Normal</option>
                  <option value="link">Link</option>
                  <option value="perigo">Perigo</option>
                  <option value="alerta">Alerta</option>
                </select>
              </div>
            </fieldset>

            <fieldset className="cmp028-lab-botao">
              <legend>Botão Cancelar</legend>
              <label className="cmp028-lab-opcao campo-checkbox">
                <input className="controle-com-borda" type="checkbox" checked={apresentarCancelar} onChange={(evento) => setApresentarCancelar(evento.currentTarget.checked)} />
                Apresentar
              </label>
              <div className="campo-texto">
                <label htmlFor="cmp028-texto-cancelar">Texto</label>
                <input id="cmp028-texto-cancelar" className="controle-com-borda" type="text" value={textoCancelar} onChange={(evento) => setTextoCancelar(evento.currentTarget.value)} />
              </div>
              <div className="campo-texto">
                <label htmlFor="cmp028-tema-cancelar">Tema</label>
                <select id="cmp028-tema-cancelar" className="controle-com-borda" value={temaCancelar} onChange={(evento) => setTemaCancelar(evento.currentTarget.value as TemaPopup)}>
                  <option value="normal">Normal</option>
                  <option value="link">Link</option>
                  <option value="perigo">Perigo</option>
                  <option value="alerta">Alerta</option>
                </select>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="cmp028-lab-acao">
          <button type="button" onClick={abrir}>Abrir popup</button>
          <p>Última ação recebida: <output>{ultimaAcao}</output></p>
        </div>
      </div>
    </details>
  );
}
