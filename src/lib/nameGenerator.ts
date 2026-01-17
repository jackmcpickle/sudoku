const ADJECTIVES = [
  'swift', 'clever', 'brave', 'calm', 'eager',
  'fierce', 'gentle', 'happy', 'keen', 'lively',
  'nimble', 'quick', 'sharp', 'silent', 'smart',
  'steady', 'bright', 'bold', 'cool', 'wise'
]

const NOUNS = [
  'fox', 'owl', 'wolf', 'bear', 'hawk',
  'lion', 'tiger', 'eagle', 'falcon', 'raven',
  'panther', 'dragon', 'phoenix', 'knight', 'wizard',
  'ninja', 'samurai', 'pilot', 'ranger', 'sage'
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDigits(count: number): string {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join('')
}

export function generateFunName(): string {
  const adjective = randomFrom(ADJECTIVES)
  const noun = randomFrom(NOUNS)
  const digits = randomDigits(3)
  return `${adjective}-${noun}-${digits}`
}
