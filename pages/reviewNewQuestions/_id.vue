<template>
    <div>
        <Navigation />
        <!-- {{this.$route.params.id}} -->
        <div class="details-container">
            <div class="back-btn">
                <nuxt-link to="/reviewNewQuestions">
                    <i class="fas fa-chevron-left"></i>
                    Volver
                </nuxt-link>
            </div>

            <div class="title-container">
                <h1>Detalles del caso</h1>
                
                <div v-if="!loading" class="buttons">
                    <button type="button" class="btn cancel" @click="discardConfirm"><i class="fas fa-trash"></i> Descartar caso</button>
                    
                    <button v-if="caseDetails.status != 'With feedback'" type="button" class="btn retro-btn" @click="retroAlert"><i class="fas fa-exclamation"></i> Dar retroalimentación</button>
                    <button v-else class="btn retro-btn" @click="viewRetro"><i class="fas fa-exclamation"></i> Ver retroalimentación</button>
                </div>
            </div>

            <Loading v-if="loading" />

            <!-- Card con los detalles del caso -->
            <CaseDetailsReviewCard
                v-if="!loading"
                :caseName="caseDetails.name"
                :id="caseDetails.pending_case_id"
                :language="caseDetails.language"
                :theStatus="caseDetails.status"
                :request_description="caseDetails.request_description.content.ops[0].insert"
                :topic="caseDetails.name_topic"
                :subtopic="caseDetails.name_subtopic"
                :user="caseDetails.admin_user.name + ' ' + caseDetails.admin_user.last_name" />
            
            <div v-if="!loading" class="description-container">
                <h1>Descripción del caso</h1>
                <quill-editor
                    disabled
                    v-model="content"
                    :options="editorOption"
                    @ready="onEditorReady($event)" />
            </div>

            <div v-if="!loading" class="questions-container">
                <h1>Preguntas</h1>

                <div class="each-question">
                    <QuestionReviewCard
                        @view="viewQuestion(ques)"
                        v-for="(ques, index) in questions"
                        :key="ques._id"
                        :ind="index"
                        :question="ques.question.content.ops[0].insert" />
                </div>

            </div>

            <div v-if="!loading" class="buttons-container">
                <button class="btn bank" @click="addToBankConfirm"><i class="fas fa-save"></i> Agregar al banco</button>
                <button class="btn send" @click="addToSimulatorConfirm"><i class="fas fa-paper-plane"></i> Agregar al simulador</button>
            </div>
        </div>

        <!-- Modal para eliminar spotlighter del caso -->
        <RejectModal 
            v-if="isShowModalReject"
            @close="closeRejectModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="deleteSpotlighterFromCase"
            :textButton="button"
            :isBusy="busyReject" />

        <!-- Modal de retroalimentación -->
        <SetRetroModal 
            v-if="isShowRetroModal"
            @close="closeRetroModal"
            @feed="updateFeedback"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :textButton="button"
            :case_id="this.$route.params.id"
            :feedback="caseDetails.feedback"
            :data.sync="theFeedback" />

        <!-- Modal para ver retroalimentacion -->
        <ViewRetroModal
            v-if="isShowViewRetroModal"
            @close="closeViewRetroModal"
            :feedback="caseDetails.feedback" />

        <!-- Ver detalle de pregunta -->
        <QuestionDetailsReviewModalAdministrator 
            v-if="isShowQuestionDetailsModal"
            @close="closeQuestionDetailsModal"
            :question="questionSelected" />

        <!-- Modalo para agregar al banco -->
        <AddToBankModal
            v-if="isShowAddToBankModal"
            @close="closeAddToBankModal"
            @add="addToBank()"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :textButton="button"
            :isBusy="busyBank" />

        <!-- Agregar al simulador -->
        <AddToSimulator
            v-if="isShowAddToSimulatorModal"
            @close="closeAddToSimulatorModal"
            @addSimu="addToSimulator"
            :data.sync="simulatorSelected"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :textButton="button"
            :allSimulators="simulators"
            :isBusy="busySimulator" />

        <SuccessToast
            v-if="showSuccessToast"
            :textTitle="titleModal" />

        <FailToast 
            v-if="showFailToast"
            :textTitle="titleModal" />
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';
import CaseDetailsReviewCard from '../../components/cards/administrators/CaseDetailsReviewCard';
import QuestionReviewCard from '../../components/cards/administrators/QuestionReviewCard';
import RejectModal from '../../components/modals/RejectModal'
import SetRetroModal from '../../components/modals/administrators/SetRetroModal';
import ViewRetroModal from '../../components/modals/administrators/ViewRetroModal';
import QuestionDetailsReviewModalAdministrator from '../../components/modals/administrators/QuestionDetailsReviewModalAdministrator';
import AddToBankModal from '../../components/modals/administrators/AddToBankModal';
import AddToSimulator from '../../components/modals/administrators/AddToSimulator';
import SuccessToast from '../../components/toasts/SuccessToast';
import FailToast from '../../components/toasts/FailToast';

