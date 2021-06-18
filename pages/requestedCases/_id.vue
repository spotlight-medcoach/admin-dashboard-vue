<template>
    <div>
        <Navigation />

        <div class="details-container">
            <div class="back-btn">
                <nuxt-link to="/requestedCases">
                    <i class="fas fa-chevron-left"></i>
                    Volver
                </nuxt-link>
            </div>

            <div class="cancel-container">
                <h1>Detalles del caso</h1>
                <div v-if="!loading" class="buttons">
                    <div v-if="caseDetails.case_status == 'Pending'">
                        <button type="button" class="btn cancel" @click="discardCaseConfirm"><i class="fas fa-trash px-2"></i>Eliminar caso</button>
                    </div>

                    <div v-else-if="caseDetails.case_status == 'Pending review'">
                        <button type="button" class="btn retro-btn" @click="retroAlert"><i class="fas fa-exclamation"></i> Dar retroalimentación</button>
                    </div>

                    <div v-else-if="caseDetails.case_status == 'With feedback'">
                        <button type="button" class="btn retro-btn" @click="retroAlert"><i class="fas fa-exclamation"></i> Dar retroalimentación</button>
                    </div>
                </div>
            </div>

            <Loading v-if="loading" />

            <!-- Card con los detalles del caso -->
            <CaseDetailsReviewCard
                v-if="!loading"
                :caseName="caseDetails.name"
                :id="caseDetails.pending_case_id"
                :language="caseDetails.language"
                :theStatus="caseDetails.case_status"
                :request_description="caseDetails.request_description.content.ops[0].insert"
                :topic="caseDetails.name_topic"
                :subtopic="caseDetails.name_subtopic"
                :user="caseDetails.admin_user.name + ' ' + caseDetails.admin_user.last_name" />
            
            <div v-if="!loading" class="description-container">
                <h1>Descripción del caso</h1>
                <span v-if="caseDetails.status == 'Pending'" class="my-3 text-danger">Aún no hay información sobre este caso.</span>
                <quill-editor
                    v-else
                    :options="editorOption"
                    @ready="onEditorReady($event)" 
                    @change="onEditorChange($event)" />
            </div>

            <div v-if="!loading" class="questions-container">
                <h1>Preguntas</h1>

                <span v-if="caseDetails.status == 'Pending'" class="my-3 text-danger">Aún no hay preguntas asignadas a este caso.</span>
                
                <div v-else class="each-question">
                    <!-- Card de cada pregunta -->
                    <QuestionReviewCard
                        @view="viewQuestion(ques)"
                        v-for="(ques, index) in questions"
                        :key="ques._id"
                        :ind="index"
                        :question="ques.question.content.ops[0].insert" />
                </div>
            </div>

            <div v-if="!loading" class="buttons-container">
                <div v-if="caseDetails.case_status == 'Pending review' || caseDetails.case_status == 'With feedback'">
                    <button class="btn draft" @click="bankConfirm"><i class="fas fa-book"></i> Autorizar y agregar al banco</button>
                    <button class="btn send" @click="simulatorConfirm"><i class="fas fa-book-open"></i> Autorizar y agregar al simulador</button>
                </div>

            </div>
        </div>

        <!-- Ver detalles de pregunta -->
        <QuestionDetailsReviewModalAdministrator 
            v-if="isShowQuestionDetailsModal"
            @close="closeQuestionDetailsModal"
            :question="questionSelected" />

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

        <!-- Modalo para agregar al banco -->
        <AddToBankModal
            v-if="isShowAddToBankModal"
            @close="closeAddToBankModal"
            @add="addTobank"
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

        <!-- Descartar caso -->
        <RejectModal 
            v-if="isShowModalDiscardCase"
            @close="closeRejectDiscardCaseModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="discardCase"
            :textButton="button"
            :isBusy="busyDiscardCase" />

    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';
