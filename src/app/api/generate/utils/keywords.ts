// Build semantic keywords from user preferences for vector search

interface SearchParams {
  query: string
  activities?: string[]
  budget?: number
  numPax?: string
  mbti?: string
  spicy?: boolean
}

export function buildSemanticKeywords(params: SearchParams): string {
  const keywords: string[] = []

  // 1. User's natural language query (most important)
  if (params.query) {
    keywords.push(params.query)
  }

  // 2. Activity type keywords
  if (params.activities && params.activities.length > 0) {
    keywords.push(...params.activities.map(a => a.toLowerCase()))
  }

  // 3. Budget-related keywords
  const budgetKeywords: Record<number, string[]> = {
    0: ['cheap', 'budget', 'free', 'affordable', 'broke'],
    1: ['budget-friendly', 'affordable', 'reasonable'],
    2: ['moderate', 'mid-range'],
    3: ['comfortable', 'nice', 'quality'],
    4: ['premium', 'luxury', 'upscale', 'high-end']
  }
  if (params.budget !== undefined && budgetKeywords[params.budget]) {
    keywords.push(...budgetKeywords[params.budget])
  }

  // 4. Group size keywords
  const paxKeywords: Record<string, string[]> = {
    'solo': ['solo', 'alone', 'individual'],
    'date': ['romantic', 'couple', 'date', 'intimate'],
    'double-date': ['double-date', 'couples', 'group'],
    '3-5': ['small group', 'friends'],
    '6-7': ['group', 'party'],
    '8+': ['large group', 'party', 'gathering']
  }
  if (params.numPax && paxKeywords[params.numPax]) {
    keywords.push(...paxKeywords[params.numPax])
  }

  // 5. MBTI personality keywords
  const mbtiKeywords: Record<string, string[]> = {
    'ENFP': ['creative', 'spontaneous', 'social', 'adventurous', 'enthusiastic'],
    'INFP': ['authentic', 'artistic', 'meaningful', 'quiet', 'creative'],
    'ENTP': ['innovative', 'debate', 'adventure', 'intellectual'],
    'INTP': ['analytical', 'logical', 'independent', 'thoughtful'],
    'ENFJ': ['social', 'organized', 'warm', 'inspiring'],
    'INFJ': ['meaningful', 'deep', 'insightful', 'private'],
    'ENTJ': ['leadership', 'strategic', 'efficient', 'bold'],
    'INTJ': ['strategic', 'independent', 'intellectual', 'planning'],
    'ESFP': ['entertaining', 'social', 'fun', 'lively', 'spontaneous'],
    'ISFP': ['artistic', 'gentle', 'flexible', 'aesthetic'],
    'ESTP': ['action', 'bold', 'energetic', 'hands-on'],
    'ISTP': ['practical', 'independent', 'observant', 'hands-on'],
    'ESFJ': ['social', 'caring', 'organized', 'traditional'],
    'ISFJ': ['caring', 'detailed', 'supportive', 'traditional'],
    'ESTJ': ['organized', 'practical', 'direct', 'responsible'],
    'ISTJ': ['organized', 'reliable', 'practical', 'detail-oriented']
  }
  if (params.mbti && mbtiKeywords[params.mbti]) {
    keywords.push(...mbtiKeywords[params.mbti])
  }

  // 6. Spicy keywords (nightlife/drinks)
  if (params.spicy) {
    keywords.push('nightlife', 'drinks', 'bar', 'club', 'cocktail', 'evening', 'party')
  }

  // Join into semantic search string
  return keywords.join(' ')
}
