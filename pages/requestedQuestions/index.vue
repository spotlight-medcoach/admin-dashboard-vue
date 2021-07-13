<template>
    <div>
        <SpotlighterNavigation />

        <div class="questions-container">
            <div class="head-container">
                <div class="title">
                    <p>Preguntas solicitadas</p>
                </div>

                <div v-if="!loading" class="filter-container">
                    <div class="select-container">
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
                <div class="select-container">
                    <span>Rows per page: </span>
                    <select v-model="pageResults" class="js-example-basic-single" @change="rowsChange">
                        <option value=1>1</option>
                        <option value=2>2</option>
                        <option value=3>3</option>
                        <option value=5>5</option>
                        <option value=10>10</option>
                        <option value=15>15</option>
                        <option value=20>20</option>
                    </select>
                </div>

                <div class="arrows-container">
                    <span>1 - {{pageResults}} of {{totalCases}} casos</span>
                    <button class="btn fas fa-chevron-left" @click="before"></button>
                    <button class="btn fas fa-chevron-right" @click="after"></button>
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
import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import Loading from '../../components/modals/Loading';
import RequestQuestionCard from '../../components/cards/RequestQuestionCard';
import AcceptModal from '../../components/modals/AcceptModal';
import RejectModal from '../../components/modals/RejectModal';
import SuccessToast from '../../components/toasts/SuccessToast';
import FailToast from '../../components/toasts/FailToast';

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
            page: 1,
            pageResults: 5
        }
    },
    async created() {
        this.loading = !this.loading
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            
            if (!localStorage.getItem('universities'))
                await this.getUniversities()
            if (!localStorage.getItem('topics'))
                await this.getTopics()
            if (!localStorage.getItem('types'))
                await this.getTypes()
            
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.universities = JSON.parse(localStorage.getItem('universities'));
        }
        this.loading = !this.loading

        await this.getCasesRequested();
        console.log('cases', this.casesRequested)
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
            this.getCasesRequested()
        },
        before() {
            alert('Logica para esta asunto')
        },
        after() {
            alert('Logica para esta asunto')
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