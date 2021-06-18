<template>
    <div>
        <Navigation />
        <div class="cases-container">
            <div class="head-container">
                <div class="title">
                    <p>Casos solicitados</p>
                </div>
                <nuxt-link 
                    v-if="!loading"
                    to="/requestedCases/addRequestedCase"
                    class="add-button" >
                    <i class="fas fa-list-alt"></i>
                        Solicitar nuevo caso
                </nuxt-link>
            </div>

            <Loading v-if="loading" />
            <div v-else class="search-container">
                <input type="searchText" placeholder="    Buscar">
                
                <select v-model="selected" class="options" @change="changeStatus(selected)">
                    <option value="" selected>Filtrar por estado</option>
                    <option value="Pending">Pendiente</option>
                    <option value="Accepted by Spotlighter">Aceptado por spotlighter</option>
                    <option value="In edit">En edición</option>
                    <option value="Pending review">Pendiente de revisión</option>
                    <option value="With feedback">Con retroalimentación</option>
                    <option value="Approved" selected>Aprobado</option>
                </select>
            </div>

            <div v-if="!loading" class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col" class="th-case">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col" class="th-description">Descripcion</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Usuario</th>
                            <th scope="col" class="act">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="theCase in cases" :key="theCase._id">
                            <td>{{ theCase.name }}</td>
                            <td>{{ theCase.topic_name }}</td>
                            <td>{{ theCase.subtopic_name }}</td>
                            <td>{{ theCase.description.content.ops[0].insert }}</td>

                            <td v-if="theCase.status == 'Pending'"><div class="pending">Pendiente</div></td>
                            <td v-else-if="theCase.status == 'Accepted by Spotlighter'"><div class="accepted">Aceptado</div></td>
                            <td v-else-if="theCase.status == 'In edit'"><div class="edit">En edición</div></td>
                            <td v-else-if="theCase.status == 'Approved'"><div class="approved">Aprobado</div></td>
                            <td v-else-if="theCase.status == 'With feedback'"><div class="feedback">Feedback</div></td>
                            <td v-else-if="theCase.status == 'Pending review'"><div class="pendign-review">Revisión pendiente</div></td>

                            <td>{{ theCase.spotlighter_id ? theCase.admin_user.name + " " + theCase.admin_user.last_name : 'No asignado/aceptado' }}</td>
                            <td class="act">
                                <div v-if="theCase.status == 'Accepted by Spotlighter' || theCase.status == 'Pending' || theCase.status == 'In edit'" class="appro">
                                    <button class="btn accep" @click="acceptedCaseModal(theCase.status)"><i class="fas fa-exclamation-circle"></i> Info</button>
                                </div>
                                <div v-else class="op">
                                    <button class="btn op" @click="caseDetails(theCase._id)"><i class="fas fa-list-alt"></i> Ver caso</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="!loading" class="pagination-container">
                <div class="select-container">
                    <span>Rows per page: </span>
                    <select v-model="pageResults" class="js-example-basic-single" @change="rowsChange">
                        <option value=1>1</option>
                        <option value=2>2</option>
                        <option value=3>3</option>
                        <option value=5>5</option>
                        <option value=10>10</option>
                        <option value=15>15</option>
                        <option value=50>50</option>
                    </select>
                </div>

                <div class="arrows-container">
                    <span>{{ (page - 1) * pageResults + 1 }} - {{ pageResults > totalCases ? totalCases : (page * pageResults) > totalCases ? totalCases : page * pageResults }} of {{totalCases}} casos</span>
                    <button class="btn fas fa-chevron-left" @click="before" :disabled="disbaledBefore == 1"></button>
                    <button class="btn fas fa-chevron-right" @click="after" :disabled="disabledAfter == 1"></button>
                </div>
            </div>
        </div>

        <!-- Modal para un caso que esta en "Pending" -->
        <InfoModal 
            v-if="isShowInfoModal"
            @close="closeInfoModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :textButton="button" />

    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import ActionsModal from '../../components/modals/ActionsModal';
import Loading from '../../components/modals/Loading';
import InfoModal from '../../components/modals/administrators/InfoModal';

