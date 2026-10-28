// A família não é cadastrada aqui: as três primeiras pessoas que entram com a
// conta Google escolhem o papel (Luiza, papai ou mamãe) e ficam gravadas em
// config/familia no Firestore. Depois disso ninguém mais consegue entrar.
export const MAX_PAIS = 2;

// Quanto a Luiza ganha por semana se fizer todas as tarefas que valem dinheiro.
export const VALOR_SEMANAL = 30;

// Por quanto tempo uma foto fica guardada antes de ser apagada.
export const HORAS_ATE_FOTO_EXPIRAR = 24;

// Tarefas que os pais podem criar com um toque na primeira vez que abrem o app.
export const TAREFAS_INICIAIS = [
  { nome: 'Arrumar a cama', emoji: '🛏️', categoria: 'casa', detalhe: 'De manhã', vale: true, dias: [1, 2, 3, 4, 5] },
  { nome: 'Tirar a roupa do banheiro', emoji: '🧺', categoria: 'casa', detalhe: 'Depois do banho', vale: true, dias: [1, 2, 3, 4, 5] },
  { nome: 'Limpar a caixinha da Yuki e da Nala', emoji: '🐱', categoria: 'casa', detalhe: 'Todo dia', vale: true, dias: [1, 2, 3, 4, 5] },
  { nome: 'Limpar o fogão', emoji: '🍳', categoria: 'casa', detalhe: 'Depois do jantar', vale: true, dias: [1, 2, 3, 4, 5] },
  { nome: 'Arrumar a lancheira', emoji: '🍎', categoria: 'escola', detalhe: 'Antes de ir para a escola', vale: true, dias: [1, 2, 3, 4, 5] },
  { nome: 'Arrumar a mochila', emoji: '🎒', categoria: 'escola', detalhe: 'Antes de ir para a escola', vale: true, dias: [1, 2, 3, 4, 5] },
];
