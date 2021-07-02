<template>
    <div>
        <SpotlighterNavigation />
        
        <Loading v-if="loading" />
        <div v-else class="details-container">
            <div class="back-btn">
                <nuxt-link to="/myCases">
                    <i class="fas fa-chevron-left"></i>
                    Volver
                </nuxt-link>
            </div>

            <div class="cancel-container">
                <h1>Detalles del caso</h1>
                <button type="button" class="btn cancel" @click="discardConfirm"><i class="fas fa-trash mr-1"></i> Descartar caso</button>
            </div>

            <!-- Card con los detalles del caso -->
            <CaseDetailsCardSpotlighter
                v-if="!loading"
                :caseName="caseDetails.name"
                :id="caseDetails.pending_case_id"
                :language="caseDetails.language"
                :theStatus="caseDetails.status"
                :request_description="caseDetails.request_description.content.ops[0].insert"
                :feedback="caseDetails.feedback.content.ops[0].insert"
                :topic="caseDetails.name_topic"
                :subtopic="caseDetails.name_subtopic"
                :user="caseDetails.admin_user.name + ' ' + caseDetails.admin_user.last_name" />
            
            <div class="description-container">
                <h1>Descripción del caso</h1>
                    <!-- v-model="contentDescription" -->
                <quill-editor
                    :options="editorOption"
                    @ready="onEditorReady($event)" 
                    @change="onEditorChange($event)" />
            </div>

            <div class="questions-container">
                <h1>Preguntas</h1>

                <!-- Loader -->
                <div v-if="isBusyQuestions" class="load-container">
                    <div class="lds-dual-ring"></div>
                </div>

                <div v-else class="each-question">
                    <QuestionCardSpotlighter 
                        v-for="(ques, index) in questions"
                        :key="ques._id"
                        :question="ques"
                        :ind="index"
                        @updateQuestion="updateQuestion(questions[index], index)"
                        @deleteQuestion="deleteQuestionConfirm(questions[index])" />
                </div>

                <div class="add-question-container">
                    <button class="btn" @click="requestQuestion"><i class="fas fa-plus-circle"></i> Agregar pregunta</button>
                </div>
            </div>

            <div class="buttons-container">
                <button class="btn draft" @click="draftConfirm"><i class="fas fa-save"></i> Guardar como borrador</button>
                <button class="btn send" @click="saveAndSendConfirm"><i class="fas fa-paper-plane"></i> Guardar y enviar caso</button>
            </div>
        </div>

        <!-- Agregar pregunta -->
        <AddQuestionSpotlighter
            v-if="isShowModalAddQuestion"
            :typ="types"
            @close="closeModal"
            :data.sync="questionData"
            @addQues="addQuestion" />

        <!-- Detalle de pregunta -->
        <CaseQuestionDetailsModalSpotlighter
            v-if="isShowModalQuestionDetails"
            @close="closeUpdateQuestionModal"
            @reload="reloadQuestions"
            :toUpdate="questionToUpdate"
            :typ="types"
            :case="caseDetails._id"
            :data.sync="questionUpdated" />

        <!-- Guardar como borrador -->
        <AcceptModal 
            v-if="isShowModalAcceptDraft"
            @close="closeAcceptModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="saveAsDraft"
            :textButton="button"
            :isBusy="busyDraft" />

        <!-- Guardar y enviar a revisión -->
        <AcceptModal 
            v-if="isShowModalAcceptSend"
            @close="closeAcceptModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="saveAndSend"
            :textButton="button"
            :isBusy="busySend" />

        <!-- Descartar caso -->
        <RejectModal 
            v-if="isShowModalReject"
            @close="closeRejectModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="discardCase"
            :textButton="button"
            :isBusy="busyReject" />
        
        <!-- Eliminar pregunta -->
        <RejectModal 
            v-if="isShowModalDeleteQuestion"
            @close="closeRejectDeleteQuestionModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="deleteQuestion"
            :textButton="button"
            :isBusy="busyDeleteQuestion" />

    </div>
</template>

<script>
import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import QuestionCardSpotlighter from '../../components/cards/spotlighters/QuestionCardSpotlighter';
import CaseDetailsCardSpotlighter from '../../components/cards/spotlighters/CaseDetailsCardSpotlighter';
import Loading from '../../components/modals/Loading';
import AddQuestionSpotlighter from '../../components/modals/spotlighters/AddQuestionSpotlighter';
import CaseQuestionDetailsModalSpotlighter from '../../components/modals/spotlighters/CaseQuestionDetailsModalSpotlighter';
import AcceptModal from '../../components/modals/AcceptModal';
import RejectModal from '../../components/modals/RejectModal';

