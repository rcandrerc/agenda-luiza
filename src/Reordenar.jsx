import { useEffect, useRef, useState } from 'react';

const ESPERA_MS = 350;
const TOLERANCIA_PX = 8;

// Segurar uma linha por um instante e arrastar para cima ou para baixo.
// `ids` é a ordem atual; `aoMudar` recebe a nova ordem quando a linha é solta.
// Funciona com o dedo e com o mouse.
export function useReordenar(ids, aoMudar) {
  const [arrasto, setArrasto] = useState(null); // { id, dy, alvo }
  const atual = useRef(null);
  const ultimo = useRef({ ids, aoMudar });
  ultimo.current = { ids, aoMudar };

  function limpar() {
    const s = atual.current;
    if (!s) return;
    clearTimeout(s.timer);
    cancelAnimationFrame(s.raf);
    window.removeEventListener('pointermove', mover);
    window.removeEventListener('pointerup', soltar);
    window.removeEventListener('pointercancel', cancelar);
    document.removeEventListener('touchmove', bloquear);
    atual.current = null;
    setArrasto(null);
  }

  function bloquear(e) {
    if (e.cancelable) e.preventDefault();
  }

  function atualizar() {
    const s = atual.current;
    if (!s?.ativo) return;
    const y = s.y + window.scrollY;
    const dy = y - (s.startY + s.startScroll);
    const outros = s.linhas.filter((l) => l.id !== s.id);
    const alvo = outros.filter((l) => l.meio < y).length;
    s.alvo = alvo;
    setArrasto({ id: s.id, dy, alvo });
  }

  // Rola a tela sozinha quando o dedo chega perto da borda.
  function rolar() {
    const s = atual.current;
    if (!s?.ativo) return;
    const borda = 90;
    if (s.y < borda) window.scrollBy(0, -12);
    else if (s.y > window.innerHeight - borda) window.scrollBy(0, 12);
    atualizar();
    s.raf = requestAnimationFrame(rolar);
  }

  function ativar() {
    const s = atual.current;
    if (!s) return;
    s.ativo = true;
    navigator.vibrate?.(25);
    s.linhas = [...s.lista.querySelectorAll('[data-reordenar]')].map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.dataset.reordenar, meio: r.top + window.scrollY + r.height / 2 };
    });
    document.addEventListener('touchmove', bloquear, { passive: false });
    s.raf = requestAnimationFrame(rolar);
    atualizar();
  }

  function mover(e) {
    const s = atual.current;
    if (!s) return;
    s.y = e.clientY;
    if (!s.ativo) {
      if (Math.hypot(e.clientX - s.startX, e.clientY - s.startY) > TOLERANCIA_PX) limpar();
      return;
    }
    atualizar();
  }

  function soltar() {
    const s = atual.current;
    if (!s) return;
    if (s.ativo) {
      const outros = s.linhas.map((l) => l.id).filter((id) => id !== s.id);
      outros.splice(s.alvo, 0, s.id);
      const antes = s.linhas.map((l) => l.id);
      if (outros.some((id, i) => id !== antes[i])) ultimo.current.aoMudar(outros);
    }
    limpar();
  }

  function cancelar() {
    limpar();
  }

  function iniciar(e, id) {
    if (e.button > 0 || atual.current) return;
    if (e.target.closest('button, a, input, select, label')) return;
    atual.current = {
      id, startX: e.clientX, startY: e.clientY, startScroll: window.scrollY, y: e.clientY,
      ativo: false, lista: e.currentTarget.parentElement, linhas: [], alvo: 0, raf: 0,
      timer: setTimeout(ativar, ESPERA_MS),
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', cancelar);
  }

  useEffect(() => limpar, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Propriedades para espalhar na linha de cada item.
  function propsDe(id, classe = '') {
    const outros = arrasto ? ultimo.current.ids.filter((i) => i !== arrasto.id) : [];
    const pos = outros.indexOf(id);
    let marca = '';
    if (arrasto && id !== arrasto.id) {
      if (pos === arrasto.alvo) marca = ' alvo';
      else if (pos === outros.length - 1 && arrasto.alvo === outros.length) marca = ' alvo-fim';
    }
    const arrastado = arrasto?.id === id;
    return {
      'data-reordenar': id,
      className: `${classe}${marca}${arrastado ? ' arrastando' : ''}`,
      style: arrastado ? { transform: `translateY(${arrasto.dy}px)` } : undefined,
      onPointerDown: (e) => iniciar(e, id),
      onContextMenu: (e) => { if (arrasto) e.preventDefault(); },
    };
  }

  return { propsDe, arrastando: Boolean(arrasto) };
}
