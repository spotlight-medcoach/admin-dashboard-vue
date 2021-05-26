<template>
    <div class="input-title">
        <i :class="icon"></i>
        <h3>{{ title }}</h3>
    </div>
</template>

<script>
export default {
    props: ['icon', 'title']
}
</script>

<style scoped>
    .input-title {
        display: flex;
        flex-direction: row;
        /* align-items: center; */
        color: #1CA4FC;
    }

    .input-title i {
        font-size: 24px;
        margin: 0px 8px;
    }

    .input-title h3 {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 550;
        font-size: 20px;
        margin-bottom: 0;
    }
</style>