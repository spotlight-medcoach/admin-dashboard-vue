<template>
    <div>
        <SpotlighterNavigation />
        
        <div class="back">
            <nuxt-link to="/spotlightersPages/myCases">
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
                    <QuestionCardSpotlighter
                        v-for="(ques, index) in questions"
                        :key="ques._id"
                        :question="ques"
                        :ind="index"
                        @updateQuestion="updateQuestion(questions[index], index)"
                        @deleteQuestion="deleteQuestionConfirm(questions[index])" />
                </div>

                <div class="add-question-container">
                    <button class="btn" @click="requestCase"><i class="fas fa-plus-circle"></i> Agregar pregunta</button>
                </div>
            </div>

            <!-- Loader -->
            <div class="lds-dual-ring" v-if="busy"></div>

            <div class="request-case">
                <button class="btn draft" @click="draftConfirm"><i class="fas fa-save"></i> Guardar como borrador</button>
                <button class="btn send" @click="saveAndSendConfirm"><i class="fas fa-paper-plane"></i> Guardar y enviar caso</button>
            </div>
        </div>

        <!-- Agregar pregunta al caso -->
        <AddQuestionSpotlighter
            v-if="isShowModalAddQuestion"
            :typ="types"
            @close="closeModal"
            :data.sync="questionData"
            @addQues="addQuestion" />

        <!-- Detalle de pregunta para actualizar -->
        <CaseQuestionDetailsModalSpotlighter
            v-if="isShowModalQuestionDetails"
            @close="closeUpdateQuestionModal"
            @reload="reloadQuestions"
            :toUpdate="questionToUpdate"
            :typ="types"
            :case="dataCase._id"
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

        <!-- Enviar a revisión -->
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

        <SuccessToast
            v-if="showSuccessToast"
            :textTitle="titleModal" />

        <FailToast 
            v-if="showFailToast"
            :textTitle="titleModal" />
        
    </div>
</template>

<script>
import SpotlighterNavigation from '../../../components/navs/SpotlighterNavigation';
import Input from '../../../components/inputs/Input';
import QuestionCardSpotlighter from '../../../components/cards/spotlighters/QuestionCardSpotlighter';
import AddQuestionSpotlighter from '../../../components/modals/spotlighters/AddQuestionSpotlighter';
import CaseQuestionDetailsModalSpotlighter from '../../../components/modals/spotlighters/CaseQuestionDetailsModalSpotlighter';
import AcceptModal from '../../../components/modals/AcceptModal';
import RejectModal from '../../../components/modals/RejectModal';
import SuccessToast from '../../../components/toasts/SuccessToast';
import FailToast from '../../../components/toasts/FailToast';

