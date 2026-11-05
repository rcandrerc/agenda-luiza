import { useEffect, useMemo, useState } from 'react';
import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query,
  runTransaction, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { BONUS_SEMANAL, HORAS_ATE_FOTO_EXPIRAR, MAX_PAIS, TAREFAS_INICIAIS, VALOR_SEMANAL } from './familia';

// Coleções no Firestore:
//   config/familia       { filha: {uid, nome} ou {}, pais: {uid: nome} }
//   tarefas/{id}         { nome, emoji, categoria, detalhe, diaria, dias, data, prazo, inicio, vale, ordem, ativa, criadaEm }
//   config/mesada        { base, bonus } (valores em reais; sem o documento valem os padrões de familia.js)
//   conclusoes/{dia_id}  { tarefaId, dia, feitaEm, fotoId, revisao?: aprovada|devolvida, revisadaEm, revisadaPor }
//   justificativas/{dia_id} { tarefaId, dia, motivo, status: pendente|aprovada|recusada, criadaEm, decididaEm, decididaPor }
//   fotos/{id}           { imagem (data URL), tarefaId, dia, criadaEm, expiraEm }

export function formatarDia(d) {
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
    return onSnapshot(
      q(),
      (snap) => setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Erro ao ler o Firestore:', err.code, err.message),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return itens;
}

const NOMES_DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function diaDaSemana(dia) {
  return new Date(`${dia}T12:00:00`).getDay();
}

// Tarefa com prazo (ex.: dever de casa): aparece a partir de "inicio" (ou do dia
// em que foi criada) até ser feita, uma vez só. Passando do prazo sem fazer,
// continua aparecendo como atrasada nos dias até hoje.
function prazoVisivel(t, dia) {
  const criada = t.criadaEm?.toDate?.();
  const inicio = t.inicio ?? (criada ? formatarDia(criada) : hoje());
  if (dia < inicio) return false;
  if (t.concluidaDia) return dia <= t.concluidaDia;
  return dia <= (t.prazo > hoje() ? t.prazo : hoje());
}

// Uma tarefa pode ser de um dia só (data), de alguns dias da semana (dias)
// ou, nas tarefas antigas, de todo dia (diaria sem dias).
export function apareceNoDia(t, dia) {
  if (t.prazo) return prazoVisivel(t, dia);
  if (t.data) return t.data === dia;
  if (t.dias?.length) return t.dias.includes(diaDaSemana(dia));
  return Boolean(t.diaria);
}

// Como apareceNoDia, mas ignora dias anteriores à criação de uma tarefa
// que se repete (para o calendário não mostrar pendências que nunca existiram).
export function tarefaDoDia(t, dia) {
  if (!apareceNoDia(t, dia)) return false;
  if (t.data || t.prazo) return true;
  const criada = t.criadaEm?.toDate?.();
  return !criada || formatarDia(criada) <= dia;
}

function dataCurta(dia) {
  return new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

// Quão perto está o prazo de uma tarefa ainda não feita: '', 'perto', 'hoje' ou 'atrasada'.
export function urgenciaPrazo(t) {
  if (!t.prazo || t.concluidaDia) return '';
  const h = hoje();
  if (t.prazo < h) return 'atrasada';
  if (t.prazo === h) return 'hoje';
  if (t.prazo === formatarDia(new Date(Date.now() + 86400000))) return 'amanha';
  const dias = (new Date(`${t.prazo}T12:00:00`) - new Date(`${h}T12:00:00`)) / 86400000;
  return dias <= 2 ? 'perto' : '';
}

// Deveres que ainda não foram feitos e vencem amanhã, para o alerta vermelho.
export const deveresParaAmanha = (tarefas) => tarefas.filter((t) => urgenciaPrazo(t) === 'amanha');

export function descreverQuando(t) {
  if (t.prazo) {
    const u = urgenciaPrazo(t);
    if (u === 'atrasada') return `Atrasada! era até ${dataCurta(t.prazo)}`;
    if (u === 'hoje') return 'Entregar hoje';
    if (u === 'amanha') return '🚨 Entregar amanhã!';
    return `Entregar até ${dataCurta(t.prazo)}`;
  }
  if (t.data) return `Só ${new Date(`${t.data}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}`;
  if (!t.dias?.length || t.dias.length === 7) return 'Todo dia';
  if (t.dias.length === 5 && [1, 2, 3, 4, 5].every((n) => t.dias.includes(n))) return 'Seg a sex';
  return t.dias.map((n) => NOMES_DIAS[n]).join(', ');
}

// Posição da tarefa na lista: a escolhida pelos pais (ordem) ou, enquanto
// ninguém mexeu, o momento em que foi criada.
function valorOrdem(t) {
  return t.ordem ?? t.criadaEm?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
}

function ordenar(lista) {
  return lista.sort((a, b) => valorOrdem(a) - valorOrdem(b) || a.id.localeCompare(b.id));
}

// Grava a nova ordem de um grupo de tarefas, reaproveitando as mesmas posições
// que o grupo já ocupava para não bagunçar as tarefas que não aparecem nele.
export async function reordenarTarefas(novaOrdem, todas) {
  const porId = new Map(todas.map((t) => [t.id, t]));
  const posicoes = novaOrdem.map((id) => valorOrdem(porId.get(id))).sort((a, b) => a - b);
  for (let i = 1; i < posicoes.length; i += 1) {
    if (posicoes[i] <= posicoes[i - 1]) posicoes[i] = posicoes[i - 1] + 1;
  }
  const lote = writeBatch(db);
  novaOrdem.forEach((id, i) => lote.update(doc(db, 'tarefas', id), { ordem: posicoes[i] }));
  await lote.commit();
}

// Conclusões (em qualquer dia) das tarefas informadas.
function useConclusoesDe(ids) {
  const chave = ids.join(',');
  const [lista, setLista] = useState([]);
  useEffect(() => {
    if (!ids.length) {
      setLista([]);
      return undefined;
    }
    const q = query(collection(db, 'conclusoes'), where('tarefaId', 'in', ids.slice(0, 30)));
    return onSnapshot(q, (snap) => setLista(snap.docs.map((x) => x.data())));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);
  return lista;
}

export function useTarefas() {
  const base = useColecao(() => query(collection(db, 'tarefas'), where('ativa', '==', true)), []);
  const feitas = useConclusoesDe((base ?? []).filter((t) => t.prazo).map((t) => t.id));
  return useMemo(() => {
    if (!base) return null;
    const primeira = new Map();
    feitas.forEach((c) => {
      if (!primeira.has(c.tarefaId) || c.dia < primeira.get(c.tarefaId)) primeira.set(c.tarefaId, c.dia);
    });
    return ordenar(base.map((t) => (t.prazo ? { ...t, concluidaDia: primeira.get(t.id) ?? null } : t)));
  }, [base, feitas]);
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

export function useConclusoesPeriodo(de, ate) {
  return useColecao(
    () => query(collection(db, 'conclusoes'), where('dia', '>=', de), where('dia', '<=', ate)),
    [de, ate],
  );
}

export function useConclusoesSemana(dia) {
  const dias = diasDaSemana(dia);
  return useColecao(
    () => query(collection(db, 'conclusoes'), where('dia', '>=', dias[0]), where('dia', '<=', dias[6])),
    [dias[0]],
  );
}

// Tarefa que a Luiza marcou e os pais não mandaram refazer.
export const feitaDeVerdade = (c) => Boolean(c) && c.revisao !== 'devolvida';

// Valores da mesada que os pais podem mudar no app.
export function useConfigMesada() {
  const [config, setConfig] = useState({ base: VALOR_SEMANAL, bonus: BONUS_SEMANAL });
  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'mesada'), (snap) => {
      const d = snap.data() ?? {};
      setConfig({ base: Number(d.base ?? VALOR_SEMANAL), bonus: Number(d.bonus ?? BONUS_SEMANAL) });
    }, () => {});
  }, []);
  return config;
}

export async function salvarConfigMesada({ base, bonus }) {
  await setDoc(doc(db, 'config', 'mesada'), { base, bonus });
}

// A mesada base da semana é dividida igualmente entre todas as caixinhas das
// tarefas que valem dinheiro (cada tarefa conta uma vez por dia em que aparece).
// Justificativa aprovada pelos pais vale como tarefa feita; tarefa devolvida
// pelos pais não conta. Se todas as caixinhas da semana forem feitas, sem nenhum
// dia faltando, ela ganha também o bônus. Tarefa justificada (aceita pelos pais)
// não desconta da mesada, mas tira o bônus: ele só vale com tudo feito de verdade.
export function calcularMesada(tarefas, conclusoesSemana, dia, justificativasSemana = [], config = { base: VALOR_SEMANAL, bonus: BONUS_SEMANAL }) {
  const dias = diasDaSemana(dia);
  const pagas = tarefas.filter((t) => t.vale && !t.prazo);
  const feitasNoDia = new Set(conclusoesSemana.filter(feitaDeVerdade).map((c) => `${c.dia}_${c.tarefaId}`));
  const justificadasNoDia = new Set(justificativasSemana.filter((j) => j.status === 'aprovada').map((j) => `${j.dia}_${j.tarefaId}`));

  const porDia = dias.map((d) => {
    const doDia = pagas.filter((t) => tarefaDoDia(t, d));
    const feitas = doDia.filter((t) => feitasNoDia.has(`${d}_${t.id}`)).length;
    const justificadas = doDia.filter((t) => !feitasNoDia.has(`${d}_${t.id}`) && justificadasNoDia.has(`${d}_${t.id}`)).length;
    const total = doDia.length;
    const estado = total === 0 ? 'livre' : d > dia ? 'futuro' : feitas === total ? 'ok'
      : feitas + justificadas === total ? 'justificada' : d === dia ? 'hoje' : 'falhou';
    return { dia: d, total, feitas, justificadas, estado };
  });

  const total = porDia.reduce((n, d) => n + d.total, 0);
  const feitas = porDia.reduce((n, d) => n + d.feitas, 0);
  const justificadas = porDia.reduce((n, d) => n + d.justificadas, 0);
  const bonusVivo = !porDia.some((d) => d.estado === 'falhou' || d.estado === 'justificada');
  const bonusGanho = total > 0 && feitas === total;
  const ganho = total ? (config.base * (feitas + justificadas)) / total : 0;
  const bonusValor = bonusGanho ? config.bonus : 0;

  // Dias seguidos sem falha, contando de hoje (ou de ontem, se hoje ainda não acabou) para trás.
  let seguidos = 0;
  for (let i = dias.indexOf(dia); i >= 0; i--) {
    const e = porDia[i].estado;
    if (e === 'livre' || e === 'hoje') continue;
    if (e !== 'ok') break;
    seguidos++;
  }

  return {
    total, feitas, justificadas, porCaixinha: total ? config.base / total : 0,
    base: config.base, bonus: config.bonus, bonusGanho, bonusVivo, bonusValor,
    ganho, totalGanho: ganho + bonusValor, maximo: config.base + (bonusVivo ? config.bonus : 0),
    porDia, seguidos,
  };
}

// Os pais justificam uma tarefa que não foi feita, sem esperar a Luiza explicar.
export async function justificarPelosPais(tarefaId, dia) {
  await setDoc(doc(db, 'justificativas', `${dia}_${tarefaId}`), {
    tarefaId, dia, motivo: 'Justificada pelos pais', status: 'aprovada',
    criadaEm: serverTimestamp(), decididaEm: serverTimestamp(),
  });
}

// Os pais aprovam a tarefa olhando a foto, ou mandam a Luiza refazer.
export async function revisarConclusao(tarefaId, dia, revisao, nome) {
  await updateDoc(doc(db, 'conclusoes', `${dia}_${tarefaId}`), {
    revisao, revisadaEm: serverTimestamp(), revisadaPor: nome,
  });
}

export function useJustificativas(dia) {
  const lista = useColecao(() => query(collection(db, 'justificativas'), where('dia', '==', dia)), [dia]);
  if (!lista) return null;
  return Object.fromEntries(lista.map((j) => [j.tarefaId, j]));
}

// Dias anteriores (do mais recente ao mais antigo) em que ainda dá para justificar.
export const DIAS_PARA_JUSTIFICAR = 3;

export function diasAnteriores(dia, n = DIAS_PARA_JUSTIFICAR) {
  const base = new Date(`${dia}T12:00:00`);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - (i + 1));
    return formatarDia(d);
  });
}

export function useJustificativasPeriodo(de, ate) {
  return useColecao(
    () => query(collection(db, 'justificativas'), where('dia', '>=', de), where('dia', '<=', ate)),
    [de, ate],
  );
}

export function useJustificativasSemana(dia) {
  const dias = diasDaSemana(dia);
  return useColecao(
    () => query(collection(db, 'justificativas'), where('dia', '>=', dias[0]), where('dia', '<=', dias[6])),
    [dias[0]],
  );
}

// Justificativas esperando a resposta dos pais.
export function useJustificativasPendentes() {
  return useColecao(() => query(collection(db, 'justificativas'), where('status', '==', 'pendente')), []);
}

export async function enviarJustificativa(tarefaId, dia, motivo) {
  await setDoc(doc(db, 'justificativas', `${dia}_${tarefaId}`), {
    tarefaId, dia, motivo, status: 'pendente', criadaEm: serverTimestamp(),
  });
}

export async function cancelarJustificativa(tarefaId, dia) {
  await deleteDoc(doc(db, 'justificativas', `${dia}_${tarefaId}`));
}

export async function decidirJustificativa(j, aprovada, uid) {
  await updateDoc(doc(db, 'justificativas', j.id), {
    status: aprovada ? 'aprovada' : 'recusada', decididaEm: serverTimestamp(), decididaPor: uid,
  });
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
export async function criarTarefa({ nome, emoji, categoria, dias, data, vale, prazo, inicio }) {
  const repete = !data && !prazo;
  await addDoc(collection(db, 'tarefas'), {
    nome, emoji, categoria, detalhe: '',
    diaria: repete, dias: repete ? dias : null, data: data ?? null,
    prazo: prazo ?? null, inicio: prazo ? inicio ?? null : null,
    vale: Boolean(vale) && !prazo, ativa: true, criadaEm: serverTimestamp(),
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
