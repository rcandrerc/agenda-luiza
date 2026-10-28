import { useEffect, useState } from 'react';
import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query,
  runTransaction, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { HORAS_ATE_FOTO_EXPIRAR, MAX_PAIS, TAREFAS_INICIAIS } from './familia';

// Coleções no Firestore:
//   config/familia       { filha: {uid, nome} ou {}, pais: {uid: nome} }
//   tarefas/{id}         { nome, emoji, categoria, detalhe, diaria, data, ativa, criadaEm }
//   conclusoes/{dia_id}  { tarefaId, dia, feitaEm, fotoId }
//   fotos/{id}           { imagem (data URL), tarefaId, dia, criadaEm, expiraEm }

export function hoje() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function useColecao(q, deps) {
  const [itens, setItens] = useState(null);
  useEffect(() => {
    return onSnapshot(q(), (snap) => setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return itens;
}

export function useTarefasDoDia(dia) {
  const tarefas = useColecao(() => query(collection(db, 'tarefas'), where('ativa', '==', true)), []);
  if (!tarefas) return null;
  return tarefas
    .filter((t) => t.diaria || t.data === dia)
    .sort((a, b) => (a.criadaEm?.seconds ?? 0) - (b.criadaEm?.seconds ?? 0));
}

export function useConclusoes(dia) {
  const lista = useColecao(() => query(collection(db, 'conclusoes'), where('dia', '==', dia)), [dia]);
  if (!lista) return null;
  return Object.fromEntries(lista.map((c) => [c.tarefaId, c]));
}

export function useFotos(dia) {
  const lista = useColecao(() => query(collection(db, 'fotos'), where('dia', '==', dia)), [dia]);
  if (!lista) return null;
  const agora = Date.now();
  return Object.fromEntries(
    lista.filter((f) => f.expiraEm?.toMillis() > agora).map((f) => [f.id, f]),
  );
}

export async function marcar(tarefaId, dia) {
  await setDoc(doc(db, 'conclusoes', `${dia}_${tarefaId}`), {
    tarefaId, dia, feitaEm: serverTimestamp(), fotoId: null,
  });
}

export async function desmarcar(tarefaId, dia, conclusao) {
  if (conclusao?.fotoId) await deleteDoc(doc(db, 'fotos', conclusao.fotoId)).catch(() => {});
  await deleteDoc(doc(db, 'conclusoes', `${dia}_${tarefaId}`));
}

export async function enviarFoto(tarefaId, dia, arquivo, conclusao) {
  const imagem = await comprimir(arquivo);
  const expiraEm = Timestamp.fromMillis(Date.now() + HORAS_ATE_FOTO_EXPIRAR * 3600 * 1000);
  const ref = await addDoc(collection(db, 'fotos'), {
    imagem, tarefaId, dia, criadaEm: serverTimestamp(), expiraEm,
  });
  if (conclusao?.fotoId) await deleteDoc(doc(db, 'fotos', conclusao.fotoId)).catch(() => {});
  // Mandar foto já conta como tarefa feita.
  await setDoc(doc(db, 'conclusoes', `${dia}_${tarefaId}`), {
    tarefaId, dia, feitaEm: serverTimestamp(), fotoId: ref.id,
  });
}

// Apaga as fotos vencidas. Roda sempre que alguém abre o app, então o banco
// não acumula fotos antigas mesmo sem nenhuma regra extra no Firebase.
export async function limparFotosVencidas() {
  const snap = await getDocs(query(collection(db, 'fotos'), where('expiraEm', '<', Timestamp.now())));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref).catch(() => {})));
}

export async function criarTarefa({ nome, emoji, categoria, diaria, dia }) {
  await addDoc(collection(db, 'tarefas'), {
    nome, emoji, categoria, detalhe: diaria ? 'Todo dia' : 'Só hoje',
    diaria, data: diaria ? null : dia, ativa: true, criadaEm: serverTimestamp(),
  });
}

export async function removerTarefa(id) {
  await updateDoc(doc(db, 'tarefas', id), { ativa: false });
}

export async function criarTarefasIniciais() {
  const lote = writeBatch(db);
  const agora = Date.now();
  TAREFAS_INICIAIS.forEach((t, i) => {
    lote.set(doc(collection(db, 'tarefas')), {
      ...t, diaria: true, data: null, ativa: true, criadaEm: Timestamp.fromMillis(agora + i),
    });
  });
  await lote.commit();
}

// Reduz a foto para no máximo 1024px e ~300 KB antes de enviar.
async function comprimir(arquivo) {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let qualidade = 0.7;
  let url = canvas.toDataURL('image/jpeg', qualidade);
  while (url.length > 400_000 && qualidade > 0.3) {
    qualidade -= 0.1;
    url = canvas.toDataURL('image/jpeg', qualidade);
  }
  return url;
}

export function emojiSugerido(nome) {
  const n = nome.toLowerCase();
  const regras = [
    [/dente|escova/, '🪥'], [/banho/, '🛁'], [/brinquedo/, '🧸'], [/livro|ler|leitura/, '📚'],
    [/dever|lição|tarefa da escola/, '✏️'], [/planta|regar/, '🌱'], [/yuki|nala|gat/, '🐱'],
    [/cachorro|cão/, '🐶'], [/lancheira|lanche/, '🍎'], [/mochila/, '🎒'], [/cama/, '🛏️'],
    [/roupa/, '🧺'], [/louça|prato/, '🍽️'], [/quarto|arrumar/, '🧹'], [/lixo/, '🗑️'],
  ];
  return regras.find(([r]) => r.test(n))?.[1] ?? '⭐';
}

// Quem já ocupa as vagas da família. Fica null enquanto carrega.
export function useFamilia() {
  const [familia, setFamilia] = useState(null);
  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'familia'), (snap) => {
      const d = snap.data() ?? {};
      setFamilia({ filha: d.filha ?? {}, pais: d.pais ?? {} });
    });
  }, []);
  return familia;
}

// Reserva uma vaga para o usuário. A transação garante que, mesmo se duas
// pessoas tocarem ao mesmo tempo, só entram uma Luiza e no máximo dois pais.
export async function entrarNaFamilia(uid, papel, nome) {
  const ref = doc(db, 'config', 'familia');
  await runTransaction(db, async (tx) => {
    const d = (await tx.get(ref)).data() ?? { filha: {}, pais: {} };
    if (uid === d.filha?.uid || uid in d.pais) return;
    if (papel === 'filha') {
      if (d.filha?.uid) throw new Error('vaga-ocupada');
      tx.set(ref, { filha: { uid, nome }, pais: d.pais });
    } else {
      if (Object.keys(d.pais).length >= MAX_PAIS) throw new Error('vaga-ocupada');
      tx.set(ref, { filha: d.filha ?? {}, pais: { ...d.pais, [uid]: nome } });
    }
  });
}
