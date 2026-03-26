<template>
    <Form @submit="submitContact" :validation-schema="contactFormSchema">
        <div class="form-group">
            <label for="name">Tên</label>

            <Field name="name" type="text" class="form-control" v-model="contactLocal.name" />

            <ErrorMessage name="name" class="error-feedback" />
        </div>
        <div class="form-group">
            <label for="email">E-mail</label>

            <Field name="email" type="email" class="form-control" v-model="contactLocal.email" />

            <ErrorMessage name="email" class="error-feedback" />
        </div>
        <div class="form-group">
            <label for="address">Địa chỉ</label>

            <Field name="address" type="text" class="form-control" v-model="contactLocal.address" />

            <ErrorMessage name="address" class="error-feedback" />
        </div>
        <div class="form-group">
            <label for="phone">Điện thoại</label>

            <Field name="phone" type="tel" class="form-control" v-model="contactLocal.phone" />

            <ErrorMessage name="phone" class="error-feedback" />
        </div>
        <div class="form-group">
            <label><strong>Sở thích:</strong></label>
            <div class="d-flex flex-wrap gap-3 mt-2">
                <div class="form-check">
                    <input name="favorite" type="checkbox" class="form-check-input" value="Âm nhạc"
                        v-model="contactLocal.favorite" />
                    <label class="form-check-label">Âm nhạc</label>
                </div>
                <div class="form-check">
                    <input name="favorite" type="checkbox" class="form-check-input" value="Thể thao"
                        v-model="contactLocal.favorite" />
                    <label class="form-check-label">Thể thao</label>
                </div>
                <div class="form-check">
                    <input name="favorite" type="checkbox" class="form-check-input" value="Du lịch"
                        v-model="contactLocal.favorite" />
                    <label class="form-check-label">Du lịch</label>
                </div>
                <div class="form-check">
                    <input name="favorite" type="checkbox" class="form-check-input" value="Khác"
                        v-model="contactLocal.favorite" />
                    <label class="form-check-label">Khác</label>
                </div>
            </div>
            <!-- Ô nhập Sở thích khác -->
            <div class="mt-2" v-if="contactLocal.favorite.includes('Khác')">
                <input type="text" class="form-control" placeholder="Nhập sở thích khác của bạn..."
                    v-model="otherFavoriteText" />
            </div>
        </div>
        <div class="form-group">
            <button class="btn btn-primary">Lưu</button>
            <button v-if="contactLocal._id" type="button" class="ml-2 btn btn-danger" @click="deleteContact">
                Xóa
            </button>
            <button type="button" class="ml-2 btn btn-danger" @click="Cancel">
                Thoát
            </button>
        </div>
    </Form>
</template>
<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
export default {
    components: {
        Form,
        Field,
        ErrorMessage,
    },
    emits: ["submit:contact", "delete:contact"],
    props: {
        contact: { type: Object, required: true }
    },
    data() {
        const contactFormSchema = yup.object().shape({
            name: yup
                .string()
                .required("Tên phải có giá trị.")
                .min(2, "Tên phải ít nhất 2 ký tự.")
                .max(50, "Tên có nhiều nhất 50 ký tự."),
            email: yup
                .string()
                .email("E-mail không đúng.")
                .max(50, "E-mail tối đa 50 ký tự."),
            address: yup.string().max(100, "Địa chỉ tối đa 100 ký tự."),
            phone: yup
                .string()
                .matches(
                    /((09|03|07|08|05)+([0-9]{8})\b)/g,
                    "Số điện thoại không hợp lệ."
                ),
        });

        // Xử lý dữ liệu sở thích ban đầu
        const knownHobbies = ["Âm nhạc", "Thể thao", "Du lịch", "Khác"];
        let initialFavorite = Array.isArray(this.contact.favorite) ? [...this.contact.favorite] : [];
        let defaultOther = "";

        // Nếu có sở thích nằm ngoài danh sách mặc định => Gom vào text input "Khác"
        const otherHobbiesStr = initialFavorite.find(h => !knownHobbies.includes(h));
        if (otherHobbiesStr) {
            defaultOther = otherHobbiesStr;
            if (!initialFavorite.includes("Khác")) {
                initialFavorite.push("Khác");
            }
            initialFavorite = initialFavorite.filter(h => knownHobbies.includes(h));
        }

        return {
            contactLocal: {
                ...this.contact,
                favorite: initialFavorite
            },
            otherFavoriteText: defaultOther,
            contactFormSchema,
        };
    },
    methods: {
        submitContact() {
            let payload = { ...this.contactLocal };
            payload.favorite = [...(payload.favorite || [])];

            // Xử lý logic thay thế chữ "Khác" bằng nội dung trong Input
            if (payload.favorite.includes("Khác")) {
                payload.favorite = payload.favorite.filter(h => h !== "Khác");
                if (this.otherFavoriteText && this.otherFavoriteText.trim() !== "") {
                    payload.favorite.push(this.otherFavoriteText.trim());
                }
            }

            this.$emit("submit:contact", payload);
        },
        deleteContact() {
            this.$emit("delete:contact", this.contactLocal._id);
        },
        Cancel() {
            const reply = window.confirm('Bạn có các thay đổi chưa được lưu! Bạn có chắc chắn muốn thoát khỏi trang này không?')

            if (!reply) {
                return false
            }
            else this.$router.push({ name: "contactbook" });
        }
    },
};
</script>
<style scoped>
@import "@/assets/form.css";
</style>