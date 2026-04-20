export const RULES = [
  { id: 'R01', category: 'Fitness',            label: '20 min de marche — sans musique',  type: 'daily' },
  { id: 'R02', category: 'Fitness',            label: '4 séances de sport cette semaine', type: 'weekly', target: 4 },
  { id: 'R03', category: 'Nutrition',          label: "3 litres d'eau aujourd'hui",        type: 'daily' },
  { id: 'R04', category: 'Nutrition',          label: 'Max 2 fast-foods cette semaine',   type: 'weekly', target: 2, inverse: true },
  { id: 'R05', category: 'Nutrition',          label: 'Aucune boisson gazeuse ni jus',    type: 'daily' },
  { id: 'R06', category: 'Réveil & Spirituel', label: "Réveil à l'heure cible",           type: 'daily' },
  { id: 'R07', category: 'Réveil & Spirituel', label: 'Fajr comme première action',       type: 'daily' },
  { id: 'R08', category: 'Lecture',            label: "10 pages lues aujourd'hui",        type: 'daily' },
  { id: 'R09', category: 'Lecture',            label: 'Apprentissage partagé cette semaine', type: 'weekly', target: 1 },
  { id: 'R10', category: 'Mindset',            label: '5 min journaling ou méditation',   type: 'daily' },
  { id: 'R11', category: 'Mindset',            label: "Pas de réseaux sociaux 1re heure", type: 'daily' },
  { id: 'R12', category: 'Productivité',       label: 'Tâche prioritaire complétée',      type: 'daily' },
  { id: 'R13', category: 'Groupe',             label: 'Photo de marche publiée',          type: 'daily', needsPhoto: true },
  { id: 'R14', category: 'Groupe',             label: 'Défi collectif de la semaine',     type: 'weekly', target: 1 },
]

// SVG path d-values (Heroicons outline 24x24)
export const CATEGORY_ICON = {
  'Fitness':            'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  'Nutrition':          'M12 3c4.418 0 8 3.582 8 8 0 5.523-8 13-8 13S4 16.523 4 11c0-4.418 3.582-8 8-8z',
  'Réveil & Spirituel': 'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z',
  'Lecture':            'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  'Mindset':            'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z',
  'Productivité':       'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  'Groupe':             'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
}

export const DAILY_RULES = RULES.filter(r => r.type === 'daily')
export const CATEGORIES = [...new Set(RULES.map(r => r.category))]

export function getRulesByCategory(cat) {
  return RULES.filter(r => r.category === cat)
}