export default {
    components: {
        Navigation,
        Loading,
        CaseDetailsReviewCard,
        QuestionReviewCard,
        RejectModal,
        SetRetroModal,
        ViewRetroModal,
        QuestionDetailsReviewModalAdministrator,
        AddToBankModal,
        AddToSimulator,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            loading: false,
            isShowModalReject: false,
            busyReject: false,
            isShowRetroModal: false,
            busyRetro: false,
            isShowViewRetroModal: false,
            isShowQuestionDetailsModal: false,
            isShowAddToBankModal: false,
            busyBank: false,
            isShowAddToSimulatorModal: false,
            busySimulator: false,
            showSuccessToast: false,
            showFailToast: false,

            titleModal: '',
            bodyModal: '',
            button: '',
            theFeedback: '',
            questionSelected: {},
            simulatorSelected: '',

            caseDetails: {},
            questions: [],
            topics: [],
            types: [],
            simulators: [],

            content: '',
            editorOption: {
                theme: 'bubble',
                placeholder: 'Respuesta...',
            }
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.types = JSON.parse(localStorage.getItem('types'));
        }

        await this.getCaseDetails();
        await this.getSimulators();
        console.log('id', this.$route.params.id);
        console.log('total', this.$route.query.totalCases)
    },
    methods: {
        onEditorReady(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.caseDetails.description.content.ops)))
        },
        async getCaseDetails() {
            try {
                this.loading = !this.loading;

                let caseResponse = await this.$axios.get('/getDetails', { params: { case_id: this.$route.params.id } })
                this.caseDetails = caseResponse.data.payload;
                this.questions = caseResponse.data.payload.pending_questions;
                this.caseDetails.name_topic = this.filterTopicName(this.caseDetails.topic_bubble);
                this.caseDetails.name_subtopic = this.filterSubtopicName(this.caseDetails.topic_bubble, this.caseDetails.subtopic_bubble)

                console.log('case', this.caseDetails)

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        async getSimulators() {
            try {
                let simulatorsResponse = await this.$axios.get('/getAllSimulators');

                this.simulators = simulatorsResponse.data.payload;
            } catch (err) {
                console.log(err);
            }
        },
        filterTopicName(topic_bubble) {
            let topic = '';
            topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0].name
            return topic;
        },
        filterSubtopicName(topic_bubble, subtopic_bubble) {
            var topic
            var subtopic
            topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0]
            subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);

            return subtopic[0].name
        },

        retroAlert() {
            this.isShowRetroModal = !this.isShowRetroModal;
            
            this.titleModal = 'Retroalimentación';
            this.bodyModal = 'Escribe aquí los comentarios sobre el caso';
            this.button = 'Enviar retroalimentación'

        },
        viewRetro() {
            this.isShowViewRetroModal = !this.isShowViewRetroModal;
        },
        updateFeedback() {
            try {
                this.loading =! this.loading;
    
                this.caseDetails.feedback = this.theFeedback;
                this.caseDetails.status = 'With feedback';

                this.titleModal = 'Feedback updated';
                this.showSuccessToast = !this.showSuccessToast;
                
                setTimeout(() => {
                    this.loading =! this.loading;
                    this.showSuccessToast = !this.showSuccessToast;
                    this.$router.push({ path: `/reviewNewQuestions` });
                }, 1000)
            } catch (err) {
                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;
                
                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },

        viewQuestion(question) {
            this.questionSelected = question;
            console.log(question);
            this.questionSelected.typeDisplay = this.types.filter(typ => typ.bubble_id == question.type)[0].display;
            this.isShowQuestionDetailsModal = !this.isShowQuestionDetailsModal;
        },



        addToBankConfirm() {
            console.log('yes')
            // Modal para agregar al banco
            this.titleModal = 'Autorizar y agregar al banco'
            this.bodyModal = 'Este caso se enviará al banco de preguntas. ¿Deseas autorizarlo?'
            this.button = 'Agregar al banco'

            this.isShowAddToBankModal = !this.isShowAddToBankModal
        },
        async addToBank() {
            try {
                this.busyBank = !this.busyBank;

                let bankResponse = await this.$axios.post('/addPendingToBank', {
                    pending_case_id: this.$route.params.id,
                    // totalCases: parseInt(this.$route.query.totalCases)
                })

                console.log(bankResponse);
                // alert(bankResponse.data.message);

                this.titleModal = bankResponse.data.message;
                this.showSuccessToast = !this.showSuccessToast;

                this.busyBank = !this.busyBank;
                this.isShowAddToBankModal = !this.isShowAddToBankModal;

                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                    this.$router.push({ path: `/reviewNewQuestions` });
                }, 1500);
            } catch (err) {
                console.log(err);
                this.busyBank = !this.busyBank;
                this.isShowAddToBankModal = !this.isShowAddToBankModal;

                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },

        addToSimulatorConfirm() {
            // Modal para agregar a simulador
            this.titleModal = 'Agregar caso al simulador'
            this.bodyModal = ' Selecciona el simulador al que deseas enviar este caso.'
            this.button = 'Agregar al simulador'
            
            this.isShowAddToSimulatorModal = !this.isShowAddToSimulatorModal;
        },
        async addToSimulator() {
            try {
                this.busySimulator = !this.busySimulator;

                let addToSimulatorResponse = await this.$axios.post('/addToSimulator', {
                    pending_case_id: this.$route.params.id,
                    simulator_id: this.simulatorSelected
                })

                alert(addToSimulatorResponse.data.message);
                console.log(addToSimulatorResponse.data.payload);

                this.busySimulator = !this.busySimulator;
                this.isShowAddToSimulatorModal = !this.isShowAddToSimulatorModal;
                this.$router.push({ path: `/reviewNewQuestions` });
            } catch (err) {
                console.log(err)
            }
        },



        discardConfirm() {
            this.isShowModalReject = !this.isShowModalReject;
            this.titleModal = 'Descartar caso';
            this.bodyModal = 'Al descartar caso, únicamente se eliminará la información del usuario actual y podrá volver a ser asignado a alguien más.'
            this.button = 'Descartar caso'
        },
        async deleteSpotlighterFromCase() {
            this.busyReject = !this.busyReject;

            let deleteResponse = await this.$axios.delete('/deletePendingCase', {
                case_id: this.$route.params.id
            })

            setTimeout(() => {
                this.busyReject = !this.busyReject;
                alert(deleteResponse.data.message)
                this.$router.push({ path: '/reviewNewQuestions'});
            })
        },
        closeRejectModal() {
            this.isShowModalReject = false;
        },
        closeRetroModal() {
            this.isShowRetroModal = false;
        },
        closeViewRetroModal() {
            this.isShowViewRetroModal = false;
        },
        closeQuestionDetailsModal() {
            this.isShowQuestionDetailsModal = false
        },
        closeAddToBankModal() {
            this.isShowAddToBankModal = false;
        },
        closeAddToSimulatorModal() {
            this.isShowAddToSimulatorModal = false;
        }
    }
}
</script>

