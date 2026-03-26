<script>
export default {
    props: {
        contact: { type: Object, required: true },
    },
};
</script>
<template>
    <div>
        <div class="p-1">
            <strong>Tên:</strong>
            {{ contact.name }}
        </div>
        <div class="p-1">
            <strong>E-mail:</strong>
            {{ contact.email }}
        </div>
        <div class="p-1">
            <strong>Địa chỉ:</strong>
            {{ contact.address }}
        </div>
        <div class="p-1">
            <strong>Điện thoại:</strong>
            {{ contact.phone }}
        </div>
        <div class="p-1">
            <strong>Sở thích:&nbsp;</strong>
            <span>{{ Array.isArray(contact.favorite) && contact.favorite.length > 0 ? contact.favorite.join(', ') : 'Không có' }}</span>
        </div>
    </div>
</template>