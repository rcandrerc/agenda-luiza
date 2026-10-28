import { useState } from 'react';
import Topo from './Topo';
import {
  calcularMesada, desmarcar, dinheiro, enviarFoto, hoje, marcar, useConclusoes, useConclusoesSemana, useFotos, useTarefas, useTarefasDoDia,
} from './dados';
import Mesada from './Mesada';

const GRUPOS = [
  { id: 'casa', nome: 'Casa' },
  { id: 'escola', nome: 'Escola' },
];

export default function TelaLuiza({ membro }) {
  const dia = hoje();
  const todas = useTarefas();
  const tarefas = useTarefasDoDia(dia);
  const semana = useConclusoesSemana(dia);
  const conclusoes = useConclusoes(dia);
  const fotos = useFotos(dia);

  if (!tarefas || !todas || !semana || !conclusoes || !fotos) return <div className="tela"><Topo titulo={`Oi, ${membro.nome}!`} feitas={0} total={0} /></div>;

  const feitas = tarefas.filter((t) => conclusoes[t.id]).length;
  const faltam = tarefas.length - feitas;
  const mesada = calcularMesada(todas, semana, dia);

  return (
    <div className="tela">
      <Topo titulo={`Oi, ${membro.nome}!`} feitas={feitas} total={tarefas.length} />
      <main className="conteudo">
        <Mesada mesada={mesada} />
        {tarefas.length === 0 && <p className="vazio">Nenhuma tarefa hoje. Aproveita o dia! 🌈</p>}
        {GRUPOS.map((g) => {
          const itens = tarefas.filter((t) => t.categoria === g.id);
          if (!itens.length) return null;
          return (
            <section key={g.id} className="grupo">
              <h2><span className={`ponto ${g.id}`} />{g.nome}</h2>
              <div className="lista">
                {itens.map((t) => (
                  <Tarefa key={t.id} tarefa={t} dia={dia} conclusao={conclusoes[t.id]} valor={t.vale ? mesada.porCaixinha : 0}
                    foto={fotos[conclusoes[t.id]?.fotoId]} />
                ))}
              </div>
            </section>
          );
        })}
        {tarefas.length > 0 && (
          <div className="incentivo">
            {faltam === 0 ? 'Tudo pronto hoje! Mandou bem! 🎉' : `Faltam ${faltam} ${faltam === 1 ? 'tarefa' : 'tarefas'}. Você consegue! 💪`}
          </div>
        )}
      </main>
    </div>
  );
}

function Tarefa({ tarefa, dia, conclusao, foto, valor }) {
  const [enviando, setEnviando] = useState(false);
  const feita = Boolean(conclusao);

  async function alternar() {
    if (feita) await desmarcar(tarefa.id, dia, conclusao);
    else await marcar(tarefa.id, dia);
  }

  async function aoEscolherFoto(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setEnviando(true);
    try {
      await enviarFoto(tarefa.id, dia, arquivo, conclusao);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={`tarefa ${feita ? 'feita' : ''}`}>
      <button className="check" onClick={alternar} aria-label={`${feita ? 'Desmarcar' : 'Marcar'} ${tarefa.nome}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
      </button>
      <div className="tarefa-texto">
        <span className="emoji" aria-hidden="true">{tarefa.emoji}</span>
        <div>
          <div className="nome">{tarefa.nome}</div>
          {tarefa.detalhe && <div className="detalhe">{tarefa.detalhe}</div>}
          {valor > 0 && <div className={`ganho ${feita ? 'ok' : ''}`}>{feita ? '✓ ' : ''}+{dinheiro(valor)}</div>}
        </div>
      </div>
      <label className={`camera ${foto ? 'tem' : ''}`} title="Tirar foto">
        {enviando ? <span className="girando" /> : foto ? <img src={foto.imagem} alt={`Foto de ${tarefa.nome}`} /> : <IconeCamera />}
        <input type="file" accept="image/*" capture="environment" onChange={aoEscolherFoto} aria-label={`Foto de ${tarefa.nome}`} />
      </label>
    </div>
  );
}

function IconeCamera() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
