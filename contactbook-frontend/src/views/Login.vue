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
          <input id="login-password" v-model="loginForm.password" type="password" class="form-control" required />
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
          <input id="reg-password" v-model="regForm.password" type="password" class="form-control" required
            minlength="6" />
        </div>
        <div class="mb-3">
          <label for="reg-confirm" class="form-label">Xác nhận mật khẩu</label>
          <input id="reg-confirm" v-model="regForm.confirmPassword" type="password" class="form-control" required />
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

export default {
  data() {
    return {
      tab: "login",
      loading: false,
      message: "",
      success: false,
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
      if (this.regForm.password !== this.regForm.confirmPassword) {
        this.showMsg("Mật khẩu xác nhận không khớp");
        return;
      }
      this.loading = true;
      try {
        await authService.register({
          name: this.regForm.name,
          email: this.regForm.email,
          password: this.regForm.password,
        });
        this.showMsg("Đăng ký thành công!", true);
        setTimeout(() => this.$router.push({ name: "contactbook" }), 500);
      } catch (e) {
        this.showMsg(e.response?.data?.message || "Đăng ký thất bại");
      } finally {
        this.loading = false;
      }
    },
    loginGoogle() {
      alert("Chức năng đăng nhập Google - cần cấu hình Google Client ID");
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
