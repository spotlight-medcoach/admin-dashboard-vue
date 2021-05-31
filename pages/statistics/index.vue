<template>
    <div>
        <Navigation />
        <h1>Análisis banco de preguntas</h1>
        <Loading v-if="loading" />
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        Navigation,
        Loading
    },
    data() {
        return {
            loading: true
        }
    },
    async created() {
        if (process.browser){
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            
            if (!localStorage.getItem('universities'))
                await this.getUniversities()
            if (!localStorage.getItem('topics'))
                await this.getTopics()
        }
            
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

<style scoped>

</style>