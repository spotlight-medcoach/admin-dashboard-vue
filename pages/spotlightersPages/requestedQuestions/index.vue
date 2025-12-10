<template>
    <div>
        <SpotlighterNavigation />

        <div class="questions-container">
            <div class="head-container">
                <div class="title">
                    <p>Preguntas solicitadas</p>
                </div>

                <div v-if="!loading" class="filter-container">
                    <select v-model="topicBubbleSelected" class="js-example-basic-single" @change="filterSubtopics(topicBubbleSelected)" name="topic" id="topic">
                        <option value="">Tema</option>
                        <option :value="top.bubble_id" v-for="top in topics" :key="top._id">{{top.name}}</option>
                    </select>

                    <select v-model="subtopicBubbleSelected" class="js-example-basic-single" @change="getCasesRequested()" name="subtopic" id="subtopic">
                        <option value="">Elegir subtema</option>
                        <option :value="sub.subtopic" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                    </select>
                </div>
            </div>

            <Loading v-if="loading" />
            <div v-else class="table-container">

                <RequestQuestionCard
                    v-for="oneCase in casesRequested"
                    :key="oneCase._id"
                    @aceptCase="acceptConfirm"
                    @rejectCase="rejectConfirm"
                    :name="oneCase.name"
                    :topicName="oneCase.topic_name"
                    :subtopicName="oneCase.subtopic_name"
                    :requestDescription="oneCase.request_description.content.ops[0].insert"
                    :id="oneCase._id" />
            </div>

            <div v-if="!loading" class="pagination-container">
                <div class="result-container">
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

            <AcceptModal 
                v-if="isShowModalAccept"
                @close="closeAcceptModal"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :name="nameUser"
                :action="acceptCase"
                :textButton="button"
                :isBusy="busy" />
                
            <RejectModal 
                v-if="isShowModalReject"
                @close="closeRejectModal"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :name="nameUser"
                :action="rejectCase"
                :textButton="button"
                :isBusy="busy" />

            <SuccessToast
                v-if="showSuccessToast"
                :textTitle="titleModal" />

            <FailToast 
                v-if="showFailToast"
                :textTitle="titleModal" />

        </div>
    </div>
</template>

<script>
import SpotlighterNavigation from '@/components/navs/spotlighter.nav.vue';
import Loading from '@/components/modals/loading.modal.vue';
import RequestQuestionCard from '@/components/cards/request-question.card.vue';
import AcceptModal from '@/components/modals/accept.modal.vue';
import RejectModal from '@/components/modals/reject.modal.vue';
import SuccessToast from '@/components/toasts/success.toast.vue';
import FailToast from '@/components/toasts/fail.toast.vue';

