import { useState } from 'react';
import Topo from './Topo';
import { DIAS_AULA, aulasDoDia, materias, matizDe } from './horario';

// Horário de aulas: por dia da semana ou por matéria.
export default function Aulas() {
  const [modo, setModo] = useState('dia');
  const hojeNumero = new Date().getDay();
  const lista = materias();
  const [aberta, setAberta] = useState(null);

  return (
    <div className="tela">
      <Topo titulo="Horário de aulas" semProgresso />
      <main className="conteudo">
        <div className="alternar" role="tablist">
          <button role="tab" aria-selected={modo === 'dia'} className={modo === 'dia' ? 'ativa' : ''} onClick={() => setModo('dia')}>Por dia</button>
          <button role="tab" aria-selected={modo === 'materia'} className={modo === 'materia' ? 'ativa' : ''} onClick={() => setModo('materia')}>Por matéria</button>
        </div>

        {modo === 'dia' && (
          <>
            {hojeNumero === 0 || hojeNumero === 6 ? <p className="dica">Hoje não tem aula.</p> : null}
            {DIAS_AULA.map((dia, i) => (
              <section key={dia.numero} className={`grupo dia-aula ${dia.numero === hojeNumero ? 'hoje' : ''}`}>
                <h2>{dia.nome}{dia.numero === hojeNumero && <span className="selo-hoje">Hoje</span>}</h2>
                <div className="lista">
                  {aulasDoDia(i).map((b) => (
                    <div key={`${b.de}-${b.materia}`} className={`aula ${b.materia === 'Recreio' ? 'recreio' : ''}`} style={{ '--h': matizDe(b.materia) }}>
                      <span className="aula-hora">{b.de} – {b.ate}</span>
                      <b>{b.materia}</b>
                      {b.aulas > 1 && <span className="aula-qtd">{b.aulas} aulas</span>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {modo === 'materia' && (
          <div className="lista">
            {lista.map((m) => (
              <div key={m.nome} className="materia" style={{ '--h': matizDe(m.nome) }}>
                <button className="materia-topo" aria-expanded={aberta === m.nome} onClick={() => setAberta(aberta === m.nome ? null : m.nome)}>
                  <b>{m.nome}</b>
                  <span className="materia-dias">{[...new Set(m.dias.map((d) => d.dia.curto))].join(' · ')}</span>
                  <span className="materia-seta" aria-hidden="true">{aberta === m.nome ? '▾' : '▸'}</span>
                </button>
                {aberta === m.nome && (
                  <ul className="materia-detalhe">
                    {m.dias.map((d) => (
                      <li key={d.dia.numero}>
                        <b>{d.dia.nome}</b> {d.de} – {d.ate}{d.aulas > 1 ? ` (${d.aulas} aulas)` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
