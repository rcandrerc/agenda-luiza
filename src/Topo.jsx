import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import Instalar from './Instalar';

export default function Topo({ titulo, feitas, total, semProgresso }) {
  const pct = total ? Math.round((feitas / total) * 100) : 0;
  const data = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <header className="topo">
      <div className="topo-linha">
        <span className="data">{data}</span>
        <div className="topo-botoes">
          <Instalar />
          <button className="sair" onClick={() => signOut(auth)}>Sair</button>
        </div>
      </div>
      <h1>{titulo}</h1>
      {!semProgresso && (
        <div className="progresso">
          <div className="barra"><i style={{ width: `${pct}%` }} /></div>
          <b>{feitas}/{total}</b>
        </div>
      )}
    </header>
  );
}
