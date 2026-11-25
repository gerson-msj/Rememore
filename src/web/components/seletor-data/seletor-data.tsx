import { useEffectEvent, useId, useLayoutEffect, useRef, useState } from "react";
import "./seletor-data.css";

export type SelecaoData = {
  valor: string;
  valida: boolean;
};

type SeletorDataProps = {
  rotulo?: string;
  dataInicial?: string;
  dataMinima?: string;
  dataMaxima?: string;
  aoSelecionar: (selecao: SelecaoData) => void;
};

function lerSelecao(campo: HTMLInputElement): SelecaoData {
  const valor = /^\d{4}-\d{2}-\d{2}$/.test(campo.value) ? campo.value : "";
  return { valor, valida: valor !== "" && campo.validity.valid };
}

export function SeletorData({
  rotulo = "Data",
  dataInicial,
  dataMinima,
  dataMaxima,
  aoSelecionar,
}: SeletorDataProps) {
  const id = useId();
  const campo = useRef<HTMLInputElement>(null);
  const [valida, setValida] = useState(false);

  function atualizarSelecao(entrada: HTMLInputElement) {
    const selecao = lerSelecao(entrada);
    setValida(selecao.valida);
    aoSelecionar(selecao);
  }

  const atualizarAposConfigurar = useEffectEvent(atualizarSelecao);

  useLayoutEffect(() => {
    if (campo.current) atualizarAposConfigurar(campo.current);
  }, [dataMinima, dataMaxima]);

  function abrirCalendario() {
    const entrada = campo.current;
    if (!entrada) return;

    entrada.focus();
    try {
      entrada.showPicker?.();
    } catch {
      // O campo segue com foco para edição manual se o navegador bloquear a abertura.
    }
  }

  return (
    <div className="campo-texto cmp003">
      <label htmlFor={id}>{rotulo}</label>
      <div className="controle-com-icone">
        <input
          ref={campo}
          id={id}
          className="controle-com-borda"
          type="date"
          defaultValue={dataInicial}
          min={dataMinima}
          max={dataMaxima}
          required
          aria-invalid={!valida || undefined}
          onInput={(evento) => atualizarSelecao(evento.currentTarget)}
        />
        <button className="botao-icone-controle link" type="button" aria-label="Abrir calendário" onClick={abrirCalendario}>
          <i className="fa-solid fa-calendar-days" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
