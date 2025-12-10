<template>
    <div class="success">
        <button :class="new_class" @click="click" >
            <i :class="i_class"></i>
            {{ text }}
        </button>
    </div>
</template>

<script>
export default {
    props: ['text', 'click', 'new_class', 'i_class']
}
</script>

<style scoped>
    .success button {
        color: #FFF;
        background: #20B000;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        padding: 12px 20px;
    }
</style>