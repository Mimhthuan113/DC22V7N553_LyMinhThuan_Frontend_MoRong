const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");

class AuthService {
  constructor(client) {
    this.User = client.db().collection("users");
  }

  // Tạo JWT token
  generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  // Đăng ký
  async register(payload) {
    const { name, email, password } = payload;
    const existing = await this.User.findOne({ email });
    if (existing) {
      throw new Error("Email đã được sử dụng");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword, createdAt: new Date() };
    const result = await this.User.insertOne(newUser);
    newUser._id = result.insertedId;
    const token = this.generateToken(newUser);
    return { user: { _id: newUser._id, name, email }, token };
  }

  // Đăng nhập
  async login(payload) {
    const { email, password } = payload;
    const user = await this.User.findOne({ email });
    if (!user) throw new Error("Email hoặc mật khẩu không đúng");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Email hoặc mật khẩu không đúng");
    const token = this.generateToken(user);
    return { user: { _id: user._id, name: user.name, email: user.email }, token };
  }

  // Đăng nhập Facebook: verify token qua Graph API, tìm/tạo user
  async facebookAuth(accessToken) {
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    if (!res.ok) throw new Error("Facebook token không hợp lệ");
    const fbUser = await res.json();
    if (!fbUser.email) throw new Error("Không lấy được email từ Facebook");

    // Tìm user theo email, nếu chưa có thì tạo mới
    let user = await this.User.findOne({ email: fbUser.email });
    if (!user) {
      const result = await this.User.insertOne({
        name: fbUser.name,
        email: fbUser.email,
        password: null,
        provider: "facebook",
        facebookId: fbUser.id,
        createdAt: new Date(),
      });
      user = { _id: result.insertedId, name: fbUser.name, email: fbUser.email };
    }
    const token = this.generateToken(user);
    return { user: { _id: user._id, name: user.name, email: user.email }, token };
  }

  // Đăng nhập Google: verify access_token, tìm/tạo user
  async googleAuth(accessToken) {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );
    if (!res.ok) throw new Error("Google Token không hợp lệ");
    const ggUser = await res.json();
    
    if (!ggUser.email) throw new Error("Không lấy được email từ Google");

    let user = await this.User.findOne({ email: ggUser.email });
    if (!user) {
      const result = await this.User.insertOne({
        name: ggUser.name,
        email: ggUser.email,
        password: null,
        provider: "google",
        googleId: ggUser.sub,
        createdAt: new Date(),
      });
      user = { _id: result.insertedId, name: ggUser.name, email: ggUser.email };
    }
    const token = this.generateToken(user);
    return { user: { _id: user._id, name: user.name, email: user.email }, token };
  }

  // Tìm user theo id
  async findById(userId) {
    return await this.User.findOne(
      { _id: ObjectId.isValid(userId) ? new ObjectId(userId) : null },
      { projection: { password: 0 } }
    );
  }
}

module.exports = AuthService;