export default {
    components: {
        SpotlighterNavigation,
        Loading,
        RequestQuestionCard,
        AcceptModal,
        RejectModal,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            busy: false,
            loading: false,
            isShowModalAccept: false,
            isShowModalReject: false,
            showSuccessToast: false,
            showFailToast: false,

            titleModal: '',
            bodyModal: '',
            nameUser: '',
            topicBubbleSelected: '',
            subtopicBubbleSelected: '',
            case_id: '',
            button:'',

            casesRequested: [],
            topics: [],
            subtopics: [],
            universities: [],

            totalCases: 0,
            pageResults: 10,
            page: 1,
            disbaledBefore: 0,
            disabledAfter: 0,
        }
    },
    async created() {
        this.loading = !this.loading
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            
            // if (!localStorage.getItem('universities'))
            //     await this.getUniversities()
            // if (!localStorage.getItem('topics'))
            //     await this.getTopics()
            // if (!localStorage.getItem('types'))
            //     await this.getTypes()
            
            if (!localStorage.getItem('universities') || !localStorage.getItem('types') || !localStorage.getItem('topics'))
                await this.getToLocalStorage();
            
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.universities = JSON.parse(localStorage.getItem('universities'));
        }
        this.loading = !this.loading

        await this.getCasesRequested();
        this.before();
    },
    methods: {
        async getToLocalStorage() {
            try {
                let localResponse = await this.$axios.get('/localStorage');

                localStorage.setItem('universities', JSON.stringify(localResponse.data.payload.universities));
                this.$store.commit('setUniversities');

                localStorage.setItem('topics', JSON.stringify(localResponse.data.payload.topics));
                this.$store.commit('setTopics');

                localStorage.setItem('types', JSON.stringify(localResponse.data.payload.types));
                this.$store.commit('setTypes');

            } catch (err) {
                console.log(err);
            }
        },
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
        async getTypes() {
            let types = await this.$axios.get('/getTypes');
            localStorage.setItem('types', JSON.stringify(types.data.payload));
            this.$store.commit('setTypes');
        },
        async getCasesRequested() {
            try {
                this.loading = !this.loading

                let casesResponse = await this.$axios.get(`/getCasesRequested`, {
                    params: {
                        topic_bubble: this.topicBubbleSelected,
                        subtopic_bubble: this.subtopicBubbleSelected
                    }
                });
    
                this.casesRequested = casesResponse.data.payload.cases
                this.totalCases = casesResponse.data.payload.length
                this.filterTopicSubtopicName();

                this.loading = !this.loading
            } catch (err) {
                console.log(err);
            }
        },
        filterSubtopics(topic_bubble) {
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)
            this.subtopics = topic[0].subtopics
            
            this.getCasesRequested();
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
        
        acceptConfirm(case_id) {
            console.log('accept', case_id)
            this.titleModal = 'Aceptar caso solicitado';
            this.bodyModal = 'Al aceptar esta petición, el caso aparecerá en la sección \"Mis casos\" donde podrás crear el contenido que fue solicitado.'
            this.case_id = case_id;
            this.button = 'Aceptar caso';
            this.isShowModalAccept = !this.isShowModalAccept;
        },
        rejectConfirm(case_id) {
            console.log('reject', case_id)
            this.titleModal = 'Rechazar caso';
            this.bodyModal = 'Al rechazar esta petición ya no podrás crea contenido para este caso y se asignará a otro usuario.';
            this.case_id = case_id;
            this.button = 'Rechazar caso';
            this.isShowModalReject = !this.isShowModalReject;
        },
        async acceptCase() {
            try {
                this.busy = !this.busy

                let assignResponse = await this.$axios.put('/assingCase', {
                    case_id: this.case_id,
                    new_status: 'Accepted by Spotlighter'
                })

                this.isShowModalAccept = !this.isShowModalAccept;
                
                // alert(assignResponse.data.message)
                this.titleModal = assignResponse.data.message;
                this.showSuccessToast = !this.showSuccessToast;

                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                    this.busy = !this.busy
                }, 1500);

                this.getCasesRequested();
            } catch (err) {
                console.log(err);
                this.busy = !this.busy;

                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },
        async rejectCase() {
            try {
                this.busy = !this.busy

                let rejectResponse = await this.$axios.put('/rejectCaseRequested', {
                    case_id: this.case_id
                })

                this.isShowModalReject = !this.isShowModalReject;
                alert(rejectResponse.data.message)
                this.busy = !this.busy
                this.getCasesRequested();
            } catch (err) {
                console.log(err);
            }
        },
        closeAcceptModal() {
            this.isShowModalAccept = !this.isShowModalAccept;
            this.caseToAcceptId = '';
        },
        closeRejectModal() {
            this.isShowModalReject = !this.isShowModalReject;
            this.caseToRejectId = '';
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

            this.getCasesRequested()
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
                
                this.getCasesRequested();
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

            this.getCasesRequested();
        },
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
        justify-content: space-between;
        position: static;
        height: 32px;
        width: 30%;
    }

    .filter-container select {
        height: 32px;
        width: 45%;
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

    .actions-btn {
        display: flex;
        flex-direction: row;
    }


    .pagination-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 56px;
        margin: 10px 0px;
    }

    .result-container {
        display: flex;
        align-items: center;
        margin: 0px 40px;
    }

    .result-container span {
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