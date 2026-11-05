import { deveresParaAmanha } from './dados';

// Faixa vermelha no topo quando algum dever vence amanhã.
export default function AlertaAmanha({ tarefas }) {
  const lista = deveresParaAmanha(tarefas ?? []);
  if (!lista.length) return null;
  return (
    <div className="alerta-amanha" role="alert">
      🚨 {lista.length === 1 ? 'Dever para entregar amanhã:' : `${lista.length} deveres para entregar amanhã:`}
      <ul>{lista.map((t) => <li key={t.id}>{t.nome}</li>)}</ul>
    </div>
  );
}
