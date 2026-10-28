import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, configurado } from './firebase';
import { membroPorEmail } from './familia';
import { limparFotosVencidas } from './dados';
import TelaLuiza from './TelaLuiza';
import TelaPais from './TelaPais';

export default function App() {
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => {
    if (!configurado) return;
    return onAuthStateChanged(auth, setUsuario);
  }, []);

  const membro = membroPorEmail(usuario?.email);

  useEffect(() => {
    if (membro) limparFotosVencidas().catch(() => {});
  }, [membro]);

  if (!configurado) {
    return (
      <Aviso titulo="Falta ligar no Firebase">
        Crie o arquivo <code>.env</code> com as chaves do projeto Firebase. O passo a passo está no README.
      </Aviso>
    );
  }
  if (usuario === undefined) return <Aviso titulo="Carregando…" />;
  if (!usuario) return <Login />;
  if (!membro) {
    return (
      <Aviso titulo="Conta não reconhecida">
        O e-mail {usuario.email} não está na lista da família (arquivo <code>src/familia.js</code>).
        <button className="botao" onClick={() => signOut(auth)}>Sair</button>
      </Aviso>
    );
  }
  return membro.papel === 'filha' ? <TelaLuiza membro={membro} /> : <TelaPais membro={membro} />;
}

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch {
      setErro('E-mail ou senha não conferem. Confira e tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela centro">
      <form className="cartao login" onSubmit={entrar}>
        <div className="logo" aria-hidden="true">✅</div>
        <h1>Tarefas da Luiza</h1>
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="senha">Senha</label>
        <input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        {erro && <p className="erro">{erro}</p>}
        <button className="botao" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  );
}

function Aviso({ titulo, children }) {
  return (
    <div className="tela centro">
      <div className="cartao login">
        <h1>{titulo}</h1>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}
