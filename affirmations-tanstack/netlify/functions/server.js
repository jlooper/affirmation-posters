import { server } from '../../dist/server/server.js'

export const handler = async (event, context) => {
  // Construct the full URL
  const protocol = event.headers['x-forwarded-proto'] || 'https'
  const host = event.headers.host || event.headers['x-forwarded-host']
  const path = event.path || event.rawPath || '/'
  const queryString = event.rawQuery ? `?${event.rawQuery}` : ''
  const url = `${protocol}://${host}${path}${queryString}`

  // Create a Request object
  const request = new Request(url, {
    method: event.httpMethod || 'GET',
    headers: new Headers(event.headers),
    body: event.body && event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' 
      ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body)
      : undefined,
  })

  try {
    const response = await server.fetch(request, {
      requestContext: context,
    })

    const body = await response.text()
    const headers = Object.fromEntries(response.headers.entries())

    return {
      statusCode: response.status,
      headers,
      body,
      isBase64Encoded: false,
    }
  } catch (error) {
    console.error('Server function error:', error)
    return {
      statusCode: 500,
      headers: { 'content-type': 'text/plain' },
      body: 'Internal Server Error',
    }
  }
}
