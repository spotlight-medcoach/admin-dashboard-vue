<template>
    <div>
        <Navigation />

        <div class="sim-container">
            <h1>{{this.$route.params.id}}</h1>
        </div>
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

<style scoped>
    .sim-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
    }
</style>