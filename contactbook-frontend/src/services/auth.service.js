import createApiClient from "./api.service";

class AuthService {
  constructor(baseUrl = "/api/auth") {
    this.api = createApiClient(baseUrl);
  }
  async register(data) {
    const res = await this.api.post("/register", data);
    this._save(res.data);
    return res.data;
  }
  async login(data) {
    const res = await this.api.post("/login", data);
    this._save(res.data);
    return res.data;
  }
  async facebookLogin(accessToken) {
    const res = await this.api.post("/facebook", { token: accessToken });
    this._save(res.data);
    return res.data;
  }
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  _save(data) {
    if (data.token) localStorage.setItem("token", data.token);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
  }
  getToken() { return localStorage.getItem("token"); }
  getUser() {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  }
  isLoggedIn() { return !!this.getToken(); }
}

export default new AuthService();
