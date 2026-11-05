import { useState } from 'react';
import { materias, materiaDoNome, proximaAula } from './horario';
import Topo from './Topo';
import AlertaAmanha from './AlertaAmanha';
import {
  apareceNoDia, atualizarTarefa, calcularMesada, criarTarefa, criarTarefasIniciais, decidirJustificativa, descreverQuando, emojiSugerido, hoje,
  justificarPelosPais, removerTarefa, reordenarTarefas, revisarConclusao, urgenciaPrazo, feitaDeVerdade, useConclusoes, useConfigMesada, useConclusoesSemana, useFotos, useJustificativas, useJustificativasPendentes, useJustificativasSemana, useTarefas,
} from './dados';
import { HORAS_ATE_FOTO_EXPIRAR } from './familia';
import Mesada, { AjustarMesada } from './Mesada';
import { useReordenar } from './Reordenar';

const NOMES_DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const EMOJIS = ['⭐', '🛏️', '🧺', '🐱', '🍎', '🎒', '🪥', '🛁', '🧸', '📚', '✏️', '🌱', '🍽️', '🧹', '🗑️', '🐶'];

export default function TelaPais({ membro }) {
  const dia = hoje();
  const todas = useTarefas();
  const conclusoes = useConclusoes(dia);
  const fotos = useFotos(dia);
  const semana = useConclusoesSemana(dia);
  const justSemana = useJustificativasSemana(dia);
  const justHoje = useJustificativas(dia);
  const pendentes = useJustificativasPendentes();
  const config = useConfigMesada();
  const [ampliada, setAmpliada] = useState(null);
  const decidir = (j, aprovada) => decidirJustificativa(j, aprovada, membro.nome)
    .catch((err) => window.alert(`Não consegui salvar (${err.code ?? err.message}).`));
  const reordenar = useReordenar((todas ?? []).filter((t) => apareceNoDia(t, dia)).map((t) => t.id), (nova) => reordenarTarefas(nova, todas));

  const tarefas = todas && todas.filter((t) => apareceNoDia(t, dia));
  if (!tarefas || !semana || !justSemana || !justHoje || !pendentes || !conclusoes || !fotos) return <div className="tela"><Topo titulo="Dia da Luiza" feitas={0} total={0} /></div>;

  const feitas = tarefas.filter((t) => feitaDeVerdade(conclusoes[t.id]) || justHoje[t.id]?.status === 'aprovada').length;
  const mesada = calcularMesada(todas, semana, dia, justSemana, config);

  return (
    <div className="tela">
      <Topo titulo="Dia da Luiza" feitas={feitas} total={tarefas.length} />
      <main className="conteudo">
        <AlertaAmanha tarefas={todas} />
        <div className="resumo">
          <div className="numero"><b>{feitas}</b><span>feitas</span></div>
          <div className="numero"><b>{tarefas.length - feitas}</b><span>faltando</span></div>
        </div>

        {pendentes.length > 0 && (
          <section className="grupo avisos" aria-label="Motivos para aprovar">
            <h2>🔔 Motivos para aprovar ({pendentes.length})</h2>
            {pendentes.map((j) => {
              const t = todas.find((x) => x.id === j.tarefaId);
              return (
                <div key={j.id} className="cartao aviso">
                  <div className="nome">{t?.emoji} {t?.nome ?? 'Tarefa removida'} <span className="detalhe">({j.dia.split('-').reverse().join('/')})</span></div>
                  <p className="motivo-texto">“{j.motivo}”</p>
                  <div className="aviso-botoes">
                    <button className="botao" onClick={() => decidir(j, true)}>Aceitar</button>
                    <button className="botao recusar" onClick={() => decidir(j, false)}>Recusar</button>
                  </div>
                  {t?.vale && <p className="dica">Se aceitar, conta na mesada como feita.</p>}
                </div>
              );
            })}
          </section>
        )}

        <Mesada mesada={mesada} />
        <AjustarMesada config={config} />

        <section className="grupo">
          <h2>Tarefas de hoje</h2>
          <p className="dica">As fotos somem sozinhas {HORAS_ATE_FOTO_EXPIRAR} horas depois de enviadas.</p>
          {tarefas.length > 1 && <p className="dica">Segure uma tarefa e arraste para mudar a ordem.</p>}
          {tarefas.length === 0 ? (
            <div className="vazio">
              <p>Ainda não tem nenhuma tarefa.</p>
              <button className="botao" onClick={criarTarefasIniciais}>Criar as tarefas de sempre</button>
            </div>
          ) : (
            <div className="lista">
              {tarefas.map((t) => <ItemTarefa key={t.id} t={t} c={conclusoes[t.id]} foto={fotos[conclusoes[t.id]?.fotoId]} aoAmpliar={setAmpliada} revisor={membro.nome} just={justHoje[t.id]} deHoje arrasto={reordenar.propsDe(t.id, 'linha')} />)}
            </div>
          )}
        </section>

        {todas.some((t) => !apareceNoDia(t, dia)) && (
          <section className="grupo">
            <h2>Outras tarefas</h2>
            <p className="dica">Não aparecem hoje, mas já estão programadas.</p>
            <div className="lista">
              {todas.filter((t) => !apareceNoDia(t, dia)).map((t) => <ItemTarefa key={t.id} t={t} />)}
            </div>
          </section>
        )}

        <NovaTarefa dia={dia} />
      </main>

      {ampliada && (
        <div className="ampliada" onClick={() => setAmpliada(null)} role="dialog" aria-label={`Foto de ${ampliada.tarefa.nome}`}>
          <img src={ampliada.foto.imagem} alt={`Foto de ${ampliada.tarefa.nome}`} />
          <p>{ampliada.tarefa.emoji} {ampliada.tarefa.nome}, enviada {dataHora(ampliada.foto.criadaEm)}. Toque para fechar.</p>
          {ampliada.conclusao && (
            <div onClick={(e) => e.stopPropagation()}>
              <BotoesRevisao c={ampliada.conclusao} tarefaId={ampliada.tarefa.id} revisor={membro.nome} aoTerminar={() => setAmpliada(null)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ItemTarefa({ t, c, foto, aoAmpliar, revisor, just, deHoje, arrasto }) {
  const [editando, setEditando] = useState(false);
  return (
    <>
      <div className="linha" {...arrasto}>
        <span className="emoji" aria-hidden="true">{t.emoji}</span>
        <div className="linha-texto">
          <div className="nome">{t.nome}</div>
          <span className={`etiqueta ${t.categoria}`}>{t.categoria === 'escola' ? 'Escola' : 'Casa'}</span>
          <span className={`etiqueta ${urgenciaPrazo(t) ? `prazo-${urgenciaPrazo(t)}` : ''}`}>{descreverQuando(t)}</span>
          {t.vale && <span className="etiqueta">💰 Vale dinheiro</span>}
          <button className="editar" onClick={() => setEditando(!editando)}>{editando ? 'Fechar' : 'Editar'}</button>
        </div>
        {deHoje && <span className={`selo ${feitaDeVerdade(c) ? 'ok' : c ? 'ruim' : ''}`}>{!c ? (just?.status === 'aprovada' ? 'Justificada' : 'Pendente') : c.revisao === 'devolvida' ? 'Refazer' : c.revisao === 'aprovada' ? 'Aprovada ✓' : `Feita ${hora(c.feitaEm)}`}</span>}
        <button className="remover" onClick={() => removerTarefa(t.id)} aria-label={`Remover ${t.nome}`}>×</button>
      </div>
      {foto && (
        <div className="fotos foto-da-tarefa">
          <button className="foto" onClick={() => aoAmpliar({ tarefa: t, foto, conclusao: c })}>
            <img src={foto.imagem} alt={`Foto de ${t.nome}`} />
            <span className="foto-data">{dataHora(foto.criadaEm)}</span>
          </button>
        </div>
      )}
      {deHoje && !c && !(just?.status === 'aprovada') && (
        <div className="revisao">
          <button className="botao pequeno recusar" onClick={() => justificarPelosPais(t.id, hoje())}>✎ Justificar (não desconta, perde o bônus)</button>
        </div>
      )}
      {deHoje && c && <BotoesRevisao c={c} tarefaId={t.id} revisor={revisor} />}
      {editando && <EditorTarefa t={t} aoSalvar={() => setEditando(false)} />}
    </>
  );
}

// Os pais olham a foto e aprovam, ou mandam a Luiza refazer (a tarefa deixa de contar na mesada).
function BotoesRevisao({ c, tarefaId, revisor, aoTerminar }) {
  async function revisar(resultado) {
    await revisarConclusao(tarefaId, c.dia, resultado, revisor);
    aoTerminar?.();
  }
  return (
    <div className="revisao">
      {c.revisao !== 'aprovada' && <button className="botao pequeno" onClick={() => revisar('aprovada')}>👍 Aprovar</button>}
      {c.revisao !== 'devolvida' && <button className="botao pequeno recusar" onClick={() => revisar('devolvida')}>↩️ Refazer</button>}
    </div>
  );
}

function EditorTarefa({ t, aoSalvar }) {
  const [vale, setVale] = useState(Boolean(t.vale));
  const [dias, setDias] = useState(t.dias?.length ? t.dias : [0, 1, 2, 3, 4, 5, 6]);
  const [prazo, setPrazo] = useState(t.prazo ?? '');
  const umDia = Boolean(t.data);
  const comPrazo = Boolean(t.prazo);

  async function salvar() {
    if (comPrazo) await atualizarTarefa(t.id, { prazo });
    else if (umDia) await atualizarTarefa(t.id, { vale });
    else if (dias.length > 0) await atualizarTarefa(t.id, { vale, dias: [...dias].sort(), diaria: true });
    else return;
    aoSalvar();
  }

  return (
    <div className="editor">
      {comPrazo && (
        <label className="campo">Entregar até
          <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} required />
        </label>
      )}
      {!umDia && !comPrazo && <SeletorDias dias={dias} setDias={setDias} />}
      {!comPrazo && <label className="marca"><input type="checkbox" checked={vale} onChange={(e) => setVale(e.target.checked)} /> Vale dinheiro (entra na mesada)</label>}
      <button className="botao" onClick={salvar}>Salvar</button>
    </div>
  );
}

function SeletorDias({ dias, setDias }) {
  return (
    <div className="dias" role="group" aria-label="Dias da semana">
      {NOMES_DIAS.map((n, i) => (
        <button type="button" key={n} aria-pressed={dias.includes(i)}
          className={dias.includes(i) ? 'escolhido' : ''}
          onClick={() => setDias(dias.includes(i) ? dias.filter((x) => x !== i) : [...dias, i])}>{n}</button>
      ))}
    </div>
  );
}

function NovaTarefa({ dia }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('casa');
  const [tipo, setTipo] = useState('semana'); // semana, dia ou prazo
  const [dias, setDias] = useState([1, 2, 3, 4, 5]);
  const [data, setData] = useState(dia);
  const [prazo, setPrazo] = useState(dia);
  const [inicio, setInicio] = useState(dia);
  const [vale, setVale] = useState(false);
  const [emoji, setEmoji] = useState(null);
  const [materia, setMateria] = useState('');
  const [materiaManual, setMateriaManual] = useState(false);
  const listaMaterias = materias().map((m) => m.nome);
  const emojiFinal = emoji ?? emojiSugerido(nome);

  // Escolhe a matéria e já coloca o prazo na próxima aula dela.
  function escolherMateria(m) {
    setMateria(m);
    // O nome já vem com a matéria (ex.: "Matemática: "), só falta escrever as páginas.
    // Não mexe se a pessoa já escreveu outra coisa.
    setNome((atual) => {
      const vazio = !atual.trim() || listaMaterias.some((x) => atual.trim() === `${x}:`);
      return vazio ? (m ? `${m}: ` : '') : atual;
    });
    if (m) {
      setTipo('prazo');
      const proxima = proximaAula(m, dia);
      if (proxima) setPrazo(proxima);
    }
  }

  function mudarNome(valor) {
    setNome(valor);
    if ((tipo === 'prazo' || categoria === 'escola') && !materiaManual) {
      const achada = materiaDoNome(valor);
      if (achada) escolherMateria(achada);
      else setMateria('');
    }
  }

  async function adicionar(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    if (tipo === 'semana' && dias.length === 0) return;
    await criarTarefa({
      nome: nome.trim(), emoji: emojiFinal, categoria, vale,
      dias: tipo === 'semana' ? [...dias].sort() : null,
      data: tipo === 'dia' ? data : null,
      prazo: tipo === 'prazo' ? prazo : null,
      inicio: tipo === 'prazo' && inicio < prazo ? inicio : tipo === 'prazo' ? prazo : null,
    });
    setNome('');
    setEmoji(null);
    setMateria('');
    setMateriaManual(false);
  }

  return (
    <section className="grupo">
      <h2>Nova tarefa</h2>
      <form className="cartao nova" onSubmit={adicionar}>
        <input id="nova-nome" placeholder="Ex.: Escovar os dentes" value={nome} onChange={(e) => mudarNome(e.target.value)} required />
        <div className="opcoes">
          <select id="nova-categoria" value={categoria} onChange={(e) => { setCategoria(e.target.value); if (e.target.value !== 'escola' && tipo !== 'prazo') setMateria(''); }} aria-label="Categoria">
            <option value="casa">Casa</option>
            <option value="escola">Escola</option>
          </select>
          <select id="nova-frequencia" value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Frequência">
            <option value="semana">Dias da semana</option>
            <option value="dia">Um dia só</option>
            <option value="prazo">Até uma data (prazo)</option>
          </select>
        </div>
        {(categoria === 'escola' || tipo === 'prazo') && (
        <label className="campo">Matéria (o prazo vira a próxima aula dela)
              <select id="nova-materia" value={materia} onChange={(e) => { setMateriaManual(true); escolherMateria(e.target.value); }}>
                <option value="">Nenhuma, escolho a data</option>
                {listaMaterias.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
        )}
        {tipo === 'semana' && <SeletorDias dias={dias} setDias={setDias} />}
        {tipo === 'dia' && (
          <input id="nova-data" type="date" value={data} min={dia} onChange={(e) => setData(e.target.value)} required aria-label="Dia da tarefa" />
        )}
        {tipo === 'prazo' && (
          <>
            <label className="campo">Entregar até
              <input id="novo-prazo" type="date" value={prazo} min={dia} onChange={(e) => setPrazo(e.target.value)} required />
            </label>
            <label className="campo">Aparecer para a Luiza a partir de
              <input id="novo-inicio" type="date" value={inicio} min={dia} onChange={(e) => setInicio(e.target.value)} required />
            </label>
            {materia && <p className="dica">Próxima aula de {materia}: {new Date(`${prazo}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}. Dá para ajustar a data se precisar.</p>}
            <p className="dica">Ela vê todo dia até marcar como feita. Depois some.</p>
          </>
        )}
        {tipo !== 'prazo' && <label className="marca"><input type="checkbox" checked={vale} onChange={(e) => setVale(e.target.checked)} /> Vale dinheiro (entra na mesada)</label>}
        <div className="emojis" role="radiogroup" aria-label="Emoji">
          {EMOJIS.map((em) => (
            <button type="button" key={em} role="radio" aria-checked={em === emojiFinal}
              className={em === emojiFinal ? 'escolhido' : ''} onClick={() => setEmoji(em)}>{em}</button>
          ))}
        </div>
        <button className="botao">Adicionar {emojiFinal}</button>
      </form>
    </section>
  );
}

function hora(ts) {
  if (!ts?.toDate) return '';
  return 'às ' + ts.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function dataHora(ts) {
  if (!ts?.toDate) return '';
  const d = ts.toDate();
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
