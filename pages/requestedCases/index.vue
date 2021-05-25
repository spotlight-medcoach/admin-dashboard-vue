<template>
    <div>
        <Navigation />
        <div class="admin-container">
            <div class="head-container">
                <h1>Casos solicitados</h1>
                <nuxt-link 
                    to="/requestedCases/addRequestedCase"
                    class="add-button" >
                    <i class="fas fa-list-alt"></i>
                        Solicitar nuevo caso
                </nuxt-link>
            </div>

            <div class="search-active-container">
                <input type="searchText" placeholder="Buscar">
                
                <select class="options">
                    <option value="1">Aprobado</option>
                    <option value="2">Inactivos</option>
                </select>
            </div>

            <!-- <h1 v-if="loading">Cargando...</h1> -->

            <div class="table-container">
                <Loading v-if="loading" />
                
                <table v-else class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Descripción</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Usuario</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="theCase in cases" :key="theCase._id">
                            <td>{{ theCase.name }}</td>
                            <td>{{ theCase.topic_name }}</td>
                            <td>{{ theCase.subtopic_name }}</td>
                            <td>{{ theCase.description }}</td>
                            <td>{{ theCase.status }}</td>
                            <td>{{ theCase.admin_user.name }} {{ theCase.admin_user.last_name }}</td>
                            <!-- <td>
                                <button class="fas fa-ellipsis-v btn" @click="showModal = true"></button>
                            </td> -->
                        </tr>
                    </tbody>
                </table>
            </div>
                                <!-- <ActionsModal :show="showModal" @close="showModal = false" /> -->

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
import ActionsModal from '../../components/modals/ActionsModal';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        Navigation,
        ActionsModal,
        Loading
    },
    data() {
        return {
            loading: true,
            cases: [],
            topics: [],
            showModal: false
        }
    },
    async created() {
        if (process.browser) 
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        // await this.getTopics()
        // await this.getCases()
        this.loading = !this.loading
    },
    methods: {
        async getTopics() {
            try {
                let topics = await this.$axios.get('/getTopicsWithSubtopics')
                this.topics = topics.data.payload
            } catch (err) {
                console.log(err);
            }
        },
        filterTopic(topic_bubble) {
            return this.topics.filter(top => top.bubble_id == topic_bubble)[0].name
        },
        filterSubtopic(topic_bubble, subtopic_bubble) {
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0]
            let subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);

            return subtopic[0].name
        },
        async getCases() {
            try {
                let cases_response = await this.$axios.get('/getCasesRequested');
                this.cases = cases_response.data.payload;

                let cases = this.cases;
                cases.forEach(oneCase => {
                    oneCase.topic_name = this.filterTopic(oneCase.topic_bubble)
                    oneCase.subtopic_name = this.filterSubtopic(oneCase.topic_bubble, oneCase.subtopic_bubble)
                });

                this.cases = cases;
                console.log(this.cases);
            } catch (err) {
                console.log(err);
            }
            
        }
    }
}
</script>

<style scoped>

</style>