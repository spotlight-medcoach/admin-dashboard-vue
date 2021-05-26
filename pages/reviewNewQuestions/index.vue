<template>
    <div>
        <Navigation />
        
        <div class="cases-container">
            <div class="head-container">
                <p>Revisión de casos nuevos</p>
            </div>

            <div class="filter-container">
                <div class="search">
                    <input type="searchText" placeholder="    Buscar">
                </div>
                
                <div class="select-container">
                    <select v-model="topicSelected" name="topic" class="js-example-basic-single" @change="filterSubtopics(topicSelected)">
                        <option :value="top" v-for="top in topics" :key="top._id">{{top.name}}</option>
                    </select>

                    <select v-model="subtopicSelected" name="subtopic" class="js-example-basic-single">
                        <option :value="sub._id" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                    </select>
                </div>
            </div>

            <div class="table-container">
                <Loading v-if="loading" />
                
                <table v-else class="table table-bordered">
                    <thead class="thead-cases">
                        <tr>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Descripcion</th>
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
                                <div class="btn-group dropleft">
                                    <button class="btn fas fa-list-alt options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                                    <div class="dropdown-menu">
                                        <button class="btn">Action1</button>
                                        <button class="btn">Action2</button>
                                    </div>
                                </div>
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
        console.log('cases: ', this.cases)
        console.log('topics: ', this.topics)
    },
    methods: {
        async getCasesWithReview() {
            try {
                this.loading = !this.loading;

                let cases_response = await this.$axios.get('/getPendingReview');
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
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0].name
            return topic;
        },
        getSubtopicName(topic_bubble, subtopic_bubble) {
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0]
            let subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);
            return subtopic[0].name
        }
    }
}
</script>

<style scoped>
    .cases-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
        margin: 40px 40px;
    }

    .head-container {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
        color: #000000;
    }


    .filter-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        position: static;
        width: 100%;
        height: 48px;
    }

    .search {
        display: flex;
        align-items: center;
        width: 60%;
        height: 100%;
    }

    .search input {
        width: 800px;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
    }

    .select-container {
        display: flex;
        justify-content: space-between;
        height: 32px;
        margin: 0px 40px;
    }

    .select-container select {
        margin: 0px 20px;
        border: none;
        border-bottom: 1px solid #000;
    }

    .table-container {
        width: 100%;
        height: 100%;
        margin: 20px 0px;
    }

    .thead-cases {
        background: #212529;
        color: #FFF;
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 15px;
        text-transform: uppercase;
    }

    .thead-cases th:last-child {
        border-radius: 0px 15px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 0px 15px 0px 0px;
        -webkit-border-radius: 0px 15px 0px 0px;
    }

    .thead-cases th:first-child {
        border-radius: 15px 0px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 15px 0px 0px 0px;
        -webkit-border-radius: 15px 0px 0px 0px;
    }

    .options {
        font-size: 24px;
        color: #FE9400;
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
    }

    .loco {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .drop {
        margin-right: 5%;
    }

    .arrows {
        margin-left: 5%;
    }
    .arrow {
        border: none;
        color: #FE9400;
    }
</style>