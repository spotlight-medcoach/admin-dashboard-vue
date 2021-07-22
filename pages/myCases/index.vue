<template>
    <div>
        <SpotlighterNavigation />

        <div class="my-cases-container">
            <div class="head-container">
                <div class="title">
                    <h1>Mis casos</h1>
                </div>

                <div v-if="!loading" class="pay-container">
                    <p>Fecha de último pago: </p>
                    <p class="date-payment">{{userData.spotlighter_id.last_date_payment ? new Date(userData.spotlighter_id.last_date_payment).toLocaleDateString('es-ES') : 'Aún no has recibido un pago.'}}</p>
                    <button class="btn" @click="requestPaymentConfirm" :disabled="userData.spotlighter_id.request_payment"><i class="fas fa-dollar-sign"></i> Solicitar pago</button>
                </div>
            </div>

            <Loading v-if="loading" />
            <div v-else class="filter-container">
                <div class="search-input">
                    <input v-model="search" type="text" placeholder="Buscar" @keyup.enter="searchCases">
                </div>

                <select v-model="statusSelected" name="status" class="js-example-basic-single" @change="getMyCases">
                    <option value="" selected>Todos los estados</option>
                    <option value="Pending review">Revisión pendiente</option>
                    <option value="In edit">En edición</option>
                    <option value="With feedback">Feedback</option>
                    <option value="Approved">Aprobados</option>
                </select>

                <select v-model="topicSelected" name="topic" class="js-example-basic-single" @change="filterSubtopics(topicSelected)">
                    <option value="" selected>Temas</option>
                    <option :value="top" v-for="top in topics" :key="top._id">{{top.name}}</option>
                </select>

                <select v-model="subtopicSelected" name="subtopic" class="js-example-basic-single" @change="getCasesFilteredBySubtopic(subtopicSelected)">
                    <option value="" selected>Subtemas</option>
                    <option :value="sub.subtopic" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                </select>

                <button class="btn" @click="addCase"><i class="fas fa-plus-circle"></i> Crear nuevo caso</button>
            </div>

            <div v-if="!loading" class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-cases">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Descripcion requerida</th>
                            <th scope="col">Estado</th>
                            <th scope="col" class="actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(theCase, index) in myCases" :key="theCase._id">
                            <td>{{ theCase.pending_case_id }}</td>
                            <td>{{ theCase.name }}</td>
                            <td>{{ theCase.topic_name }}</td>
                            <td>{{ theCase.subtopic_name }}</td>
                            <td>{{ theCase.request_description.content.ops[0].insert }}</td>
                            
                            <td v-if="theCase.status == 'In edit'"><div class="edit">En edición</div></td>
                            <td v-else-if="theCase.status == 'Accepted by Spotlighter'"><div class="accepted">Aceptado</div></td>
                            <td v-else-if="theCase.status == 'Pending review'"><div class="review">Revisión pendiente</div></td>
                            <td v-else-if="theCase.status == 'With feedback'"><div class="feedback">Feedback</div></td>
                            <td v-else-if="theCase.status == 'Approved'"><div class="approved">Aprobado</div></td>

                            <td class="td-style">
                                <button class="btn op" @click="viewCase(myCases[index])"><i class="fas fa-list-alt"></i> Ver caso</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="!loading" class="pagination-container">
                <div class="select-container">
                    <span>Resultados por página: </span>
                    <select v-model="pageResults" class="js-example-basic-single" @change="rowsChange">
                        <option value=1>1</option>
                        <option value=2>2</option>
                        <option value=3>3</option>
                        <option value=5>5</option>
                        <option value=10>10</option>
                        <option value=20>20</option>
                    </select>
                </div>

                <div class="arrows-container">
                    <span>{{ (page - 1) * pageResults + 1 }} - {{ pageResults > totalCases ? totalCases : (page * pageResults) > totalCases ? totalCases : page * pageResults }} de {{totalCases}} casos</span>
                    <button class="btn fas fa-chevron-left" @click="before" :disabled="disbaledBefore == 1"></button>
                    <button class="btn fas fa-chevron-right" @click="after" :disabled="disabledAfter == 1"></button>
                </div>
            </div>
        </div>

        <RequestPayment
            v-if="isShowPaymentModal"
            @close="closePaymentModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :isBusy="busyPayment"
            :action="requestPayment"
            :textButton="button"
            :questions="userData.spotlighter_id.questions_created.length"
            payment="calcular" />

    </div>
