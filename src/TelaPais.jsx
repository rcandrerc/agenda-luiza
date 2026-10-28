import { useState } from 'react';
import Topo from './Topo';
import {
  apareceNoDia, atualizarTarefa, calcularMesada, criarTarefa, criarTarefasIniciais, descreverQuando, emojiSugerido, hoje,
  removerTarefa, reordenarTarefas, useConclusoes, useConclusoesSemana, useFotos, useTarefas,
} from './dados';
import { HORAS_ATE_FOTO_EXPIRAR } from './familia';
import Mesada from './Mesada';
import { useReordenar } from './Reordenar';

const NOMES_DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const EMOJIS = ['⭐', '🛏️', '🧺', '🐱', '🍎', '🎒', '🪥', '🛁', '🧸', '📚', '✏️', '🌱', '🍽️', '🧹', '🗑️', '🐶'];

export default function TelaPais() {
  const dia = hoje();
  const todas = useTarefas();
  const conclusoes = useConclusoes(dia);
  const fotos = useFotos(dia);
  const semana = useConclusoesSemana(dia);
  const [ampliada, setAmpliada] = useState(null);
  const reordenar = useReordenar((todas ?? []).filter((t) => apareceNoDia(t, dia)).map((t) => t.id), (nova) => reordenarTarefas(nova, todas));

  const tarefas = todas && todas.filter((t) => apareceNoDia(t, dia));
  if (!tarefas || !semana || !conclusoes || !fotos) return <div className="tela"><Topo titulo="Dia da Luiza" feitas={0} total={0} /></div>;

  const feitas = tarefas.filter((t) => conclusoes[t.id]).length;
  const mesada = calcularMesada(todas, semana, dia);
  const comFoto = tarefas.filter((t) => fotos[conclusoes[t.id]?.fotoId]);

  return (
    <div className="tela">
      <Topo titulo="Dia da Luiza" feitas={feitas} total={tarefas.length} />
      <main className="conteudo">
        <div className="resumo">
          <div className="numero"><b>{feitas}</b><span>feitas</span></div>
          <div className="numero"><b>{tarefas.length - feitas}</b><span>faltando</span></div>
        </div>

        <Mesada mesada={mesada} />

        <section className="grupo">
          <h2>Tarefas de hoje</h2>
          {tarefas.length > 1 && <p className="dica">Segure uma tarefa e arraste para mudar a ordem.</p>}
          {tarefas.length === 0 ? (
            <div className="vazio">
              <p>Ainda não tem nenhuma tarefa.</p>
              <button className="botao" onClick={criarTarefasIniciais}>Criar as tarefas de sempre</button>
            </div>
          ) : (
            <div className="lista">
              {tarefas.map((t) => <ItemTarefa key={t.id} t={t} c={conclusoes[t.id]} deHoje arrasto={reordenar.propsDe(t.id, 'linha')} />)}
            </div>
          )}
        </section>

        <section className="grupo">
          <h2>Fotos de hoje</h2>
          <p className="dica">As fotos somem sozinhas {HORAS_ATE_FOTO_EXPIRAR} horas depois de enviadas.</p>
          <div className="fotos">
            {comFoto.length === 0 && <div className="foto vazia">Nenhuma foto ainda</div>}
            {comFoto.map((t) => {
              const f = fotos[conclusoes[t.id].fotoId];
              return (
                <button key={t.id} className="foto" onClick={() => setAmpliada({ tarefa: t, foto: f })}>
                  <img src={f.imagem} alt={`Foto de ${t.nome}`} />
                </button>
              );
            })}
          </div>
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
          <p>{ampliada.tarefa.emoji} {ampliada.tarefa.nome}. Toque para fechar.</p>
        </div>
      )}
    </div>
  );
}

function ItemTarefa({ t, c, deHoje, arrasto }) {
  const [editando, setEditando] = useState(false);
  return (
    <>
      <div className="linha" {...arrasto}>
        <span className="emoji" aria-hidden="true">{t.emoji}</span>
        <div className="linha-texto">
          <div className="nome">{t.nome}</div>
          <span className={`etiqueta ${t.categoria}`}>{t.categoria === 'escola' ? 'Escola' : 'Casa'}</span>
          <span className="etiqueta">{descreverQuando(t)}</span>
          {t.vale && <span className="etiqueta">💰 Vale dinheiro</span>}
          <button className="editar" onClick={() => setEditando(!editando)}>{editando ? 'Fechar' : 'Editar'}</button>
        </div>
        {deHoje && <span className={`selo ${c ? 'ok' : ''}`}>{c ? `Feita ${hora(c.feitaEm)}` : 'Pendente'}</span>}
        <button className="remover" onClick={() => removerTarefa(t.id)} aria-label={`Remover ${t.nome}`}>×</button>
      </div>
      {editando && <EditorTarefa t={t} aoSalvar={() => setEditando(false)} />}
    </>
  );
}

function EditorTarefa({ t, aoSalvar }) {
  const [vale, setVale] = useState(Boolean(t.vale));
  const [dias, setDias] = useState(t.dias?.length ? t.dias : [0, 1, 2, 3, 4, 5, 6]);
  const umDia = Boolean(t.data);

  async function salvar() {
    if (!umDia && dias.length === 0) return;
    await atualizarTarefa(t.id, umDia ? { vale } : { vale, dias: [...dias].sort(), diaria: true });
    aoSalvar();
  }

  return (
    <div className="editor">
      {!umDia && <SeletorDias dias={dias} setDias={setDias} />}
      <label className="marca"><input type="checkbox" checked={vale} onChange={(e) => setVale(e.target.checked)} /> Vale dinheiro (entra na mesada)</label>
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
  const [repete, setRepete] = useState(true);
  const [dias, setDias] = useState([1, 2, 3, 4, 5]);
  const [data, setData] = useState(dia);
  const [vale, setVale] = useState(false);
  const [emoji, setEmoji] = useState(null);
  const emojiFinal = emoji ?? emojiSugerido(nome);

  async function adicionar(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    if (repete && dias.length === 0) return;
    await criarTarefa({
      nome: nome.trim(), emoji: emojiFinal, categoria,
      dias: repete ? [...dias].sort() : null, data: repete ? null : data, vale,
    });
    setNome('');
    setEmoji(null);
  }

  return (
    <section className="grupo">
      <h2>Nova tarefa</h2>
      <form className="cartao nova" onSubmit={adicionar}>
        <input id="nova-nome" placeholder="Ex.: Escovar os dentes" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <div className="opcoes">
          <select id="nova-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoria">
            <option value="casa">Casa</option>
            <option value="escola">Escola</option>
          </select>
          <select id="nova-frequencia" value={repete ? 'semana' : 'dia'} onChange={(e) => setRepete(e.target.value === 'semana')} aria-label="Frequência">
            <option value="semana">Dias da semana</option>
            <option value="dia">Um dia só</option>
          </select>
        </div>
        {repete ? (
          <SeletorDias dias={dias} setDias={setDias} />
        ) : (
          <input id="nova-data" type="date" value={data} min={dia} onChange={(e) => setData(e.target.value)} required aria-label="Dia da tarefa" />
        )}
        <label className="marca"><input type="checkbox" checked={vale} onChange={(e) => setVale(e.target.checked)} /> Vale dinheiro (entra na mesada)</label>
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
