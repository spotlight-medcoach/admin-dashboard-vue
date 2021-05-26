<template>
    <!-- <div class="link-container"> -->
        <NuxtLink :to="to" :class="new_class"> <i :class="icon"></i></NuxtLink>
    <!-- </div> -->
</template>

<script>
export default {
    props: ['to', 'new_class', 'icon']
}
</script>

<style scoped>
    a:hover {
        color:#fff;
        background-color:#FF9300;
        border-color: #afc7dd;
    }

    .link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        color: #FFFFFF;
        background: #5F5F5F;
        border-radius: 50%;
        border: 1px solid #5F5F5F;
        text-decoration: none;
    }

    /* .nuxt-link-exact-active {
        color:#fff;
        background-color:#FF9300;
        border-color: #FF9300;
    } */

</style>