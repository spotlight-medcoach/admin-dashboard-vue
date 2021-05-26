<template>
    <div>
        <Navigation />
        
        <div class="admin-container">
            <div class="head-container">
                <h1>Revisión de casos nuevos</h1>
                <!-- <nuxt-link 
                    to="/requestedCases/addRequestedCase"
                    class="add-button" >
                    <i class="fas fa-list-alt"></i>
                        Solicitar nuevo caso
                </nuxt-link> -->
            </div>

            <div class="search-active-container">
                <input type="searchText" placeholder="Buscar">
                
                <select v-model="topicSelected" name="topic" class="js-example-basic-single" @change="filterSubtopics(topicSelected)">
                    <option :value="top" v-for="top in topics" :key="top._id">{{top.name}}</option>
                </select>

                <select v-model="subtopicSelected" name="subtopic" class="js-example-basic-single">
                    <option :value="sub._id" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                </select>
            </div>

            <div class="table-container">
                <Loading v-if="loading" />
                
                <table v-else class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Descripción</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Usuario</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="theCase in cases" :key="theCase._id">
                            <td>{{ theCase.name }}</td>
                            <td>{{ theCase.topic_name }}</td>
                            <td>{{ theCase.subtopic_name }}</td>
                            <td>{{ theCase.description.content }}</td>
                            <td>{{ new Date(theCase.approved_date).toLocaleDateString('es-ES') }}</td>
                            <td>{{ theCase.spotlighter_id.admin_id.name }} {{ theCase.spotlighter_id.admin_id.last_name }}</td>
                            <td>
                                <button class="btn fas fa-list-alt"></button>
                                <!-- <button class="btn">Ver caso</button> -->
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination-container">
                <div class="dropdown drop">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Rows per page:
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                        <button class="dropdown-item" type="button">10</button>
                        <button class="dropdown-item" type="button">15</button>
                        <button class="dropdown-item" type="button">20</button>
                    </div>
                </div>

                <nav class="arrows" aria-label="Page navigation example">
                    <ul class="pagination">
                        <div class="loco">
                            1 - 10 of n items
                        </div>
                        <li class="page-item p-2">
                            <a class="page-link arrow" href="#" aria-label="Previous">
                                <span class="fas fa-chevron-left"></span>
                            </a>
                        </li>
                        <li class="page-item p-2">
                            <a class="page-link arrow" href="#" aria-label="Next">
                                <span class="fas fa-chevron-right"></span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>


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
            cases: [],
            topics: [],
            subtopics: [],
            loading: false,
            topicSelected: '',
            subtopicSelected: '',
            topicName: '',
            subtopicName: ''
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
        }

        await this.getCasesWithReview();
        // this.loading = !this.loading;
        console.log('cases: ', this.cases)
        console.log('topics: ', this.topics)
    },
    methods: {
        async getCasesWithReview() {
            try {
                this.loading = !this.loading;

                let cases_response = await this.$axios.get('/getPendingReview');
                // console.log(cases_response)
                this.cases = cases_response.data.pending_cases;

                let cases = this.cases;
                console.log(new Date(this.cases[0].approved_date).toLocaleDateString('es-ES'))
                cases.forEach(oneCase => {
                    oneCase.topic_name = this.getTopicName(oneCase.topic_bubble);
                    oneCase.subtopic_name = this.getSubtopicName(oneCase.topic_bubble, oneCase.subtopic_bubble);
                })

                this.cases = cases;
                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        filterSubtopics(topic) {
            this.subtopics = topic.subtopics;
        },
        getTopicName(topic_bubble) {
            // var topic = '';
            // if (process.browser) {
                // let topics = JSON.parse(localStorage.getItem('topics'))
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0].name
            // }
            return topic;
        },
        getSubtopicName(topic_bubble, subtopic_bubble) {
            // var subtopic = '';
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0]
            let subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);
            return subtopic[0].name
            // let subtopic = this.subtopics.filter(sub => sub.subtopic == subtopic_bubble)[0]
            // console.log('sub:', subtopic)
            // return subtopic.name;
        }
    }
}
</script>

<style scoped>

</style>