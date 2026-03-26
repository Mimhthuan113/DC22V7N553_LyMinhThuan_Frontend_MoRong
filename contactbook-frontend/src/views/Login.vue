<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-6 col-lg-5 p-4 bg-white shadow-sm rounded border">
      <h4 class="text-center mb-4">
        <i class="fas fa-address-book"></i>
        Contact Book
      </h4>

      <!-- Tab chuyển đổi -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'login' }" @click="tab = 'login'">
            Đăng nhập
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'register' }" @click="tab = 'register'">
            Đăng ký
          </button>
        </li>
      </ul>

      <!-- Thông báo -->
      <div v-if="message" :class="['alert', success ? 'alert-success' : 'alert-danger']" role="alert">
        {{ message }}
      </div>

      <!-- Form đăng nhập -->
      <form v-if="tab === 'login'" @submit.prevent="doLogin">
        <div class="mb-3">
          <label for="login-email" class="form-label">Email</label>
          <input id="login-email" v-model="loginForm.email" type="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="login-password" class="form-label">Mật khẩu</label>
          <div class="input-group">
            <input id="login-password" v-model="loginForm.password" :type="showLoginPwd ? 'text' : 'password'"
              class="form-control" required />
            <button class="btn btn-outline-secondary" type="button" @click="showLoginPwd = !showLoginPwd">
              <i :class="showLoginPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
          Đăng nhập
        </button>
      </form>

      <!-- Form đăng ký -->
      <form v-if="tab === 'register'" @submit.prevent="doRegister">
        <div class="mb-3">
          <label for="reg-name" class="form-label">Họ tên</label>
          <input id="reg-name" v-model="regForm.name" type="text" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="reg-email" class="form-label">Email</label>
          <input id="reg-email" v-model="regForm.email" type="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="reg-password" class="form-label">Mật khẩu</label>
          <div class="input-group">
            <input id="reg-password" v-model="regForm.password" :type="showRegPwd ? 'text' : 'password'"
              class="form-control" required minlength="6" />
            <button class="btn btn-outline-secondary" type="button" @click="showRegPwd = !showRegPwd">
              <i :class="showRegPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <div class="mb-3">
          <label for="reg-confirm" class="form-label">Xác nhận mật khẩu</label>
          <div class="input-group">
            <input id="reg-confirm" v-model="regForm.confirmPassword" :type="showRegConfirmPwd ? 'text' : 'password'"
              class="form-control" required />
            <button class="btn btn-outline-secondary" type="button" @click="showRegConfirmPwd = !showRegConfirmPwd">
              <i :class="showRegConfirmPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-success w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
          Đăng ký
        </button>
      </form>

      <!-- Nút OAuth -->
      <hr />
      <p class="text-center text-muted">Hoặc đăng nhập bằng</p>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-danger w-50" @click="loginGoogle" :disabled="loading">
          <i class="fab fa-google me-1"></i> Google
        </button>
        <button class="btn btn-outline-primary w-50" @click="loginFacebook" :disabled="loading">
          <i class="fab fa-facebook-f me-1"></i> Facebook
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import authService from "@/services/auth.service";

const FB_APP_ID = "1353984006489245";
const GOOGLE_CLIENT_ID = "1024198635802-ke42fatp2odl6coh5ploporrd62qcnve.apps.googleusercontent.com";

