export default function jwtDecode(token) {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload))
  } catch {
    return {}
  }
}
