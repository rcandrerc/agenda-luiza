import { useState } from 'react';
import Topo from './Topo';
import {
  criarTarefa, criarTarefasIniciais, emojiSugerido, hoje, removerTarefa,
  useConclusoes, useFotos, useTarefasDoDia,
} from './dados';
import { HORAS_ATE_FOTO_EXPIRAR } from './familia';

const EMOJIS = ['⭐', '🛏️', '🧺', '🐱', '🍎', '🎒', '🪥', '🛁', '🧸', '📚', '✏️', '🌱', '🍽️', '🧹', '🗑️', '🐶'];

export default function TelaPais() {
  const dia = hoje();
  const tarefas = useTarefasDoDia(dia);
  const conclusoes = useConclusoes(dia);
  const fotos = useFotos(dia);
  const [ampliada, setAmpliada] = useState(null);

  if (!tarefas || !conclusoes || !fotos) return <div className="tela"><Topo titulo="Dia da Luiza" feitas={0} total={0} /></div>;

  const feitas = tarefas.filter((t) => conclusoes[t.id]).length;
  const comFoto = tarefas.filter((t) => fotos[conclusoes[t.id]?.fotoId]);

  return (
    <div className="tela">
      <Topo titulo="Dia da Luiza" feitas={feitas} total={tarefas.length} />
      <main className="conteudo">
        <div className="resumo">
          <div className="numero"><b>{feitas}</b><span>feitas</span></div>
          <div className="numero"><b>{tarefas.length - feitas}</b><span>faltando</span></div>
        </div>

        <section className="grupo">
          <h2>Tarefas de hoje</h2>
          {tarefas.length === 0 ? (
            <div className="vazio">
              <p>Ainda não tem nenhuma tarefa.</p>
              <button className="botao" onClick={criarTarefasIniciais}>Criar as tarefas de sempre</button>
            </div>
          ) : (
            <div className="lista">
              {tarefas.map((t) => {
                const c = conclusoes[t.id];
                return (
                  <div key={t.id} className="linha">
                    <span className="emoji" aria-hidden="true">{t.emoji}</span>
                    <div className="linha-texto">
                      <div className="nome">{t.nome}</div>
                      <span className={`etiqueta ${t.categoria}`}>{t.categoria === 'escola' ? 'Escola' : 'Casa'}</span>
                      {!t.diaria && <span className="etiqueta">Só hoje</span>}
                    </div>
                    <span className={`selo ${c ? 'ok' : ''}`}>{c ? `Feita ${hora(c.feitaEm)}` : 'Pendente'}</span>
                    <button className="remover" onClick={() => removerTarefa(t.id)} aria-label={`Remover ${t.nome}`}>×</button>
                  </div>
                );
              })}
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

function NovaTarefa({ dia }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('casa');
  const [diaria, setDiaria] = useState(true);
  const [emoji, setEmoji] = useState(null);
  const emojiFinal = emoji ?? emojiSugerido(nome);

  async function adicionar(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    await criarTarefa({ nome: nome.trim(), emoji: emojiFinal, categoria, diaria, dia });
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
          <select id="nova-frequencia" value={diaria ? 'diaria' : 'hoje'} onChange={(e) => setDiaria(e.target.value === 'diaria')} aria-label="Frequência">
            <option value="diaria">Todo dia</option>
            <option value="hoje">Só hoje</option>
          </select>
        </div>
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
