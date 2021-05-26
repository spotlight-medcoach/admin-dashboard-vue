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
                
                <select v-model="selected" class="options" @change="changeStatus(selected)">
                    <option value="Approved by Spotlighter" selected>Aprobado</option>
                    <option value="Pending">Pendiente</option>
                    <option value="Accepted by Spotlighter">Aceptado por spotlighter</option>
                    <option value="In edit">En edición</option>
                    <option value="Pendign review">Pendiente de revisión</option>
                    <option value="With feedback">Con retroalimentación</option>
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
                            <th scope="col">Estado</th>
                            <th scope="col">Usuario</th>
                            <th scope="col">Acciones</th>
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
                            <td>
                                <button class="btn op"><i class="fas fa-list-alt"></i> Ver caso</button>
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
            cases: [],
            topics: [],
            selected: '',
            loading: false,
            showModal: false
        }
    },
    async created() {
        if (process.browser) 
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`

        await this.getCases()
        // this.loading = !this.loading
    },
    methods: {
        filterTopic(topic_bubble) {
            var topic = '';
            if (process.browser) {
                let topics = JSON.parse(localStorage.getItem('topics'))
                topic = topics.filter(top => top.bubble_id == topic_bubble)[0].name
            }
            return topic;
        },
        filterSubtopic(topic_bubble, subtopic_bubble) {
            var topic
            var subtopic
            if (process.browser) {
                let topics = JSON.parse(localStorage.getItem('topics'));
                topic = topics.filter(top => top.bubble_id == topic_bubble)[0]
                subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);
            }

            return subtopic[0].name
        },
        async getCases() {
            try {
                this.loading = !this.loading

                let cases_response = await this.$axios.get('/getCasesRequested');
                this.cases = cases_response.data.payload;

                let cases = this.cases;
                cases.forEach(oneCase => {
                    oneCase.topic_name = this.filterTopic(oneCase.topic_bubble)
                    oneCase.subtopic_name = this.filterSubtopic(oneCase.topic_bubble, oneCase.subtopic_bubble)
                });

                this.cases = cases;
                this.loading = !this.loading
                console.log(this.cases);
            } catch (err) {
                console.log(err);
            }
        },
        changeStatus(new_status) {
            console.log(new_status);
        }
    }
}
</script>

<style scoped>
    .op {
        font-size: 16px;
    }

    .op i {
        font-size: 24px;
    }
</style>