export default {
    components: {
        SpotlighterNavigation,
        QuestionCardSpotlighter,
        CaseDetailsCardSpotlighter,
        Loading,
        AddQuestionSpotlighter,
        CaseQuestionDetailsModalSpotlighter,
        AcceptModal,
        RejectModal
    },
    data() {
        return {
            loading: false,
            busy: false,
            isBusyQuestions: false,
            busyDraft: false,
            busySend: false,
            busyReject: false,
            busyDeleteQuestion: false,
            isShowModalAcceptDraft: false,
            isShowModalAcceptSend: false,
            isShowModalReject: false,
            isShowModalAddQuestion: false,
            isShowModalQuestionDetails: false,
            isShowModalDeleteQuestion: false,

            caseDetails: {},
            questions: [],
            questionData: {},
            indexQuestion: 0,
            topics: [],
            types: [],
            questionToUpdate: {},
            questionUpdated: {},
            questionToDelete: '',

            titleModal: '',
            bodyModal: '',
            button: '',
            
            contentDescription: '',
            contentHtml: '',
            editorOption: {
                theme: 'snow',
                placeholder: 'Descripción del caso...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'], 
                        [{ 'align': [] }, { 'list': 'ordered'}, { 'list': 'bullet' },{ 'indent': '-1'}, { 'indent': '+1' }, { 'script': 'sub'}, { 'script': 'super' }],
                        ['link', 'image']
                    ]
                }
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
        console.log('caseDetails: ', this.caseDetails)
        // console.log('content', this.content)
        console.log('questions: ', this.questions)
    },
    methods: {
        onEditorReady(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.caseDetails.description.content.ops)))
        },
        onEditorChange({ quill, html, text }) {
            this.contentDescription = quill.getContents();
            // this.contentHtml = quill.root.innerHTML;
            this.contentHtml = html;
        },
        async getCaseDetails() {
            this.loading = !this.loading;
            
            let caseResponse = await this.$axios.get('/getDetails', { params: { case_id: this.$route.params.id } })
            this.caseDetails = caseResponse.data.payload;
            this.caseDetails.name_topic = this.filterTopic(this.caseDetails.topic_bubble);
            this.caseDetails.name_subtopic = this.filterSubtopic(this.caseDetails.topic_bubble, this.caseDetails.subtopic_bubble)
            
            this.questions = this.caseDetails.pending_questions;
            this.contentDescription = this.caseDetails.description.content.ops[0].insert;
            this.contentHtml = this.caseDetails.description.html;

            this.loading = !this.loading;
        },
        async updateCaseDraft(newStatus) {
            try {
                let updateCaseResponse = await this.$axios.put('/updatePendingCase', {
                    case_id: this.caseDetails._id,
                    status: newStatus,
                    description: {
                        content: this.contentDescription,
                        html: this.contentHtml
                    }
                })

                setTimeout(() => {
                    alert(updateCaseResponse.data.message)
                }, 2000)

                console.log('drafy updated', updateCaseResponse)
            } catch (err) {
                console.log(err);
            }
        },
        requestQuestion() {
            this.isShowModalAddQuestion = !this.isShowModalAddQuestion;
        },
        async addQuestion() {
            try {
                this.indexQuestion += 1;
                // Agregar y crear las pending questions
                let questionsResponse = await this.$axios.post('/createPendingQuestion', {
                    case_id: this.caseDetails._id,
                    index: this.indexQuestion,
                    importance: this.questionData.dificulty,
                    type: this.questionData.type,
                    question: {
                        content: this.questionData.question.content,
                        html: this.questionData.question.html
                    },
                    answers: this.questionData.answers,
                    correct_answer: this.questionData.correct_answer,
                    retro: {
                        content: this.questionData.retro.content,
                        html: this.questionData.retro.html
                    }
                });
    
                alert(questionsResponse.data.message);
                this.questions.push(questionsResponse.data.payload.question_created);
                console.log('responseQuestion', questionsResponse);
            } catch (err) {
                console.log(err)
            }
        },
        updateQuestion(question, index) {
            this.questionToUpdate = question;
            this.questionToUpdate.indexInArray = index;
            this.isShowModalQuestionDetails = !this.isShowModalQuestionDetails;
        },
        reloadQuestions() {
            this.questions[this.questionUpdated.indexInArray] = this.questionUpdated.updated;
        },
        deleteQuestionConfirm(question) {
            this.questionToDelete = question._id
            this.titleModal = 'Eliminar pregunta'
            this.bodyModal = '¿Deseas eliminar esta pregunta? Esta acción eliminará la pregunta junto con las respuestas y puede deshacerse.'
            this.button = 'Eliminar'
            this.isShowModalDeleteQuestion = !this.isShowModalDeleteQuestion;
        },
        async deleteQuestion() {
            try {
                console.log('delete')
                this.busyDeleteQuestion = !this.busyDeleteQuestion;

                let deleteQuestionResponse = await this.$axios.delete('/deleteQuestion', {
                    params: {
                        case_id: this.$route.params.id,
                        question_id: this.questionToDelete
                    }
                })

                alert(deleteQuestionResponse.data.message);
                this.questions = this.questions.filter(ques => ques._id != this.questionToDelete)
                console.log('new ques', this.questions)

                this.busyDeleteQuestion = !this.busyDeleteQuestion;
                this.isShowModalDeleteQuestion = !this.isShowModalDeleteQuestion;
            } catch (err) {
                console.log(err)
            }
        },
        filterTopic(topic_bubble) {
            let topic = '';
            topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0].name
            return topic;
        },
        filterSubtopic(topic_bubble, subtopic_bubble) {
            var topic
            var subtopic
            topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0]
            subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);

            return subtopic[0].name
        },
        draftConfirm() {
            this.titleModal = 'Guardar como borrador';
            this.bodyModal = 'Tu caso estará en estado de edición, solo tú lo podrás ver para que puedas continuar editandolo.';
            this.button = 'Guardar caso';
            
            this.isShowModalAcceptDraft = !this.isShowModalAcceptDraft;
        },
        async saveAsDraft() {
            this.busyDraft = !this.busyDraft;

            setTimeout(() => {
                this.busyDraft = !this.busyDraft;
                this.isShowModalAcceptDraft = !this.isShowModalAcceptDraft;

                this.updateCaseDraft('In edit');
                this.$router.push({ path: '/myCases'});
            }, 1500)
        },
        saveAndSendConfirm() {
            this.titleModal = 'Guardar como borrador';
            this.bodyModal = "Tu caso se enviará al panel de administración para ser revísado. Si toda la información es correcta, se publicará en los simuladores o en caso de ser necesario, recibirás comentarios y feedback para su corrección. \n Una vez enviado no podrás modificarlo a menos que lo solicite el administrador. ¿Deseas enviarlo?";
            this.button = 'Guardar y enviar caso';

            this.isShowModalAcceptSend = !this.isShowModalAcceptSend;
        },
        async saveAndSend() {
            this.busySend = !this.busySend;

            this.updateCaseDraft('Pending review');

            // let sendToReviewResponse = await this.$axios.put('/sendToReview', {
            //     case_id: this.$route.params.id,
            //     description: {
            //         content: this.contentDescription,
            //         html: this.contentHtml
            //     }
            // });

            // console.log(sendToReviewResponse)

            setTimeout(() => {
                this.busySend = !this.busySend;
                this.isShowModalAcceptSend = !this.isShowModalAcceptSend;
                this.$router.push({ path: '/myCases'});
            }, 1000);
        },
        discardConfirm() {
            this.titleModal = 'Descartar caso';
            this.bodyModal = 'Al descartar este caso, se eliminará toda la información relacionada con él. Esta \ acción no se puede deshacerse. ¿Deseas descartarlo?';
            this.button = 'Descartar caso';
            this.isShowModalReject = !this.isShowModalReject;
        },
        discardCase() {
            this.busyReject = !this.busyReject;

            setTimeout(() => {
                this.isShowModalReject = !this.isShowModalReject;
                this.busyReject = !this.busyReject;

                this.$router.push({ path: '/myCases'});
            }, 1500);
        },
        closeModal() {
            this.isShowModalAddQuestion = false;
            this.isShowModalAcceptDraft = false;
            this.isShowModalAcceptSend = false;
        },
        closeAcceptModal() {
            this.isShowModalAcceptDraft = false;
            this.isShowModalAcceptSend = false;
        },
        closeRejectModal() {
            this.isShowModalReject = false;
        },
        closeRejectDeleteQuestionModal() {
            this.isShowModalDeleteQuestion = false;
        },
        closeUpdateQuestionModal() {
            this.isShowModalQuestionDetails = false;
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
        margin: 20px 0px;
    }

    .cancel-container h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
    }

    .cancel {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        color: #DB1212;
        margin-right: 2%;
    }

    .description-container {
        display: flex;
        flex-direction: column;
        margin: 20px 0px;
        height: 200px;
    }

    .quill-editor {
        height: 50%;
    }

    .details-container h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
    }

    .questions-container {
        display: flex;
        flex-direction: column;
    }

    .questions-container h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
        margin: 0;
    }

    .each-question {
        display: flex;
        flex-direction: column;
    }

    .add-question-container i {
        color: #FFF;
        font-size: 20px;
        margin: 0px 6px;
    }

    .add-question-container button {
        padding: 12px 20px;
        color: #FFF;
        background: #FE9400;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 20px 0px;
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