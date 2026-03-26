const AuthService = require("../services/auth.service");
const MongoDB = require("../utils/mongodb.util");

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
    // Kiểm tra tên có khoảng trắng (có họ và tên)
    if (!name.trim().includes(" ")) {
      return res
        .status(400)
        .json({
          message:
            "Họ tên phải chứa có ít nhất 2 từ (cách nhau bởi khoảng trắng)",
        });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }
    // Kiểm tra mật khẩu (chữ hoa, số, ký tự đặc biệt)
    const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_]).+$/;
    if (!pwdRegex.test(password)) {
      return res
        .status(400)
        .json({
          message:
            "Mật khẩu phải có ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt",
        });
    }
    const authService = new AuthService(MongoDB.client);
    const result = await authService.register({ name, email, password });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }
    const authService = new AuthService(MongoDB.client);
    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const authService = new AuthService(MongoDB.client);
    const user = await authService.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/facebook
exports.facebookLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Thiếu Facebook token" });
    }
    const authService = new AuthService(MongoDB.client);
    const result = await authService.facebookAuth(token);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

// POST /api/auth/google
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Thiếu Google token" });
    }
    const authService = new AuthService(MongoDB.client);
    const result = await authService.googleAuth(token);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};
