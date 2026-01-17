interface Env {
  SUDOKU_STATE: KVNamespace
}

type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'

interface Action {
  type: 'fill' | 'note' | 'erase'
  row: number
  col: number
  prevValue: CellValue
  prevNotes: number[]
}

interface SavedGame {
  id: string
  difficulty: Difficulty
  puzzle: CellValue[][]
  solution: CellValue[][]
  board: Array<Array<{ value: CellValue; isGiven: boolean; notes: number[] }>>
  timer: number
  hintsUsed: number
  mistakes: number
  pointsLost: number
  history: Action[]
  updatedAt: string
  visitorId: string
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context
  const visitorId = params.visitorId as string

  const game = await env.SUDOKU_STATE.get<SavedGame>(`game:${visitorId}`, 'json')

  if (!game) {
    return new Response(JSON.stringify({ error: 'No saved game' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(game), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context
  const visitorId = params.visitorId as string

  try {
    const game = await request.json() as Omit<SavedGame, 'id' | 'updatedAt' | 'visitorId'>

    if (!game.difficulty || !game.puzzle || !game.solution || !game.board) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const savedGame: SavedGame = {
      ...game,
      id: crypto.randomUUID(),
      visitorId,
      updatedAt: new Date().toISOString(),
    }

    await env.SUDOKU_STATE.put(`game:${visitorId}`, JSON.stringify(savedGame))

    return new Response(JSON.stringify(savedGame), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env, params } = context
  const visitorId = params.visitorId as string

  await env.SUDOKU_STATE.delete(`game:${visitorId}`)

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
