import { useEffect, useState } from 'react';

// O navegador avisa uma vez só (e talvez antes do app abrir), então o aviso
// é guardado aqui para o botão poder usar quando quiser.
let aviso = null;
const ouvintes = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    aviso = e;
    ouvintes.forEach((f) => f());
  });
  window.addEventListener('appinstalled', () => {
    aviso = null;
    ouvintes.forEach((f) => f());
  });
}

const jaInstalado = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

// Botão "Instalar o app". Usa a janela de instalação do navegador quando ela
// existe; senão mostra o passo a passo para o celular.
export default function Instalar({ className = 'sair' }) {
  const [, atualizar] = useState(0);
  const [ajuda, setAjuda] = useState(false);

  useEffect(() => {
    const f = () => atualizar((n) => n + 1);
    ouvintes.add(f);
    return () => ouvintes.delete(f);
  }, []);

  if (jaInstalado()) return null;

  async function instalar() {
    if (!aviso) return setAjuda(true);
    aviso.prompt();
    await aviso.userChoice.catch(() => {});
    aviso = null;
    atualizar((n) => n + 1);
  }

  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return (
    <>
      <button className={className} onClick={instalar}>📲 Instalar o app</button>
      {ajuda && (
        <div className="ampliada" onClick={() => setAjuda(false)} role="dialog" aria-label="Como instalar o app">
          <div className="passos" onClick={(e) => e.stopPropagation()}>
            <h2>Instalar no celular</h2>
            {ios ? (
              <ol>
                <li>Abra este endereço no <b>Safari</b>.</li>
                <li>Toque no botão <b>Compartilhar</b> (quadrado com seta para cima).</li>
                <li>Escolha <b>Adicionar à Tela de Início</b>.</li>
              </ol>
            ) : (
              <ol>
                <li>Abra este endereço no <b>Chrome</b>.</li>
                <li>Toque nos <b>3 pontinhos ⋮</b>, no canto de cima.</li>
                <li>Escolha <b>Instalar app</b> (ou <b>Adicionar à tela inicial</b>).</li>
              </ol>
            )}
            <button className="botao" onClick={() => setAjuda(false)}>Entendi</button>
          </div>
        </div>
      )}
    </>
  );
}
