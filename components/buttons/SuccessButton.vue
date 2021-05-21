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
    }
</style>