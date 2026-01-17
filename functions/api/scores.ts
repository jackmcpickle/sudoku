interface Env {
  SUDOKU_STATE: KVNamespace
}

type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'

interface GameScore {
  id: string
  difficulty: Difficulty
  score: number
  timeSeconds: number
  hintsUsed: number
  mistakes: number
  completedAt: string
  visitorId: string
  username: string
}

const GLOBAL_LIMIT = 100
const DIFFICULTY_LIMIT = 50
const USER_LIMIT = 5

function insertSorted(scores: GameScore[], newScore: GameScore, limit: number): GameScore[] {
  const result = [...scores]
  let inserted = false
  for (let i = 0; i < result.length; i++) {
    if (newScore.score > result[i].score) {
      result.splice(i, 0, newScore)
      inserted = true
      break
    }
  }
  if (!inserted && result.length < limit) {
    result.push(newScore)
  }
  return result.slice(0, limit)
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  const url = new URL(request.url)
  const difficulty = url.searchParams.get('difficulty') as Difficulty | null
  const visitorId = url.searchParams.get('visitorId')

  if (visitorId) {
    const userScores = await env.SUDOKU_STATE.get<GameScore[]>(`user-scores:${visitorId}`, 'json')
    return new Response(JSON.stringify(userScores || []), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (difficulty) {
    const scores = await env.SUDOKU_STATE.get<GameScore[]>(`scores:${difficulty}`, 'json')
    return new Response(JSON.stringify(scores || []), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const scores = await env.SUDOKU_STATE.get<GameScore[]>('scores:global', 'json')
  return new Response(JSON.stringify(scores || []), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  try {
    const body = await request.json() as Omit<GameScore, 'id' | 'completedAt'>

    if (!body.difficulty || typeof body.score !== 'number' || !body.visitorId || !body.username) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const newScore: GameScore = {
      ...body,
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
    }

    const [globalScores, difficultyScores, userScores] = await Promise.all([
      env.SUDOKU_STATE.get<GameScore[]>('scores:global', 'json'),
      env.SUDOKU_STATE.get<GameScore[]>(`scores:${body.difficulty}`, 'json'),
      env.SUDOKU_STATE.get<GameScore[]>(`user-scores:${body.visitorId}`, 'json'),
    ])

    const newGlobal = insertSorted(globalScores || [], newScore, GLOBAL_LIMIT)
    const newDifficulty = insertSorted(difficultyScores || [], newScore, DIFFICULTY_LIMIT)
    const newUserScores = insertSorted(userScores || [], newScore, USER_LIMIT)

    await Promise.all([
      env.SUDOKU_STATE.put('scores:global', JSON.stringify(newGlobal)),
      env.SUDOKU_STATE.put(`scores:${body.difficulty}`, JSON.stringify(newDifficulty)),
      env.SUDOKU_STATE.put(`user-scores:${body.visitorId}`, JSON.stringify(newUserScores)),
    ])

    return new Response(JSON.stringify(newScore), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
