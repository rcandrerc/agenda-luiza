// Horário escolar do 4º ano. Para mudar, é só editar aqui.
// Cada linha é um horário; as colunas são segunda a sexta (null = sem aula).
export const DIAS_AULA = [
  { numero: 1, nome: 'Segunda-feira', curto: 'Seg' },
  { numero: 2, nome: 'Terça-feira', curto: 'Ter' },
  { numero: 3, nome: 'Quarta-feira', curto: 'Qua' },
  { numero: 4, nome: 'Quinta-feira', curto: 'Qui' },
  { numero: 5, nome: 'Sexta-feira', curto: 'Sex' },
];

export const HORARIO = [
  { de: '13:10', ate: '14:00', aulas: ['Educação Física', 'História', 'Matemática', 'Música', 'Geografia'] },
  { de: '14:00', ate: '14:50', aulas: ['Matemática', 'História', 'Matemática', 'Robótica', 'Geografia'] },
  { de: '14:50', ate: '15:20', aulas: ['Recreio', null, 'Recreio', null, 'Recreio'] },
  { de: '15:20', ate: '16:10', aulas: ['Matemática', 'Português', 'Inglês', 'Português', 'Artes'] },
  { de: '16:10', ate: '17:00', aulas: ['Inglês', 'Português', 'Ciências', 'P. Textual', 'Inglês'] },
  { de: '17:00', ate: '17:50', aulas: ['Ciências', 'Português', 'Ciências', 'P. Textual', 'LIV'] },
];

// Aulas de um dia, juntando horários seguidos da mesma matéria
// (ex.: História 13:10–14:50).
export function aulasDoDia(indice) {
  const blocos = [];
  HORARIO.forEach((h) => {
    const materia = h.aulas[indice];
    if (!materia) return;
    const ultimo = blocos[blocos.length - 1];
    if (ultimo && ultimo.materia === materia && ultimo.ate === h.de) {
      ultimo.ate = h.ate;
      ultimo.aulas += 1;
    } else {
      blocos.push({ materia, de: h.de, ate: h.ate, aulas: 1 });
    }
  });
  return blocos;
}

// Todas as matérias (menos o recreio) com os dias e horários em que acontecem.
export function materias() {
  const mapa = new Map();
  DIAS_AULA.forEach((dia, i) => {
    aulasDoDia(i).forEach((b) => {
      if (b.materia === 'Recreio') return;
      if (!mapa.has(b.materia)) mapa.set(b.materia, []);
      mapa.get(b.materia).push({ dia, ...b });
    });
  });
  return [...mapa.entries()]
    .map(([nome, dias]) => ({ nome, dias, total: dias.reduce((n, d) => n + d.aulas, 0) }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

// Cor de cada matéria (matiz do círculo de cores), para achar rápido na tela.
const MATIZES = {
  'Matemática': 215, 'Português': 350, 'P. Textual': 330, 'História': 30, 'Geografia': 145,
  'Ciências': 120, 'Inglês': 265, 'Educação Física': 10, 'Música': 290, 'Robótica': 190,
  'Artes': 50, 'LIV': 170, 'Recreio': 90,
};
export const matizDe = (materia) => MATIZES[materia] ?? 210;
