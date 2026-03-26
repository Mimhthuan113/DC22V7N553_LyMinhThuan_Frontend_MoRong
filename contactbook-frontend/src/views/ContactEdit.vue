<template>
    <div class="page">
        <h4>Hiệu chỉnh Liên hệ</h4>
        <ContactForm v-if="contact" :contact="contact" @submit:contact="updateContact"
            @delete:contact="deleteContact" />
        <p v-else>{{ message }}</p>
    </div>
</template>
<script>
import ContactForm from "@/components/ContactForm.vue";
import ContactService from "@/services/contact.service";
export default {
    components: {
        ContactForm,
    },
    props: {
        id: { type: String, required: true },
    },
    data() {
        return {
            contact: null,
            message: "Đang tải dữ liệu liên hệ...",
        };
    },
    methods: {
        async getContact(id) {
            try {
                this.contact = await ContactService.get(id);
                this.message = "";
            } catch (error) {
                console.log(error);
                try {
                    const contacts = await ContactService.getAll();
                    const found = contacts.find((item) => item._id === id);
                    if (found) {
                        this.contact = found;
                        this.message = "";
                        return;
                    }
                } catch (fallbackError) {
                    console.log(fallbackError);
                }
                this.message = "Không tải được dữ liệu liên hệ.";
            }
        },
        async updateContact(data) {
            try {
                await ContactService.update(this.contact._id, data);
                alert('Liên hệ được cập nhật thành công.');
                this.$router.push({ name: "contactbook" });
            } catch (error) {
                console.log(error);
            }
        },
        async deleteContact() {
            if (confirm("Bạn muốn xóa Liên hệ này?")) {
                try {
                    await ContactService.delete(this.contact._id);
                    this.$router.push({ name: "contactbook" });
                } catch (error) {
                    console.log(error);
                }
            }
        },
    },
    created() {
        const contactId = this.id || this.$route.params.id;
        if (contactId) {
            this.getContact(contactId);
        } else {
            this.message = "Thiếu mã liên hệ.";
        }
    },
};
</script>