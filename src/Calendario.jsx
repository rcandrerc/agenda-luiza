import { useState } from 'react';
import Topo from './Topo';
import { descreverQuando, formatarDia, hoje, tarefaDoDia, urgenciaPrazo, useConclusoesPeriodo, useTarefas } from './dados';

const CABECALHO = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

// Mês inteiro com o andamento de cada dia. Toque num dia para ver a lista dele.
export default function Calendario() {
  const hojeStr = hoje();
  const [mes, setMes] = useState(hojeStr.slice(0, 7));
  const [sel, setSel] = useState(hojeStr);
  const tarefas = useTarefas();

  const [ano, m] = mes.split('-').map(Number);
  const diasNoMes = new Date(ano, m, 0).getDate();
  const vazios = (new Date(ano, m - 1, 1).getDay() + 6) % 7;
  const de = `${mes}-01`;
  const ate = `${mes}-${String(diasNoMes).padStart(2, '0')}`;
  const conclusoes = useConclusoesPeriodo(de, ate);

  function trocarMes(delta) {
    const novo = formatarDia(new Date(ano, m - 1 + delta, 1)).slice(0, 7);
    setMes(novo);
    setSel(novo === hojeStr.slice(0, 7) ? hojeStr : `${novo}-01`);
  }

  if (!tarefas || !conclusoes) return <div className="tela"><Topo titulo="Calendário" semProgresso /></div>;

  const feitas = new Map(conclusoes.map((c) => [`${c.dia}_${c.tarefaId}`, c]));
  const doDia = (dia) => tarefas.filter((t) => tarefaDoDia(t, dia));

  // Tarefa com prazo só conta no calendário no dia da entrega (ou no dia em que foi feita).
  const contaNoDia = (t, dia) => !t.prazo || dia === t.prazo || dia === t.concluidaDia;

  function situacao(dia) {
    const lista = doDia(dia).filter((t) => contaNoDia(t, dia));
    if (lista.length === 0) return 'vazio';
    const n = lista.filter((t) => feitas.has(`${dia}_${t.id}`)).length;
    if (dia > hojeStr) return 'futuro';
    if (n === lista.length) return 'ok';
    if (n > 0) return 'parcial';
    return dia === hojeStr ? 'futuro' : 'falta';
  }

  const nomeMes = new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const lista = doDia(sel);
  const passado = sel <= hojeStr;

  return (
    <div className="tela">
      <Topo titulo="Calendário" semProgresso />
      <main className="conteudo">
        <section className="grupo">
          <div className="mes-nav">
            <button onClick={() => trocarMes(-1)} aria-label="Mês anterior">‹</button>
            <h2>{nomeMes}</h2>
            <button onClick={() => trocarMes(1)} aria-label="Próximo mês">›</button>
          </div>
          <div className="calendario" role="grid">
            {CABECALHO.map((c, i) => <span key={i} className="cab">{c}</span>)}
            {Array.from({ length: vazios }, (_, i) => <span key={`v${i}`} />)}
            {Array.from({ length: diasNoMes }, (_, i) => {
              const dia = `${mes}-${String(i + 1).padStart(2, '0')}`;
              return (
                <button key={dia} className={`dia ${dia === sel ? 'sel' : ''} ${dia === hojeStr ? 'hoje' : ''}`}
                  onClick={() => setSel(dia)} aria-pressed={dia === sel}>
                  {i + 1}
                  <i className={`bolinha ${situacao(dia)}`} />
                </button>
              );
            })}
          </div>
          <div className="legenda">
            <span><i className="bolinha ok" /> Fez tudo</span>
            <span><i className="bolinha parcial" /> Parte</span>
            <span><i className="bolinha falta" /> Não fez</span>
            <span><i className="bolinha futuro" /> Programado</span>
          </div>
        </section>

        <section className="grupo">
          <h2>{new Date(`${sel}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
          {lista.length === 0 ? (
            <p className="dica">Nenhuma tarefa neste dia.</p>
          ) : (
            <div className="lista">
              {lista.map((t) => {
                const c = feitas.get(`${sel}_${t.id}`);
                return (
                  <div key={t.id} className="linha">
                    <span className="emoji" aria-hidden="true">{t.emoji}</span>
                    <div className="linha-texto">
                      <div className="nome">{t.nome}</div>
                      <span className={`etiqueta ${t.categoria}`}>{t.categoria === 'escola' ? 'Escola' : 'Casa'}</span>
                      <span className={`etiqueta ${urgenciaPrazo(t) ? `prazo-${urgenciaPrazo(t)}` : ''}`}>
                        {t.prazo && sel === t.prazo ? '📌 Entrega neste dia' : descreverQuando(t)}
                      </span>
                    </div>
                    <span className={`selo ${c ? 'ok' : ''}`}>
                      {c ? `Feita ${hora(c.feitaEm)}` : passado ? (sel === hojeStr ? 'Pendente' : 'Não feita') : 'Programada'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function hora(ts) {
  if (!ts?.toDate) return '';
  return 'às ' + ts.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