import QuestionReviewCard from '../../components/cards/administrators/QuestionReviewCard';
import QuestionDetailsReviewModalAdministrator from '../../components/modals/administrators/QuestionDetailsReviewModalAdministrator'
import CaseDetailsReviewCard from '../../components/cards/administrators/CaseDetailsReviewCard';
import SetRetroModal from '../../components/modals/administrators/SetRetroModal';
import AddToBankModal from '../../components/modals/administrators/AddToBankModal';
import AddToSimulator from '../../components/modals/administrators/AddToSimulator';
import RejectModal from '../../components/modals/RejectModal';

export default {
    components: {
        Navigation,
        Loading,
        QuestionReviewCard,
        QuestionDetailsReviewModalAdministrator,
        CaseDetailsReviewCard,
        SetRetroModal,
        AddToBankModal,
        AddToSimulator,
        RejectModal
    },
    data() {
        return {
            loading: false,
            busy: false,
            busyBank: false,
            isShowModalDiscardCase: false,
            busyDiscardCase: false,
            isShowQuestionDetailsModal: false,
            isShowRetroModal: false,
            isShowAddToBankModal: false,
            isShowAddToSimulatorModal: false,
            busySimulator: false,

            titleModal: '',
            bodyModal: '',
            button: '',
            topics: [],
            simulators: [],
            simulatorSelected: '',

            caseDetails: {},
            questions: [],
            questionSelected: {},
            name: '',
            pending_case_id: '',
            language: '',
            // status: '',
            request_description: '',
            feedback: '',
            name_topic: '',
            name_subtopic: '',
            theFeedback: '',

            contentDescription: '',
            contentHtml: '',
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
            // this.types = JSON.parse(localStorage.getItem('types'));
        }

        await this.getCaseDetails();
        await this.getSimulators();
        console.log('case', this.caseDetails)
    },
    methods: {
        onEditorReady(quill) {
            // Poner datos en el quill
            quill.setContents(JSON.parse(JSON.stringify(this.caseDetails.description.content.ops)))
        },
        onEditorChange({ quill, html, text }) {
            //  Obtener datos del quill
            this.contentDescription = quill.getContents();
            this.contentHtml = quill.root.innerHTML;
        },
        async getCaseDetails() {
            // Obtener datos del caso
            try {
                this.loading = !this.loading;

                let caseDetailsResponse = await this.$axios.get('/getDetails', { params: { case_id: this.$route.params.id } })
                
                // console.log('status: ', caseDetailsResponse.data.payload)
                this.caseDetails = {
                    ...caseDetailsResponse.data.payload,
                    case_status: caseDetailsResponse.data.payload.status
                };
                
                this.questions = caseDetailsResponse.data.payload.pending_questions;

                this.caseDetails.name_topic = this.filterTopicName(this.caseDetails.topic_bubble);
                this.caseDetails.name_subtopic = this.filterSubtopicName(this.caseDetails.topic_bubble, this.caseDetails.subtopic_bubble)
                // alert(caseDetailsResponse.data.message);
                
                this.loading = !this.loading
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
            // Obtener el nombre del tema
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0].name
            return topic;
        },
        filterSubtopicName(topic_bubble, subtopic_bubble) {
            // Obtener el nombre del subtema
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0]
            let subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);

            return subtopic[0].name
        },
        discardCaseConfirm() {
            // Modal para eliminar el caso
            if (this.caseDetails.case_status == 'Pending') {
                console.log('here')
                this.titleModal = 'Eliminar caso';
                this.bodyModal = '¿Deseas eliminar este caso definitivamente? Esta acción no puede deshacerse.';
                this.button = 'Sí, eliminar';
            }
            
            this.isShowModalDiscardCase = !this.isShowModalDiscardCase;
        },
        async discardCase() {
            // Eliminar el caso
            try {
                this.busyDiscardCase = !this.busyDiscardCase;

                let deleteResponse = await this.$axios.delete('deletePendingCase', { params: { case_id: this.$route.params.id } })

                console.log(deleteResponse)

                this.busyDiscardCase = !this.busyDiscardCase;
                this.isShowModalDiscardCase = !this.isShowModalDiscardCase;
                this.$router.push({ path: `/requestedCases` });
            } catch (err) {
                console.log(err);
            }
        },

        retroAlert() {
            // Modal de retroalimentación para el caso
            this.titleModal = 'Retroalimentación para el caso';
            this.bodyModal = 'Escribe aquí los comentarios sobre el caso';
            this.button = 'Enviar retroalimentación'

            this.isShowRetroModal = !this.isShowRetroModal;
        },
        updateFeedback() {
            // Actualizar el feedback sin API
            this.caseDetails.feedback = this.theFeedback;
        },

        viewQuestion(question) {
            // Ver detalles de preguntas
            this.questionSelected = question;
            this.isShowQuestionDetailsModal = !this.isShowQuestionDetailsModal;
        },


        bankConfirm() {
            // Modal para agregar al banco
            this.titleModal = 'Autorizar y agregar al banco'
            this.bodyModal = 'Este caso se enviará al banco de preguntas. ¿Deseas autorizarlo?'
            this.button = 'Agregar al banco'

            this.isShowAddToBankModal = !this.isShowAddToBankModal
        },
        async addTobank() {
            try {
                this.busyBank = !this.busyBank;

                let bankResponse = await this.$axios.post('/addPendingToBank', {
                    pending_case_id: this.$route.params.id
                })

                console.log(bankResponse);
                alert(bankResponse.data.message);

                this.busyBank = !this.busyBank;
                this.isShowAddToBankModal = !this.isShowAddToBankModal;
                this.$router.push({ path: `/requestedCases` });
            } catch (err) {
                console.log(err);
            }
        },

        simulatorConfirm() {
            // Modal para agregar a simulador
            this.titleModal = 'Agregar caso al simulador'
            this.bodyModal = ' Selecciona el simulador al que deseas enviar este caso.'
            this.button = 'Agregar al simulador'
            
            this.isShowAddToSimulatorModal = !this.isShowAddToSimulatorModal;
        },
        async addToSimulator() {
            try {
                this.busySimulator = !this.busySimulator;

                let addToSimulatorResponse = await this.$axios.post('/addToSimulator', { pending_case_id: this.$route.params.id })

                alert(addToSimulatorResponse.data.message);
                console.log(addToSimulatorResponse.data.payload);

                this.busySimulator = !this.busySimulator;
                this.isShowAddToSimulatorModal = !this.isShowAddToSimulatorModal;
                this.$router.push({ path: `/requestedCases` });
            } catch (err) {
                console.log(err)
            }
        },
        closeRejectDiscardCaseModal() {
            this.isShowModalDiscardCase = false;
        },
        closeQuestionDetailsModal() {
            this.isShowQuestionDetailsModal = false;
        },
        closeRetroModal() {
            this.isShowRetroModal = false;
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

    .cancel-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0px;
    }

    .cancel-container h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 32px;
        line-height: 39px;
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

    .description-container {
        display: flex;
        flex-direction: column;
        margin: 20px 0px;
    }

    .details-container h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
    }

    .questions-container {
        display: flex;
        flex-direction: column;
    }

    .questions-container h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        margin: 0;
    }

    .each-question {
        display: flex;
        flex-direction: column;
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

    .draft {
        border: 1px solid #1CA4FC;
        color: #1CA4FC;
    }

    .send {
        background: #20B000;
        color: #FFF;
    }

    /* estilos para el loading predeterminado */
    .load-container {
        display: flex;
        justify-content: center;
    }

    .lds-dual-ring {
        display: inline-block;
        width: 50px;
        height: 50px;
        margin: 0px auto;
    }

    .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 44px;
        height: 44px;
        /* margin: 8px; */
        border-radius: 50%;
        border: 6px solid #FE9400;
        border-color: #FE9400 transparent #FE9400 transparent;
        animation: lds-dual-ring 1.2s linear infinite;
    }

    @keyframes lds-dual-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>