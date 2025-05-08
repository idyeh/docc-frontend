import axios from "axios";

axios.defaults.baseURL = "";
// if there’s already a token in storage, set it on axios
const saved = localStorage.getItem("access_token");
if (saved) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
}

export const auth = {
  accessToken: saved || null,

  async login(u, p) {
    const { data } = await axios.post("/api/auth/login", { username: u, password: p });
    this.accessToken = data.access_token;
    // persist it
    localStorage.setItem("access_token", this.accessToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${this.accessToken}`;
  },

  logout() {
    this.accessToken = null;
    localStorage.removeItem("access_token");
    delete axios.defaults.headers.common["Authorization"];
  }
};
