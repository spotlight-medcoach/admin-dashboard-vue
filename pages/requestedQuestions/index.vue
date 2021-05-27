<template>
    <div>
        <SpotlighterNavigation />

        <!-- <Loading v-if="loading" /> -->
        <div class="questions-container">
            <div class="head-container">
                <div class="title">
                    <p>Preguntas solicitadas</p>
                </div>

                <div class="filter-container">
                    <div class="select-container">
                        <select v-model="topicSelected" name="topic" class="js-example-basic-single" @change="filterSubtopics(topicSelected)">
                            <option :value="top" v-for="top in topics" :key="top._id">{{top.name}}</option>
                        </select>

                        <select v-model="subtopicSelected" name="subtopic" class="js-example-basic-single">
                            <option :value="sub._id" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="table-container">
                <Loading v-if="loading" />
                <table v-else class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Descripcion</th>
                            <th scope="col">Fecha</th>
                            <th scope="col" class="actions">Acciones</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(oneCase) in casesRequested" :key="oneCase._id">
                            <td>{{ oneCase.name }}</td>
                            <td>{{ oneCase.topic_name }}</td>
                            <td>{{ oneCase.subtopic_name }}</td>
                            <td>{{ oneCase.request_description }}</td>
                            <td>{{ oneCase.approved_date }}</td>
                            <td>
                                <div class="actions-btn">
                                    <button class="btn fas fa-check-circle accept" @click="acceptConfirm(oneCase._id)"></button>
                                    <button class="btn fas fa-trash-alt reject" @click="rejectConfirm(oneCase._id)"></button>
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

            <AcceptModal 
                v-if="isShowModalAccept"
                @close="closeModal"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :name="nameUser"
                :action="acceptCase" />
            
            <RejectModal 
                v-if="isShowModalReject"
                @close="closeModal"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :name="nameUser"
                :action="rejectCase" />

        </div>
    </div>
</template>

<script>
import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import Loading from '../../components/modals/Loading';
import AcceptModal from '../../components/modals/AcceptModal';
import RejectModal from '../../components/modals/RejectModal';

export default {
    components: {
        SpotlighterNavigation,
        Loading,
        AcceptModal,
        RejectModal
    },
    data() {
        return {
            loading: false,
            isShowModalAccept: false,
            isShowModalReject: false,
            titleModal: '',
            bodyModal: '',
            nameUser: '',
            topicSelected: '',
            subtopicSelected: '',
            caseToAcceptId: '',
            caseToRejectId: '',
            casesRequested: [],
            topics: [],
            subtopics: [],
            universities: []
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            
            if (!localStorage.getItem('universities'))
                await this.getUniversities()
            if (!localStorage.getItem('topics'))
                await this.getTopics()
            
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.universities = JSON.parse(localStorage.getItem('universities'));
        }

        await this.getCasesRequested();
        // this.filterTopicSubtopicName();
        console.log('cases', this.casesRequested)
        // console.log('top', this.topics)
        // console.log('uni', this.universities)
    },
    methods: {
        async getUniversities() {
            let universities = await this.$axios.get('/getUniversities');
            localStorage.setItem('universities', JSON.stringify(universities.data.payload));
            this.$store.commit('setUniversities');
        },
        async getTopics() {
            let topics = await this.$axios.get('/getTopicsWithSubtopics');
            localStorage.setItem('topics', JSON.stringify(topics.data.payload));
            this.$store.commit('setTopics');
        },
        async getCasesRequested() {
            this.loading = !this.loading

            let casesResponse = await this.$axios.get('/getCasesRequested')
            this.casesRequested = casesResponse.data.payload

            this.filterTopicSubtopicName();
            
            this.loading = !this.loading
        },
        acceptConfirm(caseToConfirmId) {
            this.titleModal = 'Aceptar caso solicitado';
            this.bodyModal = 'Al aceptar esta petición, el caso aparecerá en la sección \"Mis casos\" donde podrás crear el contenido que fue solicitado.'
            this.caseToAcceptId = caseToConfirmId;
            this.isShowModalAccept = !this.isShowModalAccept;
        },
        rejectConfirm(caseToRejectId) {
            this.titleModal = 'Rechazar caso';
            this.bodyModal = 'Al rechazar esta petición ya no podrás crea contenido para este caso y se asignará a otro usuario.';
            this.caseToRejectId = caseToRejectId;
            this.isShowModalReject = !this.isShowModalReject;
        },
        filterSubtopics(topic) {
            this.subtopics = topic.subtopics;
        },
        filterTopicSubtopicName() {
            let casesUpdated = []
            this.casesRequested.forEach(oneCase => {
                oneCase.topic_name = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0].name
                let topic = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0]

                let subtopic = topic.subtopics.filter(sub => sub.subtopic == oneCase.subtopic_bubble)
                oneCase.subtopic_name = subtopic[0].name
                
                casesUpdated.push(oneCase);
            });

            this.casesRequested = casesUpdated;
        },
        async acceptCase() {
            try {
                let assignResponse = await this.$axios.put('/assingCase', {
                    case_id: this.caseToAcceptId
                })

                this.isShowModalAccept = !this.isShowModalAccept;
                this.getCasesRequested();
            } catch (err) {
                console.log(err);
            }
        },
        async rejectCase() {
            try {
                
            } catch (err) {
                console.log(err);
            }
        },
        closeModal() {
            this.isShowModalAccept = false;
            this.isShowModalReject = false;
            this.caseToAcceptId = '';
            this.caseToRejectId = '';
            // this.isShowModal = !this.isShowModal;
        }
    }
}
</script>

<style scoped>
    .questions-container {
        display: flex;
        flex-direction: column;
        margin: 0px 40px;
        font-family: Montserrat;
    }

    .head-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 39px;
        margin: 20px 0px;
    }

    .title {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
        color: #000;
        height: 39px;
    }
    
    .title p {
        margin: 0;
    }

    .filter-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        position: static;
        height: 32px;
    }
    
    .select-container {
        display: flex;
        justify-content: space-between;
        height: 32px;
        margin: 0px 60px;
    }

    .select-container select {
        margin: 0px 20px;
        border: none;
        border-bottom: 1px solid #000;
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

    .accept {
        color: #20B000;
        font-size: 24px;
    }

    .reject {
        color: #DB1212;
        font-size: 24px;
    }

    .actions-btn {
        display: flex;
        flex-direction: row;
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