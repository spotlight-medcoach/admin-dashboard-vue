<template>
    <div>
        <Navigation />
        <h1>{{this.$route.params.id}}</h1>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';

export default {
    components: {
        Navigation
    }
}
</script>

<style>

</style>