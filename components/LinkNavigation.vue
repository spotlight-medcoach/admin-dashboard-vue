<template>
    <NuxtLink :to="to" :class="new_class"></NuxtLink>
</template>

<script>
export default {
    props: ['to', 'new_class']
}
</script>

<style>
    a:hover {
        color:#fff;
        background-color:#FF9300;
        border-color: #afc7dd;
    }

    /* .link {
        padding-left: .5rem;
        padding-right: .5rem;
        padding-top: .5rem;
        padding-bottom: .5rem;
        border-radius: 50%;
        border: 1px solid #929292;
        text-decoration: none;

        margin: 1rem;
		font-weight: bold;
		color: #FFF;
        background: #929292;
    } */

    /* .nuxt-link-exact-active {
        color:#fff;
        background-color:#FF9300;
        border-color: #FF9300;
    } */

</style>