export default {
  data() {
    return {
      tab: "login",
      loading: false,
      message: "",
      success: false,
      showLoginPwd: false,
      showRegPwd: false,
      showRegConfirmPwd: false,
      loginForm: { email: "", password: "" },
      regForm: { name: "", email: "", password: "", confirmPassword: "" },
    };
  },
  mounted() {
    // Load Facebook SDK
    if (!document.getElementById("facebook-jssdk")) {
      window.fbAsyncInit = () => {
        FB.init({ appId: FB_APP_ID, cookie: true, xfbml: true, version: "v19.0" });
      };
      const s = document.createElement("script");
      s.id = "facebook-jssdk";
      s.src = "https://connect.facebook.net/vi_VN/sdk.js";
      s.async = true;
      document.head.appendChild(s);
    }

    // Load Google SDK
    if (!document.getElementById("google-gsi")) {
      const g = document.createElement("script");
      g.id = "google-gsi";
      g.src = "https://accounts.google.com/gsi/client";
      g.async = true;
      g.defer = true;
      g.onload = () => {
        this.googleClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "email profile",
          callback: this.handleGoogleCallback
        });
      };
      document.head.appendChild(g);
    }
  },
  methods: {
    async doLogin() {
      this.clearMsg();
      this.loading = true;
      try {
        await authService.login(this.loginForm);
        this.showMsg("Đăng nhập thành công!", true);
        setTimeout(() => this.$router.push({ name: "contactbook" }), 500);
      } catch (e) {
        this.showMsg(e.response?.data?.message || "Đăng nhập thất bại");
      } finally {
        this.loading = false;
      }
    },
    async doRegister() {
      this.clearMsg();

      // Kiểm tra họ tên
      if (!this.regForm.name.trim().includes(" ")) {
        this.showMsg("Họ tên phải chứa có ít nhất 2 từ (cách nhau bởi 1 khoảng trắng)");
        return;
      }

      // Kiểm tra mật khẩu mạnh
      const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_]).+$/;
      if (!pwdRegex.test(this.regForm.password)) {
        this.showMsg("Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt");
        return;
      }

      if (this.regForm.password !== this.regForm.confirmPassword) {
        this.showMsg("Mật khẩu xác nhận không khớp");
        return;
      }

      // Xác nhận trước khi đăng ký
      if (!window.confirm("Bạn có chắc chắn muốn đăng ký tài khoản mới với những thông tin này?")) {
        return;
      }

      this.loading = true;
      try {
        await authService.register({
          name: this.regForm.name,
          email: this.regForm.email,
          password: this.regForm.password,
        });

        // Hiện Alert tường minh bắt người dùng phải ấn OK thay vì thoáng qua 500ms
        window.alert("Chúc mừng! Bạn đã đăng ký tài khoản thành công. Nhấn OK để truy cập ngay.");

        this.$router.push({ name: "contactbook" });
      } catch (e) {
        this.showMsg(e.response?.data?.message || "Đăng ký thất bại");
      } finally {
        this.loading = false;
      }
    },
    loginGoogle() {
      if (!this.googleClient) {
        this.showMsg("Google SDK chưa tải xong, thử lại sau");
        return;
      }
      this.googleClient.requestAccessToken();
    },
    async handleGoogleCallback(response) {
      if (response.access_token) {
        this.loading = true;
        try {
          await authService.googleLogin(response.access_token);
          this.showMsg("Đăng nhập Google thành công!", true);
          setTimeout(() => this.$router.push({ name: "contactbook" }), 500);
        } catch (e) {
          this.showMsg(e.response?.data?.message || "Đăng nhập Google thất bại");
        } finally {
          this.loading = false;
        }
      }
    },
    loginFacebook() {
      if (typeof FB === "undefined") {
        this.showMsg("Facebook SDK chưa tải xong, thử lại sau");
        return;
      }
      this.loading = true;
      FB.login(
        (response) => {
          if (response.authResponse) {
            // Dùng Promise then/catch thay vì async/await báo lỗi SDK
            authService.facebookLogin(response.authResponse.accessToken)
              .then(() => {
                this.showMsg("Đăng nhập Facebook thành công!", true);
                setTimeout(() => this.$router.push({ name: "contactbook" }), 500);
              })
              .catch((e) => {
                this.showMsg(e.response?.data?.message || "Đăng nhập Facebook thất bại");
              })
              .finally(() => {
                this.loading = false;
              });
          } else {
            this.showMsg("Đã hủy đăng nhập Facebook");
            this.loading = false;
          }
        },
        { scope: "email,public_profile" }
      );
    },
    showMsg(msg, ok = false) {
      this.message = msg;
      this.success = ok;
    },
    clearMsg() {
      this.message = "";
    },
  },
};
</script>
