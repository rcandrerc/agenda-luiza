import { useEffect, useRef, useState } from 'react';
import Topo from './Topo';
import AlertaAmanha from './AlertaAmanha';
import {
  calcularMesada, cancelarJustificativa, diasAnteriores, tarefaDoDia, useJustificativasPeriodo, descreverQuando, desmarcar, dinheiro, enviarFoto, enviarJustificativa, feitaDeVerdade, hoje, useConclusoes, useConclusoesPeriodo, useConclusoesSemana, useConfigMesada,
  useFotos, useJustificativas, useJustificativasSemana, urgenciaPrazo, useTarefas, useTarefasDoDia,
} from './dados';
import Mesada from './Mesada';
import { confete } from './confete';

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
  const justificativas = useJustificativas(dia);
  const justSemana = useJustificativasSemana(dia);
  const config = useConfigMesada();
  const anteriores = diasAnteriores(dia);
  const concAnteriores = useConclusoesPeriodo(anteriores[anteriores.length - 1], anteriores[0]);
  const justAnteriores = useJustificativasPeriodo(anteriores[anteriores.length - 1], anteriores[0]);

  const pronto = Boolean(tarefas && todas && semana && conclusoes && fotos && justificativas && justSemana && concAnteriores && justAnteriores);
  const justificada = (t) => justificativas[t.id]?.status === 'aprovada';
  const feitas = pronto ? tarefas.filter((t) => feitaDeVerdade(conclusoes[t.id]) || justificada(t)).length : 0;
  const total = tarefas?.length ?? 0;
  const mesada = pronto ? calcularMesada(todas, semana, dia, justSemana, config) : null;

  // Confete quando ela termina o dia, e mais confete quando fecha a semana perfeita.
  // A primeira leitura só guarda o ponto de partida, para não soltar confete ao abrir o app.
  const antes = useRef(null);
  useEffect(() => {
    const pendentesAntes = pronto ? anteriores.map((d) => ({
    dia: d,
    itens: (todas ?? []).filter((t) => !t.prazo && tarefaDoDia(t, d)
      && !feitaDeVerdade(concAnteriores.find((c) => c.dia === d && c.tarefaId === t.id))
      && justAnteriores.find((j) => j.dia === d && j.tarefaId === t.id)?.status !== 'aprovada'),
  })).filter((g) => g.itens.length) : [];

  if (!pronto) return;
    const bonus = mesada.bonusGanho;
    if (antes.current) {
      if (bonus && !antes.current.bonus) confete(280);
      else if (total > 0 && feitas === total && feitas > antes.current.feitas) confete();
    }
    antes.current = { feitas, bonus };
  }, [pronto, feitas, total, mesada?.bonusGanho]);

  if (!pronto) return <div className="tela"><Topo titulo={`Oi, ${membro.nome}!`} feitas={0} total={0} /></div>;

  const faltam = tarefas.length - feitas;

  return (
    <div className="tela">
      <Topo titulo={`Oi, ${membro.nome}!`} feitas={feitas} total={tarefas.length} />
      <main className="conteudo">
        <AlertaAmanha tarefas={todas} />
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
                    foto={fotos[conclusoes[t.id]?.fotoId]} justificativa={justificativas[t.id]} />
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
        {pendentesAntes.length > 0 && (
          <section className="grupo">
            <h2>Dias anteriores</h2>
            <p className="dica">Não deu para fazer? Conte o motivo e seus pais decidem.</p>
            {pendentesAntes.map((g) => (
              <div key={g.dia} className="lista">
                <p className="dica">{new Date(`${g.dia}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</p>
                {g.itens.map((t) => (
                  <TarefaAnterior key={t.id} tarefa={t} dia={g.dia} justificativa={justAnteriores.find((j) => j.dia === g.dia && j.tarefaId === t.id)} />
                ))}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

// Tarefa de um dia que já passou: só dá para justificar (a foto é do próprio dia).
function TarefaAnterior({ tarefa, dia, justificativa }) {
  const [justificando, setJustificando] = useState(false);
  const [motivo, setMotivo] = useState('');

  async function enviarMotivo(e) {
    e.preventDefault();
    if (!motivo.trim()) return;
    await enviarJustificativa(tarefa.id, dia, motivo.trim());
    setJustificando(false);
  }

  return (
    <div className="tarefa">
      <span className="emoji" aria-hidden="true">{tarefa.emoji}</span>
      <div className="tarefa-texto">
        <div>
          <div className="nome">{tarefa.nome}</div>
          {justificativa ? (
            <div className={`justificativa ${justificativa.status}`}>
              {justificativa.status === 'pendente' && '⏳ Motivo enviado. Esperando os pais.'}
              {justificativa.status === 'recusada' && '❌ Os pais não aceitaram o motivo.'}
              {' '}
              <button className="link" onClick={() => { setMotivo(justificativa.motivo); setJustificando(true); }}>Mudar motivo</button>
              {justificativa.status === 'pendente' && <button className="link" onClick={() => cancelarJustificativa(tarefa.id, dia)}>Cancelar</button>}
            </div>
          ) : (
            <button className="link" onClick={() => setJustificando(true)}>Não consegui fazer</button>
          )}
        </div>
      </div>
      {justificando && (
        <div className="ampliada" onClick={() => setJustificando(false)} role="dialog" aria-label="Por que não fez a tarefa">
          <form className="passos pedir-foto" onClick={(e) => e.stopPropagation()} onSubmit={enviarMotivo}>
            <h2>Por que não deu para fazer?</h2>
            <p>Conte o motivo de “{tarefa.nome}”. Seus pais vão ver e decidir.</p>
            <textarea className="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={500} rows={4} required autoFocus />
            <button className="botao">Enviar para os pais</button>
            <button type="button" className="link" onClick={() => setJustificando(false)}>Voltar</button>
          </form>
        </div>
      )}
    </div>
  );
}

function Tarefa({ tarefa, dia, conclusao, foto, valor, justificativa }) {
  const [enviando, setEnviando] = useState(false);
  const [pedirFoto, setPedirFoto] = useState(false);
  const entrada = useRef(null);
  const [justificando, setJustificando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const aprovada = justificativa?.status === 'aprovada';
  const devolvida = conclusao?.revisao === 'devolvida' && !aprovada;
  const feita = feitaDeVerdade(conclusao) || aprovada;

  // Só dá para marcar como feita mandando a foto da tarefa.
  async function alternar() {
    if (aprovada) return;
    if (feita) await desmarcar(tarefa.id, dia, conclusao);
    else setPedirFoto(true);
  }

  async function aoEscolherFoto(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    setPedirFoto(false);
    if (!arquivo) return;
    setEnviando(true);
    try {
      await enviarFoto(tarefa.id, dia, arquivo, conclusao);
    } finally {
      setEnviando(false);
    }
  }

  async function enviarMotivo(e) {
    e.preventDefault();
    if (!motivo.trim()) return;
    await enviarJustificativa(tarefa.id, dia, motivo.trim());
    setJustificando(false);
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
          {tarefa.prazo && <div className={`prazo ${feita ? 'ok' : urgenciaPrazo(tarefa)}`}>{feita ? '✓ Entregue' : descreverQuando(tarefa)}</div>}
          {devolvida && <div className="justificativa recusada">↩️ Os pais pediram para refazer. Tire outra foto!</div>}
          {valor > 0 && <div className={`ganho ${feita ? 'ok' : ''}`}>{feita ? '✓ ' : ''}+{dinheiro(valor)}</div>}
          {!feita && !conclusao && (
            justificativa ? (
              <div className={`justificativa ${justificativa.status}`}>
                {justificativa.status === 'pendente' && '⏳ Motivo enviado. Esperando os pais.'}
                {justificativa.status === 'recusada' && '❌ Os pais não aceitaram o motivo.'}
                {' '}
                <button className="link" onClick={() => { setMotivo(justificativa.motivo); setJustificando(true); }}>Mudar motivo</button>
                {justificativa.status === 'pendente' && <button className="link" onClick={() => cancelarJustificativa(tarefa.id, dia)}>Cancelar</button>}
              </div>
            ) : (
              <button className="link" onClick={() => setJustificando(true)}>Não consegui fazer</button>
            )
          )}
          {aprovada && <div className="justificativa aprovada">✅ Motivo aceito pelos pais</div>}
        </div>
      </div>
      <label className={`camera ${foto ? 'tem' : ''}`} title="Tirar foto">
        {enviando ? <span className="girando" /> : foto ? <img src={foto.imagem} alt={`Foto de ${tarefa.nome}`} /> : <IconeCamera />}
        <input ref={entrada} type="file" accept="image/*" capture="environment" onChange={aoEscolherFoto} aria-label={`Foto de ${tarefa.nome}`} />
      </label>
      {justificando && (
        <div className="ampliada" onClick={() => setJustificando(false)} role="dialog" aria-label="Por que não fez a tarefa">
          <form className="passos pedir-foto" onClick={(e) => e.stopPropagation()} onSubmit={enviarMotivo}>
            <h2>Por que não deu para fazer?</h2>
            <p>Conte o motivo de “{tarefa.nome}”. Seus pais vão ver e decidir.</p>
            <textarea className="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={500} rows={4} required autoFocus />
            <button className="botao">Enviar para os pais</button>
            <button type="button" className="link" onClick={() => setJustificando(false)}>Voltar</button>
          </form>
        </div>
      )}
      {pedirFoto && (
        <div className="ampliada" onClick={() => setPedirFoto(false)} role="dialog" aria-label="Tire uma foto da tarefa">
          <div className="passos pedir-foto" onClick={(e) => e.stopPropagation()}>
            <div className="pedir-foto-icone" aria-hidden="true">📸</div>
            <h2>Tire uma foto da tarefa!</h2>
            <p>Para marcar “{tarefa.nome}” como feita, mostre como ficou.</p>
            <button className="botao" onClick={() => entrada.current?.click()}>Abrir a câmera</button>
            <button className="link" onClick={() => setPedirFoto(false)}>Agora não</button>
          </div>
        </div>
      )}
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
