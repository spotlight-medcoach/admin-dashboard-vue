<template>
    <div>
        <Navigation />

        <div class="back">
            <nuxt-link to="/findCase">
                <i class="fas fa-chevron-left"></i>
                Volver
            </nuxt-link>
        </div>

        <div class="case-container">
            <div class="title-container">
                <h3>Datos del caso</h3>
                <button type="button" class="btn cancel" @click="discardConfirm"><i class="fas fa-trash"></i> Descartar caso</button>
            </div>

            <div class="inputs-container">
                <div class="case-name">
                    <Input
                        type="text"
                        placeholder="Nombre del caso"
                        v-model="name"
                        title="Nombre del caso" />
                </div>
                <div class="input">
                    <label for="">ID</label>
                    <input type="text" name="" id="" disabled v-model="new_id">
                </div>
            </div>

            <div class="inputs-container topic">
                <div class="topic-container">
                    <h3>Tema</h3>
                    <select v-model="topicBubbleSelected" class="js-example-basic-single" @change="filterSubtopics(topicBubbleSelected)">
                        <option value="" disabled selected>Tema</option>
                        <option :value="top.bubble_id" v-for="top in topics" :key="top._id">{{top.name}}</option>
                    </select>
                </div>
                <div class="subtopic-container">
                    <h3>Subtema</h3>
                    <select v-model="subtopicBubbleSelected" class="js-example-basic-single" @change="changeSubtopic(subtopicBubbleSelected)">
                        <option value="" selected disabled>Subtema</option>
                        <option :value="sub.subtopic" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                    </select>
                </div>

                <div class="language-container">
                    <h3>Idioma</h3>
                    <select v-model="languageSelected" class="js-example-basic-single">
                        <option value="" selected disabled>Idioma</option>
                        <option value="Español">Español</option>
                        <option value="Ingles">Ingles</option>
                    </select>
                </div>
            </div>

            <div class="description-container">
                <h3>Descripción del caso</h3>

                <quill-editor
                    class="editor"
                    :options="editorOption"
                    @change="onEditorChangeDescription($event)" />
            </div>

            <div class="questions-container">
                <h3>Preguntas</h3>
                <div class="each-question">
                    <QuestionCardAdministrator 
                        v-for="(ques, index) in questions"
                        :key="ques._id"
                        :question="ques.question.content.ops[0].insert"
                        :ind="index"
                        @update="updateQuestion(questions[index], index)"
                        @delete="deleteQuestionConfirm(questions[index])" />
                </div>

                <div class="add-question-container">
                    <button class="btn" @click="requestCase"><i class="fas fa-plus-circle"></i> Agregar pregunta</button>
                </div>
            </div>


            <div class="request-case">
                <!-- Loader -->
                <div class="lds-dual-ring" v-if="busy"></div>

                <button class="btn send" @click="saveCase"><i class="fas fa-paper-plane mr-3"></i> Guardar caso</button>
            </div>
        </div>

        <!-- Agregar pregunta -->
        <AddCaseQuestion
            v-if="isShowAddQuestionModal"
            :typ="types"
            @close="closeAddQuestionModal"
            :data.sync="questionData"
            @addQues="addQuestion" />

        <!-- Detalle de pregunta -->
        <CaseQuestionDetailsModal
            v-if="isShowCaseQuestionDetailsModal"
            @close="closeUpdateQuestionModal"
            @reload="reloadQuestions"
            :toUpdate="questionToUpdate"
            :typ="types"
            :case="dataCase._id"
            :data.sync="questionUpdated"
            :simulatorFlag="false" />

        <!-- Eliminar pregunta -->
        <RejectModal 
            v-if="isShowDeleteQuestionModal"
            @close="closeRejectDeleteQuestionModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="deleteQuestion"
            :textButton="button"
            :isBusy="busyDeleteQuestion" />



        <!-- Descartar caso -->
        <RejectModal 
            v-if="isShowModalReject"
            @close="closeRejectModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="discardCase"
            :textButton="button"
            :isBusy="busyReject" />

        <SuccessToast
            v-if="showSuccessToast"
            :textTitle="titleToast" />

        <FailToast 
            v-if="showFailToast"
            :textTitle="titleToast" />
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';
import Input from '../../components/inputs/Input';
import AddCaseQuestion from '../../components/modals/administrators/AddCaseQuestion';
import QuestionCardAdministrator from '../../components/cards/administrators/QuestionCardAdministrator';
import CaseQuestionDetailsModal from '../../components/modals/administrators/CaseQuestionDetailsModal';
import RejectModal from '../../components/modals/RejectModal';
import SuccessToast from '../../components/toasts/SuccessToast';
import FailToast from '../../components/toasts/FailToast';