<style scoped>
    .details-container {
        display: flex;
        flex-direction: column;
        margin: 20px 40px;
        font-family: Montserrat;
    }

    .back-btn a {
        color: #000;
        text-decoration: none;
    }

    .title-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0px;
    }

    .title-container h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 32px;
        line-height: 39px;
        color: #000000;
        margin: 0;
    }

    .buttons {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        width: 40%;
    }

    .retro-btn {
        padding: 12px 20px;
        background: #1CA4FC;
        color: #FFF;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
    }

    .retro-btn i {
        margin: 0px 10px;
    }

    .cancel {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        color: #DB1212;
        margin: 0px 40px;
    }

    .description-container h1 {
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        color: #000000;
        margin: 20px 0px;
    }

    .ql-editor {
        padding: 0px 0px !important;
    }

    .questions-container {
        display: flex;
        flex-direction: column;
        margin: 20px 0px;
    }

    .questions-container h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        margin: 0;
    }

    .buttons-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    }

    .buttons-container button {
        padding: 12px 20px;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 0px 20px;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        align-items: center;
    }

    .buttons-container i {
        margin: 0px 8px;
    }

    .bank {
        border: 1px solid #1CA4FC;
        color: #1CA4FC;
    }

    .send {
        background: #20B000;
        color: #FFF;
    }

</style>