</template>

<script>
import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import Loading from '../../components/modals/Loading';
import RequestPayment from '../../components/modals/spotlighters/RequestPayment';

export default {
    components: {
        SpotlighterNavigation,
        Loading,
        RequestPayment
    },
    data() {
        return {
            loading: false,
            isShowPaymentModal: false,
            busyPayment: false,

            userData: {},
            myCases: [],
            topics: [],
            subtopics: [],
            statusSelected: '',
            topicSelected: '',
            subtopicSelected: '',
            topicBubbleSelected: '',
            subtopicBubbleSelected: '',
            search: '',

            titleModal: '',
            bodyModal: '',
            button: '',

            totalCases: 0,
            pageResults: 10,
            page: 1,
            disbaledBefore: 0,
            disabledAfter: 0,
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`

            // Los metodos para hacer esto no están en este archivo
            /* if (!localStorage.getItem('universities'))
                await this.getUniversities()
            if (!localStorage.getItem('topics'))
                await this.getTopics() */
            this.userData = JSON.parse(localStorage.getItem('user'))
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.universities = JSON.parse(localStorage.getItem('universities'));

        }

        await this.getMyCases();
        this.before();
    },
    methods: {
        async getMyCases() {
            this.loading = !this.loading;

            let casesResponse = await this.$axios.get('/getMyCases', {
                params: {
                    status: this.statusSelected,
                    topic_bubble: this.topicBubbleSelected,
                    subtopic_bubble: this.subtopicBubbleSelected,
                    pageResults: this.pageResults,
                    page: this.page,
                    pending_case_id: this.search
                }
            })

            this.myCases = casesResponse.data.payload.cases;
            this.totalCases = casesResponse.data.payload.length;
            console.log('my cases', this.myCases);

            this.filterTopicSubtopicName();
            this.loading = !this.loading;
        },
        searchCases() {
            try {
                this.getMyCases();
            } catch (err) {
                console.log(err);
            }
        },
        filterSubtopics(topic) {
            this.topicBubbleSelected = topic.bubble_id;
            this.subtopics = topic.subtopics;
            this.getMyCases();
        },
        getCasesFilteredBySubtopic(subtopic) {
            this.subtopicBubbleSelected = subtopic;
            this.getMyCases();
        },
        filterTopicSubtopicName() {
            let casesUpdated = []
            this.myCases.forEach(oneCase => {
                oneCase.topic_name = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0].name
                let topic = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0]

                let subtopic = topic.subtopics.filter(sub => sub.subtopic == oneCase.subtopic_bubble)
                oneCase.subtopic_name = subtopic[0].name
                
                casesUpdated.push(oneCase);
            });
            this.myCases = casesUpdated;
        },
        addCase() {
            this.$router.push({ path: '/myCases/addNewCase', query: { length: this.myCases.filter(cas => cas.requested == false).length } });
            // console.log('myCases', this.myCases.filter(cas => cas.requested == false));
        },
        requestPaymentConfirm() {
            this.titleModal = 'Solicitar pago'
            this.bodyModal = '¿Deseas solicitar el pago de este periodo? Al realizar esta acción el contador quedará en ceros al igual que tu saldo pendiente y se reiniciará el conteo de preguntas.'
            this.button = 'Solicitar pago'
            
            this.isShowPaymentModal = !this.isShowPaymentModal;
        },
        async requestPayment() {
            this.busyPayment = !this.busyPayment;

            let paymentResponse = await this.$axios.put('/requestPayment', { spotlighter_id: this.userData.spotlighter_id.spotlighter_id})

            this.userData.spotlighter_id.request_payment = true;

            if (process.browser) {
                console.log('yes')
                localStorage.setItem('user', JSON.stringify(this.userData));
                this.$store.commit('setUserInfo', this.userData);
            }

            alert(paymentResponse.data.message);
            this.busyPayment = !this.busyPayment;
            this.isShowPaymentModal = !this.isShowPaymentModal;
        },
        rowsChange() {
            this.page = 1;

            if (this.pageResults > this.totalCases || this.totalCases == 0) {
                this.disabledAfter = 1
                this.disbaledBefore = 1
            } else {
                this.disbaledBefore = 1
                this.disabledAfter = 0
            }

            this.getMyCases()
        },
        before() {
            if (this.page == 1) {
                this.disbaledBefore = 1
                if (this.totalCases == 0)
                    this.disabledAfter = 1
                else {
                    if (this.totalCases > this.pageResults)
                        this.disabledAfter = 0
                    else
                        this.disabledAfter = 1
                }
            } else if (this.page > 1) {
                this.page -= 1;
                this.disabledAfter = 0

                if (this.page == 1)
                    this.disbaledBefore = 1
                
                this.getMyCases();
            }
        },
        after() {
            this.page += 1;
            if (this.page * this.pageResults > this.totalCases) {
                this.disabledAfter = 1
                this.disbaledBefore = 0
            } else {
                if (this.page > 1)
                    this.disbaledBefore = 0
            }

            this.getMyCases();
        },
        viewCase(theCase) {
            this.$router.push({ path: `/myCases/${theCase._id}` });
        },
        closePaymentModal() {
            this.isShowPaymentModal = false;
        }
    }
}
</script>

<style scoped>
    .my-cases-container {
        display: flex;
        flex-direction: column;
        margin: 20px 20px;
        font-family: Montserrat;
    }

    .head-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 48px;
    }

    .title h1 {
        margin: 0;
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
    }

    .pay-container {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .pay-container p {
        margin-bottom: 0;
    }

    .date-payment {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #1CA4FC;
        margin: 0px 8px;
    }

    .pay-container button {
        background: #20B000;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        color: #FFF;
        font-weight: bold;
        margin-left: 40px;
        padding: 12px 20px;
        width: 254px;
        height: 48px;
    }

    .filter-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0px;
    }

    .search-input {
        height: 48px;
        width: 35%;
    }

    .search-input input {
        height: 100%;
        width: 100%;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
        padding: 15px;
    }

    .search-input input:focus {
        outline: none;
    }

    .filter-container button {
        border-radius: 10px;
        color: #1CA4FC;
        border: 1px solid #1CA4FC;
        font-weight: bold;
        padding: 12px 20px;
        width: 254px;
        height: 48px;
    }

    .filter-container select {
        height: 32px;
        width: 12%;
        /* margin: 0px 115px; */
        border: none;
        border-bottom: 1px solid #000;
        background-color: transparent;
        background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill=''><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;
        background-size: 12px;
        background-position: calc(100% - 10px) center;
        background-repeat: no-repeat;
        -webkit-appearance: none;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        border-bottom-left-radius: 0px;
    }

    .filter-container select:focus {
        outline: none;
    }

    .thead-cases {
        background: #212529;
        color: #FFF;
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

    .tbody {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 18px;
        color: #212529;
    }

    td {
        vertical-align: middle;
    }

    .edit {
        font-weight: bold;
        text-align: center;
        background: #FFDE89;
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

    .review {
        font-weight: bold;
        text-align: center;
        background: #FBD6E9;
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

    .approved {
        font-weight: bold;
        text-align: center;
        background: #90DF7E;
        border-radius: 4px;
        padding: 4px 12px;
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