export default {
    components: {
        Navigation,
        Loading,
        Input,
        AddCaseQuestion,
        QuestionCardAdministrator,
        CaseQuestionDetailsModal,
        RejectModal,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            busy: false,
            busyDraft: false,
            busySend: false,
            busyReject: false,
            busyDeleteQuestion: false,
            isShowAddQuestionModal: false,
            isShowModalReject: false,
            isShowCaseQuestionDetailsModal: false,
            isShowDeleteQuestionModal: false,
            showSuccessToast: false,
            showFailToast: false,
            titleToast: '',

            userData: {},
            dataCase: {},
            topics: [],
            subtopics: [],
            questions: [],
            questionData: {},
            indexQuestion: 0,
            types: [],
            caseIdCreated: '',

            name: '',
            id: 'C-',
            new_id: '',
            topicFolio: '',
            subtopicFolio: '',
            topicBubbleSelected: '',
            subtopicBubbleSelected: '',
            languageSelected: '',
            statusCase: '',

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
    created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.userData = JSON.parse(localStorage.getItem('user'));
            this.types = JSON.parse(localStorage.getItem('types'));
        }
    },
    methods: {
        onEditorChangeDescription({ quill, html, text }) {
            this.contentDescription = quill.getContents();
            this.contentHtml = html;
        },
        async requestCase() {
            try {
                if (this.name.trim() == '' || this.topicBubbleSelected == '' || this.subtopicBubbleSelected == '' || this.languageSelected == '' || this.contentHtml.trim() == '') {
                    this.titleToast = 'Todos los campos deben ser llenados';
                    this.showFailToast = !this.showFailToast;

                    setTimeout(() => {
                        this.showFailToast = !this.showFailToast;
                    }, 1);
                } else {
                    this.isShowAddQuestionModal = !this.isShowAddQuestionModal;

                    if (!this.dataCase._id) {
                        let caseResponse = await this.$axios.post('/createCase', {
                            spotlight_id: this.new_id,
                            name: this.name,
                            topic: this.topicBubbleSelected,
                            subtopic: this.subtopicBubbleSelected,
                            language: this.languageSelected,
                            content: {
                                quill: this.contentDescription,
                                html: this.contentHtml
                            }
                        });

                        this.indexQuestion += 1;
                        console.log('caseCreated', caseResponse.data.payload);
                        this.dataCase = caseResponse.data.payload;
                    } else {
                        this.indexQuestion += 1;
                    }
                }
            } catch (err) {
                console.log(err);
            }
        },
        async addQuestion() {
            try {
                let addQuestionResponse = await this.$axios.post('/addBankQuestion', {
                    case_id: this.dataCase._id,
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

                this.titleToast = addQuestionResponse.data.message;
                this.showSuccessToast = !this.showSuccessToast;

                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                    this.questions.push(addQuestionResponse.data.payload);
                }, 1500);
            } catch (err) {
                const response = err.response;
                this.titleToast = response.data.message;
                this.showFailToast = !this.showFailToast;
                console.log(response.data.message);

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },
        async updateQuestion(question, index) {
            this.questionToUpdate = question;
            this.questionToUpdate.indexInArray = index;
            this.isShowCaseQuestionDetailsModal = !this.isShowCaseQuestionDetailsModal;
        },
        reloadQuestions() {
            this.titleToast = 'Question updated!';
            this.showSuccessToast = !this.showSuccessToast;

            setTimeout(() => {
                this.showSuccessToast = !this.showSuccessToast;
                this.questions[this.questionUpdated.indexInArray] = this.questionUpdated.updated;
            }, 1500);
        },
        deleteQuestionConfirm(question) {
            this.questionToDelete = question._id
            this.titleModal = 'Eliminar pregunta'
            this.bodyModal = '¿Deseas eliminar esta pregunta? Esta acción eliminará la pregunta junto con las respuestas y no puede deshacerse.'
            this.button = 'Eliminar'
            this.isShowDeleteQuestionModal = !this.isShowDeleteQuestionModal;
        },
        async deleteQuestion() {
            try {
                this.busyDeleteQuestion = !this.busyDeleteQuestion;

                let deleteQuestionResponse = await this.$axios.delete('/deleteBankQuestion', {
                    params: {
                        case_id: this.dataCase._id,
                        question_id: this.questionToDelete
                    }
                })

                this.titleToast = deleteQuestionResponse.data.message;
                this.showSuccessToast = !this.showSuccessToast;

                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                    this.busyDeleteQuestion = !this.busyDeleteQuestion;
                    this.isShowDeleteQuestionModal = !this.isShowDeleteQuestionModal;
                    this.questions = this.questions.filter(ques => ques._id != this.questionToDelete);
                }, 1500);
            } catch (err) {
                const response = err.response;
                this.titleToast = response.data.message;
                this.showFailToast = !this.showFailToast;
                console.log(response.data.message);

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },
        filterSubtopics(topic) {
            this.topicFolio = this.topics.filter(top => top.bubble_id == topic)[0].topic_folio;
            
            this.new_id = this.id + this.topicFolio + '-'
            let topicFiltered = this.topics.filter(top => top.bubble_id == topic);
            this.subtopics = topicFiltered[0].subtopics;
        },
        changeSubtopic(subtopic) {
            this.subtopicFolio = this.subtopics.filter(sub => sub.subtopic == subtopic)[0].subtopic_folio;
            this.new_id = this.id + this.topicFolio + '-' + this.subtopicFolio + '-' + (parseInt(this.$route.query.length) + 1);
        },
        async saveCase() {
            try {
                this.busy = !this.busy;

                if (this.name.trim() == '' || this.topicBubbleSelected == '' || this.subtopicBubbleSelected == '' || this.languageSelected == '' || this.contentHtml.trim() == '') {
                    this.titleToast = 'Todos los campos deben ser llenados';
                    this.showFailToast = !this.showFailToast;

                    setTimeout(() => {
                        this.showFailToast = !this.showFailToast;
                        this.busy = !this.busy;
                    }, 1);
                } else {
                    let caseUpdated = await this.$axios.put('/updateBankCase', {
                        case_id: this.dataCase._id,
                        spotlight_id: this.new_id,
                        name: this.name,
                        topic: this.topicBubbleSelected,
                        subtopic: this.subtopicBubbleSelected,
                        language: this.languageSelected,
                        content: {
                            quill: this.contentDescription,
                            html: this.contentHtml
                        }
                    });
    
                    this.titleToast = caseUpdated.data.message;
                    this.showSuccessToast = !this.showSuccessToast;
    
                    setTimeout(() => {
                        this.busy = !this.busy;
                        this.showSuccessToast = !this.showSuccessToast;
                    }, 1500);
                }
            } catch (err) {
                this.busy = !this.busy;

                const response = err.response;
                this.titleToast = response.data.message;
                this.showFailToast = !this.showFailToast;
                console.log(response.data.message);

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }

        },
        discardConfirm() {
            this.titleModal = 'Descartar caso';
            this.bodyModal = 'Al descartar este caso, se eliminará toda la información relacionada con él. Esta \ acción no se puede deshacerse. ¿Deseas descartarlo?';
            this.button = 'Descartar caso';

            this.isShowModalReject = !this.isShowModalReject;
        },
        async discardCase() {
            try {
                this.busyReject = !this.busyReject;

                if (!this.dataCase._id) {
                    setTimeout(() => {
                        this.busyReject = !this.busyReject;
                        this.isShowModalReject = !this.isShowModalReject;
        
                        this.$router.push({ path: '/findCase'});
                    }, 1500);
                } else {
                    let deleteResponse = await this.$axios.delete('/deleteCaseBank', {
                        params: { case_id: this.dataCase._id }
                    })

                    this.titleToast = deleteResponse.data.message;
                    this.showSuccessToast = !this.showSuccessToast;

                    this.busyReject = !this.busyReject;
    
                    setTimeout(() => {
                        this.isShowModalReject = !this.isShowModalReject;
                        this.showSuccessToast = !this.showSuccessToast;

                        this.$router.push({ path: '/findCase'});
                    }, 1500);
                }
            } catch (err) {
                this.busyReject = !this.busyReject;

                const response = err.response;
                this.titleToast = response.data.message;
                this.showFailToast = !this.showFailToast;
                console.log(response.data.message);

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },
        closeRejectModal() {
            this.isShowModalReject = false;
        },
        closeAddQuestionModal() {
            this.isShowAddQuestionModal = false;
        },
        closeUpdateQuestionModal() {
            this.isShowCaseQuestionDetailsModal = false;
        },
        closeRejectDeleteQuestionModal() {
            this.isShowDeleteQuestionModal = false;
        }
    }
}
</script>

