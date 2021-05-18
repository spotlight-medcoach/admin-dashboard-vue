<template>
    <div class="cancel">
        <button class="btn bg-danger" @click="click" >{{ text }}</button>
    </div>
</template>

<script>
export default {
    props: ['text', 'click']
}
</script>

<style>
    .cancel button {
        color: whitesmoke;
    }
</style>