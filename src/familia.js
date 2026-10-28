// Quem pode usar o app. O e-mail precisa ser o mesmo da conta criada no
// Firebase Authentication. Se mudar aqui, mude também em firestore.rules.
export const FAMILIA = [
  { email: 'luiza@exemplo.com', nome: 'Luiza', papel: 'filha' },
  { email: 'papai@exemplo.com', nome: 'Papai', papel: 'pais' },
  { email: 'mamae@exemplo.com', nome: 'Mamãe', papel: 'pais' },
];

export function membroPorEmail(email) {
  if (!email) return null;
  return FAMILIA.find((m) => m.email.toLowerCase() === email.toLowerCase()) ?? null;
}

// Por quanto tempo uma foto fica guardada antes de ser apagada.
export const HORAS_ATE_FOTO_EXPIRAR = 24;

// Tarefas que os pais podem criar com um toque na primeira vez que abrem o app.
export const TAREFAS_INICIAIS = [
  { nome: 'Arrumar a cama', emoji: '🛏️', categoria: 'casa', detalhe: 'De manhã' },
  { nome: 'Tirar a roupa do banheiro', emoji: '🧺', categoria: 'casa', detalhe: 'Depois do banho' },
  { nome: 'Limpar a caixinha da Yuki e da Nala', emoji: '🐱', categoria: 'casa', detalhe: 'Todo dia' },
  { nome: 'Arrumar a lancheira', emoji: '🍎', categoria: 'escola', detalhe: 'Antes de ir para a escola' },
  { nome: 'Arrumar a mochila', emoji: '🎒', categoria: 'escola', detalhe: 'Antes de ir para a escola' },
];
