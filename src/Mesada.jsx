import { dinheiro } from './dados';

// Quanto já foi ganho na semana, para a Luiza e para os pais.
export default function Mesada({ mesada }) {
  if (!mesada.total) return null;
  const pct = Math.round((mesada.feitas / mesada.total) * 100);
  return (
    <section className="mesada" aria-label="Mesada da semana">
      <div className="mesada-linha">
        <span className="mesada-rotulo">💰 Mesada da semana</span>
        <b>{dinheiro(mesada.ganho)}</b>
      </div>
      <div className="barra"><i style={{ width: `${pct}%` }} /></div>
      <p className="mesada-nota">
        {mesada.feitas} de {mesada.total} caixinhas. Cada uma vale {dinheiro(mesada.porCaixinha)}, e o total da semana é {dinheiro(mesada.maximo)}.
      </p>
    </section>
  );
}
