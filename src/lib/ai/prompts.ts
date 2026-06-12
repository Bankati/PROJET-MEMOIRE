import scolaritePrompt from '@/data/prompts/scolarite.json'
import fraisPrompt from '@/data/prompts/frais.json'
import inscriptionPrompt from '@/data/prompts/inscription.json'
import filieresPrompt from '@/data/prompts/filieres.json'
import boursesPrompt from '@/data/prompts/bourses.json'
import hebergementPrompt from '@/data/prompts/hebergement.json'
import debouchesPrompt from '@/data/prompts/debouches.json'
import contactPrompt from '@/data/prompts/contact.json'
import defaultPrompt from '@/data/prompts/default.json'

type SubjectPrompt = Readonly<{
  subject: string
  keywords: readonly string[]
  system_instructions: string
  response_format: string
  forbidden: readonly string[]
}>

const ALL_PROMPTS: readonly SubjectPrompt[] = [
  scolaritePrompt as SubjectPrompt,
  fraisPrompt as SubjectPrompt,
  inscriptionPrompt as SubjectPrompt,
  filieresPrompt as SubjectPrompt,
  boursesPrompt as SubjectPrompt,
  hebergementPrompt as SubjectPrompt,
  debouchesPrompt as SubjectPrompt,
  contactPrompt as SubjectPrompt,
]

export const detectSubject = ({ query }: Readonly<{ query: string }>): SubjectPrompt => {
  const q = query.toLowerCase()
  for (const prompt of ALL_PROMPTS) {
    if (prompt.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      return prompt
    }
  }
  return defaultPrompt as SubjectPrompt
}

export const buildSystemPrompt = ({
  globalSystemPrompt,
  context,
  subjectPrompt,
}: Readonly<{
  globalSystemPrompt: string
  context: string
  subjectPrompt: SubjectPrompt
}>): string => {
  return `${globalSystemPrompt}

═══════════════════════════════════════
CONTEXTE RÉCUPÉRÉ DEPUIS LA BASE DE CONNAISSANCES :
${context.length > 0 ? context : 'Aucune information pertinente trouvée dans la base de connaissances.'}

═══════════════════════════════════════
INSTRUCTIONS SPÉCIFIQUES AU SUJET (${subjectPrompt.subject.toUpperCase()}) :
${subjectPrompt.system_instructions}

FORMAT DE RÉPONSE : ${subjectPrompt.response_format}

ÉLÉMENTS STRICTEMENT INTERDITS DANS LA RÉPONSE : ${subjectPrompt.forbidden.join(', ')}.`
}

export const GLOBAL_SYSTEM_PROMPT = `Tu es un assistant commercial intelligent intégré dans une plateforme de prospection téléphonique pour un établissement scolaire. Tu assistes les agents commerciaux en temps réel pendant leurs appels.

RÈGLES ABSOLUES :
- Base-toi UNIQUEMENT sur le contexte fourni. N'invente aucune information.
- Formule ta réponse comme si tu soufflais les mots à un agent en pleine conversation téléphonique.
- Réponse courte, dense, directement utilisable. Zéro jargon technique.
- Ton : commercial, humain, rassurant.
- Langue : français exclusivement.
- Aucune formule de politesse excessive, aucun disclaimer, aucune mise en garde.
- N'ajoute JAMAIS d'images, d'illustrations, d'émojis excessifs ou d'éléments visuels.
- N'invente AUCUNE information absente du contexte.
- Si l'information demandée n'est pas dans le contexte, dis-le en une phrase et propose de transférer vers un conseiller.

INTERDIT :
✗ "Bien sûr, je vais vous expliquer..."
✗ Répéter la question
✗ Mentionner ta nature d'IA ou tes limites techniques
✗ Les bullet points inutiles quand une seule phrase suffit
✗ Les réponses vagues non ancrées dans les données concrètes`
