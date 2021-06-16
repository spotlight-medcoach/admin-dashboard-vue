<template>
    <div>
        <Navigation />
        <h1>Análisis banco de preguntas</h1>

        <div class="statistics-container">
            <Loading v-if="loading" />
        </div>
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
            loading: false
        }
    },
    async created() {
        if (process.browser){
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            
            if (!localStorage.getItem('universities'))
                await this.getUniversities()
            if (!localStorage.getItem('topics'))
                await this.getTopics()
            if (!localStorage.getItem('types'))
                await this.getTypes()
        }
    },
    methods: {
        async getUniversities() {
            this.loading = !this.loading;

            let universities = await this.$axios.get('/getUniversities')
            localStorage.setItem('universities', JSON.stringify(universities.data.payload))
            this.$store.commit('setUniversities')

            this.loading = !this.loading;
        },
        async getTopics() {
            this.loading = !this.loading;

            let topics = await this.$axios.get('/getTopicsWithSubtopics')
            localStorage.setItem('topics', JSON.stringify(topics.data.payload))
            this.$store.commit('setTopics')

            this.loading = !this.loading;
        },
        async getTypes() {
            this.loading = !this.loading;

            let types = await this.$axios.get('/getTypes');
            localStorage.setItem('types', JSON.stringify(types.data.payload));
            this.$store.commit('setTypes');

            this.loading = !this.loading;
        }
    }
}
</script>

<style scoped>
    .statistics-container {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        margin: auto;
    }

</style>