import { useEffect, useState } from 'react';
import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query,
  runTransaction, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { HORAS_ATE_FOTO_EXPIRAR, MAX_PAIS, TAREFAS_INICIAIS, VALOR_SEMANAL } from './familia';

// Coleções no Firestore:
//   config/familia       { filha: {uid, nome} ou {}, pais: {uid: nome} }
//   tarefas/{id}         { nome, emoji, categoria, detalhe, diaria, dias, data, vale, ativa, criadaEm }
//   conclusoes/{dia_id}  { tarefaId, dia, feitaEm, fotoId }
//   fotos/{id}           { imagem (data URL), tarefaId, dia, criadaEm, expiraEm }

function formatarDia(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function hoje() {
  return formatarDia(new Date());
}

export function dinheiro(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Os sete dias (segunda a domingo) da semana que contém o dia dado.
export function diasDaSemana(dia) {
  const base = new Date(`${dia}T12:00:00`);
  const desdeSegunda = (base.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - desdeSegunda + i);
    return formatarDia(d);
  });
}

function useColecao(q, deps) {
  const [itens, setItens] = useState(null);
  useEffect(() => {
    return onSnapshot(q(), (snap) => setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return itens;
}

const NOMES_DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function diaDaSemana(dia) {
  return new Date(`${dia}T12:00:00`).getDay();
}

// Uma tarefa pode ser de um dia só (data), de alguns dias da semana (dias)
// ou, nas tarefas antigas, de todo dia (diaria sem dias).
export function apareceNoDia(t, dia) {
  if (t.data) return t.data === dia;
  if (t.dias?.length) return t.dias.includes(diaDaSemana(dia));
  return Boolean(t.diaria);
}

export function descreverQuando(t) {
  if (t.data) return `Só ${new Date(`${t.data}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}`;
  if (!t.dias?.length || t.dias.length === 7) return 'Todo dia';
  if (t.dias.length === 5 && [1, 2, 3, 4, 5].every((n) => t.dias.includes(n))) return 'Seg a sex';
  return t.dias.map((n) => NOMES_DIAS[n]).join(', ');
}

function ordenar(lista) {
  return lista.sort((a, b) => (a.criadaEm?.seconds ?? 0) - (b.criadaEm?.seconds ?? 0));
}

export function useTarefas() {
  const tarefas = useColecao(() => query(collection(db, 'tarefas'), where('ativa', '==', true)), []);
  return tarefas && ordenar(tarefas);
}

export function useTarefasDoDia(dia) {
  const tarefas = useTarefas();
  return tarefas && tarefas.filter((t) => apareceNoDia(t, dia));
}

export function useConclusoes(dia) {
  const lista = useColecao(() => query(collection(db, 'conclusoes'), where('dia', '==', dia)), [dia]);
  if (!lista) return null;
  return Object.fromEntries(lista.map((c) => [c.tarefaId, c]));
}

export function useConclusoesSemana(dia) {
  const dias = diasDaSemana(dia);
  return useColecao(
    () => query(collection(db, 'conclusoes'), where('dia', '>=', dias[0]), where('dia', '<=', dias[6])),
    [dias[0]],
  );
}

// A mesada da semana é dividida igualmente entre todas as caixinhas das
// tarefas que valem dinheiro (cada tarefa conta uma vez por dia em que aparece).
export function calcularMesada(tarefas, conclusoesSemana, dia) {
  const dias = diasDaSemana(dia);
  const pagas = tarefas.filter((t) => t.vale);
  const total = pagas.reduce((n, t) => n + dias.filter((d) => apareceNoDia(t, d)).length, 0);
  const ids = new Set(pagas.map((t) => t.id));
  const feitas = Math.min(total, conclusoesSemana.filter((c) => ids.has(c.tarefaId)).length);
  const porCaixinha = total ? VALOR_SEMANAL / total : 0;
  return { total, feitas, porCaixinha, ganho: feitas * porCaixinha, maximo: VALOR_SEMANAL };
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

// dias: números de 0 (domingo) a 6 (sábado) para repetir toda semana;
// data: "AAAA-MM-DD" para uma tarefa de um dia só (pode ser amanhã).
export async function criarTarefa({ nome, emoji, categoria, dias, data, vale }) {
  const repete = !data;
  await addDoc(collection(db, 'tarefas'), {
    nome, emoji, categoria, detalhe: '',
    diaria: repete, dias: repete ? dias : null, data: data ?? null,
    vale: Boolean(vale), ativa: true, criadaEm: serverTimestamp(),
  });
}

export async function atualizarTarefa(id, campos) {
  await updateDoc(doc(db, 'tarefas', id), campos);
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
