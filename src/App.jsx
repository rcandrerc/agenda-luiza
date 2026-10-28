import { useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { auth, configurado } from './firebase';
import { MAX_PAIS } from './familia';
import { entrarNaFamilia, limparFotosVencidas, useFamilia } from './dados';
import TelaLuiza from './TelaLuiza';
import TelaPais from './TelaPais';

export default function App() {
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => {
    if (!configurado) return;
    return onAuthStateChanged(auth, setUsuario);
  }, []);

  if (!configurado) {
    return (
      <Aviso titulo="Falta ligar no Firebase">
        Crie o arquivo <code>.env</code> com as chaves do projeto Firebase. O passo a passo está no README.
      </Aviso>
    );
  }
  if (usuario === undefined) return <Aviso titulo="Carregando…" />;
  if (!usuario) return <Login />;
  return <Logado usuario={usuario} />;
}

function Logado({ usuario }) {
  const familia = useFamilia();
  const membro = !familia ? null
    : familia.filha.uid === usuario.uid ? { nome: familia.filha.nome, papel: 'filha' }
    : familia.pais[usuario.uid] ? { nome: familia.pais[usuario.uid], papel: 'pais' }
    : null;

  useEffect(() => {
    if (membro) limparFotosVencidas().catch(() => {});
  }, [membro?.papel]);

  if (!familia) return <Aviso titulo="Carregando…" />;
  if (membro) {
    return membro.papel === 'filha' ? <TelaLuiza membro={membro} /> : <TelaPais membro={membro} />;
  }
  return <Escolha usuario={usuario} familia={familia} />;
}

// Primeira vez de cada pessoa: escolhe quem é. Fica definitivo.
function Escolha({ usuario, familia }) {
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const filhaLivre = !familia.filha.uid;
  const paisLivres = Object.keys(familia.pais).length < MAX_PAIS;
  const primeiroNome = (usuario.displayName || usuario.email || 'Pais').split(' ')[0];

  async function escolher(papel) {
    setErro('');
    setEnviando(true);
    try {
      await entrarNaFamilia(usuario.uid, papel, papel === 'filha' ? 'Luiza' : primeiroNome);
    } catch {
      setErro('Essa vaga acabou de ser ocupada. Tente a outra opção.');
    } finally {
      setEnviando(false);
    }
  }

  if (!filhaLivre && !paisLivres) {
    return (
      <Aviso titulo="Família completa">
        As três vagas (Luiza, papai e mamãe) já foram preenchidas, então a conta {usuario.email} não pode entrar.
        <button className="botao" onClick={() => signOut(auth)}>Sair</button>
      </Aviso>
    );
  }
  return (
    <div className="tela centro">
      <div className="cartao login">
        <div className="logo" aria-hidden="true">👋</div>
        <h1>Quem é você?</h1>
        <p>Oi, {primeiroNome}! Essa escolha é definitiva.</p>
        {erro && <p className="erro">{erro}</p>}
        {filhaLivre && <button className="botao" disabled={enviando} onClick={() => escolher('filha')}>Eu sou a Luiza</button>}
        {paisLivres && <button className="botao" disabled={enviando} onClick={() => escolher('pais')}>Eu sou o papai ou a mamãe</button>}
        <button className="sair" onClick={() => signOut(auth)}>Sair</button>
      </div>
    </div>
  );
}

function Login() {
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar() {
    setErro('');
    setEnviando(true);
    const provedor = new GoogleAuthProvider();
    provedor.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provedor);
    } catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, provedor).catch(() => setErro('Não deu para entrar. Tente de novo.'));
      } else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        setErro('Não deu para entrar com o Google. Tente de novo.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela centro">
      <div className="cartao login">
        <div className="logo" aria-hidden="true">✅</div>
        <h1>Tarefas da Luiza</h1>
        {erro && <p className="erro">{erro}</p>}
        <button className="botao" disabled={enviando} onClick={entrar}>{enviando ? 'Entrando…' : 'Entrar com o Google'}</button>
      </div>
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
