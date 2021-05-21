<template>
    <NuxtLink :to="to" :class="new_class"></NuxtLink>
</template>

<script>
export default {
    props: ['to', 'new_class']
}
</script>

<style scoped>
    a:hover {
        color:#fff;
        background-color:#FF9300;
        border-color: #afc7dd;
    }

    .link {
        left: 20%;
		right: 20%;
		top: 20%;
		bottom: 20%;
		text-decoration: none;
		font-size: 20px;
		background: #5F5F5F;
		color: #FFFFFF;

		padding: 10px;
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