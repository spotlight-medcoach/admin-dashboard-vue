<template>
    <div class="link-container">
        <NuxtLink :to="to" :class="new_class"> <i :class="icon"></i></NuxtLink>
        <p>{{title}}</p>
    </div>
</template>

<script>
export default {
    props: ['to', 'new_class', 'icon', 'title']
}
</script>

<style scoped>
    .link-container {
        display: flex;
        flex-direction: column;
    }

    .link-container p {
        margin: 0;
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 18px;
        color: #212529;
    }

    .link-container:not(:hover) p {
        display: none;
    }

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

    .nuxt-link-exact-active {
        color:#fff;
        background-color:#FF9300;
        border-color: #FF9300;
    }

    .nuxt-link-exact-active:parent p {
        display: block import !important;
    }

</style>