export default {
    components: {
        Navigation,
        ActionsModal,
        Loading,
        InfoModal
    },
    data() {
        return {
            isShowInfoModal: false,

            titleModal: '',
            bodyModal: '',
            button: '',

            cases: [],
            topics: [],
            subtopics: [],
            selected: '',
            loading: false,
            showModal: false,
            disbaledBefore: 0,
            disabledAfter: 0,

            totalCases: 0,
            pageResults: 50,
            page: 1
        }
    },
    async created() {
        if (process.browser) 
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`

        await this.getCases()
        this.before();
        // this.loading = !this.loading
    },
    methods: {
        async getCases() {
            // Obtener datos del caso
            try {
                this.loading = !this.loading

                let cases_response = await this.$axios.get('/getCasesRequested', {
                    params: {
                        status: this.selected,
                        page: this.page,
                        pageResults: this.pageResults
                    }
                });
                
                this.cases = cases_response.data.payload.cases;
                this.totalCases = cases_response.data.payload.length;
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

        filterTopic(topic_bubble) {
            // Traer los topics y filtrar el nombre
            var topic = '';
            if (process.browser) {
                let topics = JSON.parse(localStorage.getItem('topics'))
                topic = topics.filter(top => top.bubble_id == topic_bubble)[0].name
            }
            return topic;
        },
        filterSubtopic(topic_bubble, subtopic_bubble) {
            // Traer los subtopics y filtrar el nombre
            var topic
            var subtopic
            if (process.browser) {
                let topics = JSON.parse(localStorage.getItem('topics'));
                topic = topics.filter(top => top.bubble_id == topic_bubble)[0]
                subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);
            }

            return subtopic[0].name
        },

        caseDetails(case_id) {
            // Ver detalles de un caso
            this.$router.push({ path: `/requestedCases/${case_id}` });
        },
        acceptedCaseModal(status) {
            // Mostrar modal de caso que su estado es "Accepted by Spotlighter"
            if (status == 'Pending') {
                this.titleModal = 'Caso pendiente';
                this.bodyModal = 'Este caso no ha sido asignido y aún no es aceptado por algún spotlighter.'
                this.button = 'Entendido'
            } else if (status == 'Accepted by Spotlighter') {
                this.titleModal = 'Caso aceptado por spotlighter';
                this.bodyModal = 'Cuando un caso ha sido aceptado no podrás ver su detalle hasta que el usuario lo mande a revisión.'
                this.button = 'Entendido'
            } else {
                this.titleModal = 'Caso en edición';
                this.bodyModal = 'Este caso esta en edición, podrás ver su contenido hasta que el spotlighter lo mande para revisión.'
                this.button = 'Entendido'
            }

            this.isShowInfoModal = !this.isShowInfoModal;
        },
        rowsChange() {
            // Cambiar los resultados que se muestran
            this.page = 1;

            if (this.pageResults > this.totalCases || this.totalCases == 0) {
                this.disabledAfter = 1
                this.disbaledBefore = 1
            } else {
                this.disbaledBefore = 1
                this.disabledAfter = 0
            }

            this.getCases()
        },
        before() {
            // Cambiar a página anterior
            if (this.page == 1) {
                this.disbaledBefore = 1
                if (this.totalCases == 0)
                    this.disabledAfter = 1
            } else if (this.page > 1) {
                this.page -= 1;
                this.disabledAfter = 0

                if (this.page == 1)
                    this.disbaledBefore = 1
            }
            this.getCases();
        },
        after() {
            // Cambiar a página siguiente
            this.page += 1;
            if (this.page * this.pageResults > this.totalCases) {
                this.disabledAfter = 1
                this.disbaledBefore = 0
            } else {
                if (this.page > 1)
                    this.disbaledBefore = 0
            }

            this.getCases();
        },
        changeStatus(new_status) {
            // Filtrar por status case
            console.log(new_status);
            this.getCases()
        },
        closeInfoModal() {
            this.isShowInfoModal = false;
        }
    }
}
</script>

<style scoped>
    .cases-container {
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

    .add-button {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 12px 20px;

        background: #20B000;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;

        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        letter-spacing: 0.4px;
        color: #FFFFFF;
        text-decoration: none;
    }

    .add-button i {
        position: static;
        font-size: 24px;
        margin-right: 12px;
    }

    .search-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 48px;
    }

    .search-container input {
        width: 800px;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
    }

    .search-container input:focus {
        outline: none;
    }

    .options {
        font-family: Montserrat;
        width: 15%;
        height: 32px;
        margin: 0px 40px;
        border: none;
        border-bottom: 1px solid #000;
    }

    .th-case {
        width: 15%;
    }

    .th-description {
        width: 20%;
    }

    .table-container {
        margin: 20px 0px;
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

    .tbody {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 18px;
        color: #212529;
    }

    td {
        vertical-align: middle;
        /* max-width: fit-content !important; */
    }

    .pending {
        font-weight: bold;
        text-align: center;
        background: #E0E0E0;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .accepted {
        font-weight: bold;
        text-align: center;
        background: #C6E8FE;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .edit {
        font-weight: bold;
        text-align: center;
        background: #FFDE89;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .approved {
        font-weight: bold;
        text-align: center;
        background: #90DF7E;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .feedback {
        font-weight: bold;
        text-align: center;
        background: #61C0FD;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .pendign-review {
        font-weight: bold;
        text-align: center;
        background: #FBD6E9;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .act {
        width: 10%;
    }

    .accep {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #9E9E9E;
        font-size: 12px;
    }

    .accep i {
        font-size: 24px;
        padding-right: 5px;
    }

    .op {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #1CA4FC;
        font-size: 12px;
    }

    .op i {
        font-size: 24px;
        padding-right: 5px;
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
        height: 56px;
    }

    .select-container {
        display: flex;
        align-items: center;
        margin: 0px 40px;
    }

    .select-container span {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        margin: 0px 10px;
        color: #212529;
    }

    .arrows-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 0px 40px;
    }

    .arrows-container span {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        color: #212529;
    }

    .arrows-container button {
        color: #FE9400;
    }

</style>