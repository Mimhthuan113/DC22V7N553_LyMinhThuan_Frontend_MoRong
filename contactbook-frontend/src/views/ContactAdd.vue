<template>
    <div class="page">
        <h4>Thêm Liên hệ</h4>
        <ContactForm :contact="contact" @submit:contact="createContact" />
        <p>{{ message }}</p>
    </div>
</template>

<script>
import ContactForm from "@/components/ContactForm.vue";
import ContactService from "@/services/contact.service";

export default {
    components: {
        ContactForm,
    },
    data() {
        return {
            contact: {
                name: "",
                email: "",
                address: "",
                phone: "",
                favorite: false,
            },
            message: "",
        };
    },
    methods: {
        async createContact(data) {
            const confirmed = window.confirm("Bạn muốn thêm liên hệ này?");
            if (!confirmed) {
                return;
            }
            try {
                await ContactService.create(data);
                this.message = "Liên hệ được thêm thành công.";
                alert("Liên hệ được thêm thành công.");
                this.$router.push({ name: "contactbook" });
            } catch (error) {
                console.log(error);
                this.message = "Không thể thêm liên hệ.";
            }
        },
    },
};
</script>

<style scoped>
.page {
    max-width: 600px;
}
</style>