<style scoped>
    .back {
        margin: 20px 40px;
    }

    .back a {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        text-decoration: none;
        color: #000;
    }

    .case-container {
        display: flex;
        flex-direction: column;
        margin: 20px 40px;
        font-family: Montserrat;
    }

    .case-container h3 {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
        color: #000;
        margin-bottom: 20px;
    }

    .title-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
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

    .cancel i {
        margin: 0px 8px;
    }

    .inputs-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .topic-container {
        width: 30%;
        margin: 10px 0px;
    }

    .topic-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .topic-container select {
        height: 32px;
        width: 100%;
        border: none;
        border-bottom: 1px solid lightgray;
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

    .topic-container select:focus {
        outline: none;
    }

    .subtopic-container {
        width: 30%;
        margin: 10px 0px;
    }

    .subtopic-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .subtopic-container select {
        height: 32px;
        width: 100%;
        border: none;
        border-bottom: 1px solid lightgray;
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

    .subtopic-container select:focus {
        outline: none;
    }

    .language-container {
        width: 30%;
        margin: 10px 0px;
    }

    .language-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .language-container select {
        height: 32px;
        width: 100%;
        border: none;
        border-bottom: 1px solid lightgray;
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
    
    .language-container select:focus {
        outline: none;
    }

    .topic {
        justify-content: space-between;
    }

    .case-name {
        width: 65%;
        margin: 10px 0px;
    }

    .input {
        display: flex;
        flex-direction: column;
        margin: 10px 0px;
        width: 30%;
    }

    .input label {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .input input {
        margin-top: .5rem;
        background-color:transparent;
        border: 0px solid;
        height:30px;
        width: 100%;
        margin-top: 0px;
        font-family: Montserrat;
    }

    .description-container {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .description-container h3 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
        color: #000;
        margin: 20px 0px;
    }

    .editor {
        filter: drop-shadow(0px 0px 20px #D4D5D7) !important;
        border-radius: 10px !important;
        border: 0px !important;
    }

    .quill-editor {
        height: 50%;
    }

    .questions-container {
        display: flex;
        flex-direction: column;
    }

    .questions-container h3 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
        color: #000;
        margin: 20px 0px;
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
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: #FFF;
        background: #FE9400;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 20px 0px;
    }

    .request-case {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    }

    .request-case button {
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

    .draft {
        border: 1px solid #1CA4FC;
        color: #1CA4FC;
    }

    .send {
        background: #20B000;
        color: #FFF;
    }

    /* estilos para el loading predeterminado */
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