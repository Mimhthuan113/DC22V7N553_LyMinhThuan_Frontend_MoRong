<template>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
        <a href="/" class="navbar-brand">Ứng dụng Quản lý danh bạ</a>
        <div class="mr-auto navbar-nav">
            <li class="nav-item">
                <router-link :to="{ name: 'contactbook' }" class="nav-link">
                    Danh bạ
                    <i class="fas fa-address-book"></i>
                </router-link>
            </li>
        </div>
        <div class="navbar-nav ms-auto">
            <li v-if="user" class="nav-item">
                <span class="nav-link">{{ user.name }}</span>
            </li>
            <li class="nav-item">
                <button v-if="user" class="nav-link btn btn-link" @click="logout">
                    <i class="fas fa-sign-out-alt"></i> Đăng xuất
                </button>
                <router-link v-else :to="{ name: 'login' }" class="nav-link">
                    <i class="fas fa-sign-in-alt"></i> Đăng nhập
                </router-link>
            </li>
        </div>
    </nav>
</template>
<script>
import authService from "@/services/auth.service";
export default {
    data() {
        return { user: authService.getUser() };
    },
    watch: {
        "$route"() {
            this.user = authService.getUser();
        },
    },
    methods: {
        logout() {
            authService.logout();
            this.user = null;
            this.$router.push({ name: "login" });
        },
    },
};
</script>