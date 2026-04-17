export const RULES = [
  { id: 'R01', category: 'Fitness', label: '20 min de marche — sans musique', type: 'daily', needsPhoto: true },
  { id: 'R02', category: 'Fitness', label: '4 séances de sport cette semaine', type: 'weekly', target: 4 },
  { id: 'R03', category: 'Nutrition', label: "3 litres d'eau aujourd'hui", type: 'daily' },
  { id: 'R04', category: 'Nutrition', label: 'Max 2 fast-foods cette semaine', type: 'weekly', target: 2, inverse: true },
  { id: 'R05', category: 'Nutrition', label: 'Aucune boisson gazeuse ni jus', type: 'daily' },
  { id: 'R06', category: 'Réveil & Spirituel', label: "Réveil à l'heure cible", type: 'daily' },
  { id: 'R07', category: 'Réveil & Spirituel', label: 'Fajr comme première action', type: 'daily' },
  { id: 'R08', category: 'Lecture', label: "10 pages lues aujourd'hui", type: 'daily' },
  { id: 'R09', category: 'Lecture', label: 'Apprentissage partagé cette semaine', type: 'weekly', target: 1 },
  { id: 'R10', category: 'Mindset', label: '5 min journaling ou méditation', type: 'daily' },
  { id: 'R11', category: 'Mindset', label: "Pas de réseaux sociaux 1re heure", type: 'daily' },
  { id: 'R12', category: 'Productivité', label: 'Tâche prioritaire complétée', type: 'daily' },
  { id: 'R13', category: 'Groupe', label: 'Photo de marche publiée', type: 'daily', needsPhoto: true },
  { id: 'R14', category: 'Groupe', label: 'Défi collectif de la semaine', type: 'weekly', target: 1 },
]

export const CATEGORY_EMOJI = {
  'Fitness': '🏃',
  'Nutrition': '🥗',
  'Réveil & Spirituel': '🌅',
  'Lecture': '📚',
  'Mindset': '🧘',
  'Productivité': '✅',
  'Groupe': '👥',
}

export const DAILY_RULES = RULES.filter(r => r.type === 'daily')
export const CATEGORIES = [...new Set(RULES.map(r => r.category))]

export function getRulesByCategory(cat) {
  return RULES.filter(r => r.category === cat)
}
