<template>
    <div>
        <SpotlighterNavigation />
        <div class="feedback-container">
            <div class="title">
                <p>Casos que requieren corrección</p>
            </div>

            <div class="table-container">
                <Loading v-if="loading" />
                <table v-else class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Correcciones</th>
                            <th scope="col" class="actions">Acciones</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(oneCase, index) in casesFeedback" :key="oneCase._id">
                            <td>{{ oneCase.name }}</td>
                            <td>{{ oneCase.topic_name }}</td>
                            <td>{{ oneCase.subtopic_name }}</td>
                            <td>{{ oneCase.feedback }}</td>
                            <td>
                                <div class="edit">
                                    <i class="fas fa-pencil-alt"></i>
                                    <button type="button" class="btn" @click="update(casesFeedback[index])"> Editar</button>
                                </div>
                                <!-- <div class="dropleft">
                                    <button class="btn fas fa-ellipsis-v" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <div class="notifications">
                                            <button type="button" class="btn" @click="update(administrators[index])">
                                                <i class="fas fa-pencil-alt"></i>
                                                Editar usuario
                                            </button>
                                        </div>
                                        <div class="configuration">
                                            <button type="button" class="btn" @click="confirmModal(administrators[index])">
                                                <i class="fas fa-trash"></i>
                                                Eliminar usuario
                                            </button>
                                        </div>
                                    </div>
                                </div> -->
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
import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        SpotlighterNavigation,
        Loading
    },
    data() {
        return {
            casesFeedback: [],
            topics: [],
            subtopics: [],
            loading: false
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'))
        }

        await this.getCasesWithFeddback()
        this.filterTopicSubtopicName()
        console.log(this.casesFeedback)
    },
    methods: {
        async getCasesWithFeddback() {
            this.loading = !this.loading;

            let casesWithFeedback = await this.$axios.get('/getCasesWithFeedback')
            this.casesFeedback = casesWithFeedback.data.payload

            this.loading = !this.loading;
        },
        filterTopicSubtopicName() {
            let casesUpdated = []
            this.casesFeedback.forEach(oneCase => {
                oneCase.topic_name = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0].name
                let topic = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0]

                let subtopic = topic.subtopics.filter(sub => sub.subtopic == oneCase.subtopic_bubble)
                oneCase.subtopic_name = subtopic[0].name
                
                casesUpdated.push(oneCase);
            });

            this.casesFeedback = casesUpdated;
        },
        update(theCase) {
            alert(theCase)
        }
    }
}
</script>

<style scoped>
    .feedback-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
    }

    .title {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
        color: #000;
        margin: 20px 40px;
    }

    .title p {
        margin: 0;
    }

    .table-container {
        margin: 0px 40px;
    }

    .thead-admin {
        background: #212529;
        color: #FFF;
        text-transform: uppercase;
    }

    .thead-admin th:last-child {
        border-radius: 0px 15px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 0px 15px 0px 0px;
        -webkit-border-radius: 0px 15px 0px 0px;
    }

    .thead-admin th:first-child {
        border-radius: 15px 0px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 15px 0px 0px 0px;
        -webkit-border-radius: 15px 0px 0px 0px;
    }

    .edit {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #1CA4FC;
    }

    .edit button {
        color: #1CA4FC;
    }

    .actions {
        width: 5%;
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    .pagination {
        margin: 0;
    }

    .loco {
        display: flex;
        align-items: center;
    }

    .arrows {
        margin: 0px 40px;
    }
    .arrow {
        border: none;
        color: #FE9400;
    }
</style>