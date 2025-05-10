import axios from 'axios'

export const auth = {
  accessToken: null,

  async login(username, password) {
    const { data } = await axios.post('/api/auth/login', { username, password })
    this.accessToken = data.access_token
    localStorage.setItem('access_token', data.access_token)
  },

  logout() {
    this.accessToken = null
    localStorage.removeItem('access_token')
  }
}

const saved = localStorage.getItem('access_token')
if (saved) {
  auth.accessToken = saved
}
