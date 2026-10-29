import { useState } from 'react';
import { dinheiro, salvarConfigMesada } from './dados';

const LETRAS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const NOMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const SITUACAO = { ok: 'tudo feito', falhou: 'faltou tarefa', hoje: 'em andamento', futuro: 'ainda vem', livre: 'sem tarefas que valem' };
const ICONE = { ok: '✓', falhou: '✕', hoje: '•', futuro: '', livre: '–' };

// Quanto já foi ganho na semana, para a Luiza e para os pais.
export default function Mesada({ mesada }) {
  if (!mesada.total) return null;
  const pct = Math.round((mesada.feitas / mesada.total) * 100);
  const temBonus = mesada.bonus > 0;
  return (
    <section className="mesada" aria-label="Mesada da semana">
      <div className="mesada-linha">
        <span className="mesada-rotulo">💰 Mesada da semana</span>
        <b key={mesada.totalGanho.toFixed(2)} className="mesada-valor">{dinheiro(mesada.totalGanho)}</b>
      </div>
      <div className="barra"><i style={{ width: `${pct}%` }} /></div>
      <div className="mesada-dias">
        {mesada.porDia.map((d, i) => (
          <div key={d.dia} className={`mdia ${d.estado}`} aria-label={`${NOMES[i]}: ${SITUACAO[d.estado]}`}>
            <span>{LETRAS[i]}</span>
            <i aria-hidden="true">{ICONE[d.estado]}</i>
          </div>
        ))}
      </div>
      <p className="mesada-nota">
        {mesada.feitas} de {mesada.total} caixinhas. Cada uma vale {dinheiro(mesada.porCaixinha)}.
        {mesada.seguidos >= 2 && <> 🔥 {mesada.seguidos} dias seguidos.</>}
      </p>
      {temBonus && (
        <p className={`mesada-bonus ${mesada.bonusGanho ? 'conquistado' : ''}`}>
          {mesada.bonusGanho
            ? `🎉 Semana perfeita! Bônus de ${dinheiro(mesada.bonus)} garantido.`
            : mesada.bonusVivo
              ? `🎯 Nenhuma falha até agora. Fechando a semana perfeita, ganha mais ${dinheiro(mesada.bonus)}.`
              : `Faltou tarefa em algum dia, então o bônus fica para a próxima semana. Ainda dá para ganhar até ${dinheiro(mesada.base)}.`}
        </p>
      )}
    </section>
  );
}

// Só para os pais: quanto vale a semana e o bônus.
export function AjustarMesada({ config }) {
  const [aberto, setAberto] = useState(false);
  const [base, setBase] = useState('');
  const [bonus, setBonus] = useState('');
  const [erro, setErro] = useState('');

  function abrir() {
    setBase(String(config.base));
    setBonus(String(config.bonus));
    setErro('');
    setAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    const b = Number(base.replace(',', '.'));
    const x = Number(bonus.replace(',', '.'));
    if (!Number.isFinite(b) || !Number.isFinite(x) || b < 0 || x < 0) {
      setErro('Use só números, a partir de zero.');
      return;
    }
    try {
      await salvarConfigMesada({ base: b, bonus: x });
      setAberto(false);
    } catch {
      setErro('Não deu para salvar agora. Tente de novo.');
    }
  }

  if (!aberto) {
    return <button className="link ajustar" onClick={abrir}>Ajustar valores da mesada ({dinheiro(config.base)} + bônus de {dinheiro(config.bonus)})</button>;
  }
  return (
    <form className="cartao nova" onSubmit={salvar}>
      <label htmlFor="mesada-base">Mesada da semana (R$)</label>
      <input id="mesada-base" inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} required />
      <label htmlFor="mesada-bonus">Bônus se não falhar nenhum dia (R$)</label>
      <input id="mesada-bonus" inputMode="decimal" value={bonus} onChange={(e) => setBonus(e.target.value)} required />
      {erro && <p className="erro">{erro}</p>}
      <button className="botao">Salvar</button>
      <button type="button" className="link" onClick={() => setAberto(false)}>Cancelar</button>
    </form>
  );
}