export default {
    components: {
        SpotlighterNavigation,
        Input,
        QuestionCardSpotlighter,
        AddQuestionSpotlighter,
        CaseQuestionDetailsModalSpotlighter,
        AcceptModal,
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
            isShowModalAddQuestion: false,
            isShowModalAcceptDraft: false,
            isShowModalAcceptSend: false,
            isShowModalReject: false,
            isShowModalQuestionDetails: false,
            isShowModalDeleteQuestion: false,
            showSuccessToast: false,
            showFailToast: false,

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
            id: 'S-',
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
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.userData = JSON.parse(localStorage.getItem('user'));
            this.types = JSON.parse(localStorage.getItem('types'));
        }

        // console.log(this.topics)
    },
    methods: {
        onEditorChangeDescription({ quill, html, text }) {
            this.contentDescription = quill.getContents();
            this.contentHtml = html;
        },
        async requestCase() {
            try {
                if (this.name.trim() == '' || this.topicBubbleSelected == '' || this.subtopicBubbleSelected == '' || this.languageSelected == '' || this.contentDescription.ops[0].insert.trim() == '') {
                    this.titleModal = 'Todos los campos deben ser llenados';
                    this.showFailToast = !this.showFailToast;

                    setTimeout(() => {
                        this.showFailToast = !this.showFailToast;
                    }, 1);
                } else {
                    // Mostramos el modal para agregar la pregunta y creamos el caso en la BD
                    this.isShowModalAddQuestion = !this.isShowModalAddQuestion;
                    
                    // Crear el pending case
                    if (!this.dataCase._id) {
                        console.log('Crear caso y al mostrar modal de crear pregunta')

                        let caseResponse = await this.$axios.post('/createPendingCase', {
                            admin_user: this.userData.admin_id,
                            pending_case_id: this.new_id,
                            name: this.name,
                            topic_bubble: this.topicBubbleSelected,
                            subtopic_bubble: this.subtopicBubbleSelected,
                            language: this.languageSelected,
                            description: {
                                content: this.contentDescription,
                                html: this.contentHtml
                            },
                            status: 'In edit',
                            requested: false,
                            request_description: {
                                content: {
                                    ops: [{
                                        insert: ''
                                    }]
                                },
                                html: ''
                            },
                            feedback: {
                                content: {
                                    ops: [{
                                        insert: ''
                                    }]
                                },
                                html: ''
                            },
                            spotlighter_id: this.userData.spotlighter_id.spotlighter_id
                        });

                        this.indexQuestion += 1
                        this.dataCase = caseResponse.data.payload;
                        // alert(caseResponse.data.message)
                        console.log('caseCreated', this.dataCase);
                    } else {
                        this.indexQuestion += 1
                    }
                }
            } catch (err) {
                console.log(err);
            }
            
        },
        draftConfirm() {
            if (this.name.trim() == '' || this.topicBubbleSelected == '' || this.subtopicBubbleSelected == '' || this.languageSelected == '' || this.contentHtml.trim() == '') {
                    this.titleModal = 'Todos los campos deben ser llenados';
                    this.showFailToast = !this.showFailToast;

                    setTimeout(() => {
                        this.showFailToast = !this.showFailToast;
                    }, 1);
            } else {
                this.titleModal = 'Guardar como borrador';
                this.bodyModal = 'Tu caso estará en estado de edición, solo tú lo podrás ver para que puedas continuar editandolo.';
                this.button = 'Guardar caso';
                
                this.isShowModalAcceptDraft = !this.isShowModalAcceptDraft;
            }
        },
        async saveAsDraft() {
            try {
                console.log('save as draft')
                // Si se guarda como borrador y no se ha creado el caso, se crea y regresamos a /myCases
                this.busyDraft = !this.busyDraft;

                if (!this.dataCase._id) {
                    console.log('create case and save as draft')

                    let caseResponse = await this.$axios.post('/createPendingCase', {
                        admin_user: this.userData.admin_id,
                        pending_case_id: this.new_id,
                        name: this.name,
                        topic_bubble: this.topicBubbleSelected,
                        subtopic_bubble: this.subtopicBubbleSelected,
                        language: this.languageSelected,
                        description: {
                            content: this.contentDescription,
                            html: this.contentHtml
                        },
                        status: 'In edit',
                        requested: false,
                        request_description: {
                            content: {
                                ops: [{
                                    insert: ''
                                }]
                            },
                            html: ''
                        },
                        feedback: {
                            content: {
                                ops: [{
                                    insert: ''
                                }]
                            },
                            html: ''
                        },
                        spotlighter_id: this.userData.spotlighter_id.spotlighter_id
                    });

                    this.dataCase = caseResponse.data.payload;
                    console.log('caseCreated', this.dataCase);

                    // alert(caseResponse.data.message)
                    this.titleModal = caseResponse.data.message 
                    this.showSuccessToast = !this.showSuccessToast;
                } else {
                    this.titleModal = 'Caso almacenado como borrador';
                    this.showSuccessToast = !this.showSuccessToast;
                }

                setTimeout(() => {
                    this.busyDraft = !this.busyDraft;
                    this.isShowModalAcceptDraft = !this.isShowModalAcceptDraft;
                    this.showSuccessToast = !this.showSuccessToast;

                    this.$router.push({ path: '/spotlightersPages/myCases'});
                }, 2500)
            } catch (err) {
                console.log(err);

                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },
        saveAndSendConfirm() {
            if (this.name.trim() == '' || this.topicBubbleSelected == '' || this.subtopicBubbleSelected == '' || this.languageSelected == '' || this.contentHtml.trim() == '' || this.indexQuestion == 0) {
                this.titleModal = 'Todos los campos deben ser llenados o falta agregar preguntas';
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            } else {
                console.log('save and send confirm')
                this.titleModal = 'Enviar a revisión';
                this.bodyModal = "Tu caso se enviará al panel de administración para ser revísado. Si toda la información es correcta, se publicará en los simuladores o en caso de ser necesario, recibirás comentarios y feedback para su corrección. Una vez enviado no podrás modificarlo a menos que lo solicite el administrador. ¿Deseas enviarlo?";
                this.button = 'Guardar y enviar caso';
    
                this.isShowModalAcceptSend = !this.isShowModalAcceptSend;
            }
        },
        async saveAndSend() {
            try {
                console.log('save and send to review')
                // Solo cambiamos el estado del caso creado
                this.busySend = !this.busySend;

                if (!this.dataCase._id) {
                    console.log('create case save and send')
                    // Si no existe el caso, lo creamos
                    let caseResponse = await this.$axios.post('/createPendingCase', {
                        admin_user: this.userData.admin_id,
                        pending_case_id: this.new_id,
                        name: this.name,
                        topic_bubble: this.topicBubbleSelected,
                        subtopic_bubble: this.subtopicBubbleSelected,
                        language: this.languageSelected,
                        description: {
                            content: this.contentDescription,
                            html: this.contentHtml
                        },
                        status: 'Pending review',
                        requested: false,
                        request_description: {
                            content: {
                                ops: [{
                                    insert: ''
                                }]
                            },
                            html: ''
                        },
                        feedback: {
                            content: {
                                ops: [{
                                    insert: ''
                                }]
                            },
                            html: ''
                        },
                        spotlighter_id: this.userData.spotlighter_id.spotlighter_id
                    });

                    this.dataCase = caseResponse.data.payload;
                    console.log('caseCreated', this.dataCase);

                    // alert(caseResponse.data.message)
                    this.titleModal = caseResponse.data.message;
                    this.showSuccessToast = !this.showSuccessToast;

                    setTimeout(() => {
                        this.showSuccessToast = !this.showSuccessToast;
                    }, 2500);
                } else {
                    console.log('save and send')
                    let changeStatusResponse = await this.$axios.put('/sendToReview', {
                        case_id: this.dataCase._id
                    });
    
                    // alert(changeStatusResponse.data.message);
                    this.titleModal = changeStatusResponse.data.message;
                    this.showSuccessToast = !this.showSuccessToast;

                    console.log(changeStatusResponse.data.payload)
                    setTimeout(() => {
                        this.showSuccessToast = !this.showSuccessToast;
                    }, 1500);
                }
    
                this.busySend = !this.busySend;

                setTimeout(() => {
                    this.isShowModalAcceptSend = !this.isShowModalAcceptSend;
                    this.$router.push({ path: '/spotlightersPages/myCases'});
                }, 1500);
            } catch (err) {
                console.log(err);

                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

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
        
                        this.$router.push({ path: '/spotlightersPages/myCases'});
                    }, 1500);
                } else {
                    let deleteResponse = await this.$axios.delete('/deletePendingCase', {
                        params: { case_id: this.dataCase._id }
                    });
    
                    // alert(deleteResponse.data.message);
                    this.titleModal = deleteResponse.data.message;
                    this.showSuccessToast = !this.showSuccessToast;

                    this.busyReject = !this.busyReject;
    
                    setTimeout(() => {
                        this.isShowModalReject = !this.isShowModalReject;
                        this.showSuccessToast = !this.showSuccessToast;

                        this.$router.push({ path: '/spotlightersPages/myCases'});
                    }, 1500);
                }
            } catch (err) {
                console.log(err);

                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

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
            // console.log(typeof(this.$route.query.length))
        },
        async addQuestion() {
            try {
                // Agregar y crear las pending questions
                console.log('questionData', this.questionData)
                let questionsResponse = await this.$axios.post('/createPendingQuestion', {
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
    
                // alert(questionsResponse.data.message);
                this.titleModal = questionsResponse.data.message;
                this.showSuccessToast = !this.showSuccessToast;

                this.questions.push(questionsResponse.data.payload.question_created);
                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                }, 2000)
                // console.log('responseQuestion', questionsResponse);    
            } catch (err) {
                this.showFailToast = !this.showFailToast;

                const response = err.response;
                this.titleModal = response.data.message;
                console.log('err', response)
                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
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
                        case_id: this.dataCase._id,
                        question_id: this.questionToDelete
                    }
                })

                // alert(deleteQuestionResponse.data.message);
                this.titleModal = deleteQuestionResponse.data.message;
                this.showSuccessToast = !this.showSuccessToast;

                this.questions = this.questions.filter(ques => ques._id != this.questionToDelete)
                console.log('new ques', this.questions)

                this.busyDeleteQuestion = !this.busyDeleteQuestion;
                this.isShowModalDeleteQuestion = !this.isShowModalDeleteQuestion;

                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                }, 1000);
            } catch (err) {
                console.log(err)

                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
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
        closeUpdateQuestionModal() {
            this.isShowModalQuestionDetails = false;
        },
        closeRejectDeleteQuestionModal() {
            this.isShowModalDeleteQuestion = false;
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
        height: 200px;
        /* background: gray; */
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

    .request-case i {
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