<template>
    <div>
        <SpotlighterNavigation />

        <Loading v-if="loading" />
        <h1 v-else>Preguntas solicitadas</h1>
    </div>
</template>

<script>
import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        SpotlighterNavigation,
        Loading
    },
    data() {
        return {
            loading: true
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        }

        await this.getUniversities()
        await this.getTopics()
        this.loading = !this.loading
    },
    methods: {
        async getUniversities() {
            let universities = await this.$axios.get('/getUniversities')
            localStorage.setItem('universities', JSON.stringify(universities.data.payload))
            this.$store.commit('setUniversities')
        },
        async getTopics() {
            let topics = await this.$axios.get('/getTopicsWithSubtopics')
            localStorage.setItem('topics', JSON.stringify(topics.data.payload))
            this.$store.commit('setTopics')
        },
    }
}
</script>

<style>

</style>