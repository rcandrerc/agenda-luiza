import { useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { auth, configurado } from './firebase';
import { MAX_PAIS } from './familia';
import { entrarNaFamilia, limparFotosVencidas, useFamilia } from './dados';
import TelaLuiza from './TelaLuiza';
import TelaPais from './TelaPais';
import Ilustracao from './Ilustracao';
import Calendario from './Calendario';
import Instalar from './Instalar';

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
  if (membro) return <Principal membro={membro} />;
  return <Escolha usuario={usuario} familia={familia} />;
}

// Telas de quem já é da família, com a barra para alternar entre Hoje e Calendário.
function Principal({ membro }) {
  const [aba, setAba] = useState('hoje');
  return (
    <>
      {aba === 'calendario' ? <Calendario />
        : membro.papel === 'filha' ? <TelaLuiza membro={membro} /> : <TelaPais membro={membro} />}
      <nav className="abas" aria-label="Seções">
        <button className={aba === 'hoje' ? 'ativa' : ''} aria-current={aba === 'hoje'} onClick={() => setAba('hoje')}>
          <span aria-hidden="true">✅</span>Hoje
        </button>
        <button className={aba === 'calendario' ? 'ativa' : ''} aria-current={aba === 'calendario'} onClick={() => setAba('calendario')}>
          <span aria-hidden="true">📅</span>Calendário
        </button>
      </nav>
    </>
  );
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
    <Entrada icone="👋" titulo="Quem é você?" texto={`Oi, ${primeiroNome}! Essa escolha é definitiva.`}>
      {erro && <p className="erro">{erro}</p>}
      {filhaLivre && <button className="botao grande" disabled={enviando} onClick={() => escolher('filha')}>Eu sou a Luiza</button>}
      {paisLivres && <button className="botao grande" disabled={enviando} onClick={() => escolher('pais')}>Eu sou o papai ou a mamãe</button>}
      <button className="link" onClick={() => signOut(auth)}>Entrar com outra conta</button>
    </Entrada>
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
        await signInWithRedirect(auth, provedor).catch(() => setErro('Não deu para entrar agora. Tente de novo.'));
      } else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        setErro(`Não deu para entrar agora. Tente de novo. (${e.code ?? 'erro'})`);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Entrada icone="✅" titulo="Tarefas da Lulu">
      <button className="google" disabled={enviando} onClick={entrar}>
        <IconeGoogle />
        {enviando ? 'Entrando…' : 'Entrar com o Google'}
      </button>
      {erro && <p className="erro">{erro}</p>}
      <p className="nota">Acesso só para a família.</p>
      <Instalar className="link" />
    </Entrada>
  );
}

// Moldura das telas de entrada: faixa colorida em cima e as ações embaixo.
function Entrada({ icone, titulo, texto, children }) {
  return (
    <div className="tela entrada">
      <div className="entrada-topo">
        {icone === '✅' ? <Ilustracao /> : <div className="selo-logo" aria-hidden="true">{icone}</div>}
        <h1>{titulo}</h1>
        {texto && <p>{texto}</p>}
      </div>
      <div className="entrada-base">{children}</div>
    </div>
  );
}

function IconeGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
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
