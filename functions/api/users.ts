interface Env {
  SUDOKU_STATE: KVNamespace
}

interface User {
  username: string
  visitorId: string
  createdAt: string
}

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  try {
    const body = await request.json() as { username: string; visitorId: string }
    const { username, visitorId } = body

    if (!username || !visitorId) {
      return new Response(JSON.stringify({ error: 'Missing username or visitorId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!USERNAME_REGEX.test(username)) {
      return new Response(JSON.stringify({ error: 'Invalid username format. Use 3-20 alphanumeric, underscore, or hyphen.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const usernameLower = username.toLowerCase()
    const existingVisitorId = await env.SUDOKU_STATE.get(`username:${usernameLower}`)
    if (existingVisitorId && existingVisitorId !== visitorId) {
      return new Response(JSON.stringify({ error: 'Username taken' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const existingUser = await env.SUDOKU_STATE.get<User>(`user:${visitorId}`, 'json')
    if (existingUser && existingUser.username.toLowerCase() !== usernameLower) {
      await env.SUDOKU_STATE.delete(`username:${existingUser.username.toLowerCase()}`)
    }

    const user: User = {
      username,
      visitorId,
      createdAt: existingUser?.createdAt || new Date().toISOString(),
    }

    await env.SUDOKU_STATE.put(`user:${visitorId}`, JSON.stringify(user))
    await env.SUDOKU_STATE.put(`username:${usernameLower}`, visitorId)

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  const url = new URL(request.url)
  const visitorId = url.searchParams.get('visitorId')

  if (!visitorId) {
    return new Response(JSON.stringify({ error: 'Missing visitorId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const user = await env.SUDOKU_STATE.get<User>(`user:${visitorId}`, 'json')

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
