<template>
    <div>
        <Navigation />

        <Loading v-if="loading" />
        <div v-else class="details-container">
            <div class="back-btn">
                <nuxt-link to="/requestedCases">
                    <i class="fas fa-chevron-left"></i>
                    Volver
                </nuxt-link>
            </div>

            <div class="cancel-container">
                <h1>Detalles del caso</h1>
                <div class="buttons">
                    <button type="button" class="btn cancel" @click="discardCaseConfirm"><i class="fas fa-trash mr-5 pr-5"></i> Descartar caso</button>
                    <button type="button" class="btn retro-btn" @click="retroAlert"><i class="fas fa-exclamation"></i> Dar retroalimentación</button>
                </div>
            </div>

            <DescriptionCard
                :caseName="caseDetails.name"
                :id="caseDetails.pending_case_id"
                :language="caseDetails.language"
                :theStatus="caseDetails.status"
                :request_description="caseDetails.request_description"
                :feedback="caseDetails.feedback"
                :topic="caseDetails.name_topic"
                :subtopic="caseDetails.name_subtopic" />
            
            <div class="description-container">
                <h1>Descripción del caso</h1>
                <quill-editor
                    v-model="content"
                    :options="editorOption" />
            </div>

            <div class="questions-container">
                <h1>Preguntas</h1>

                <!-- Loader -->
                <div v-if="busy" class="load-container">
                    <div class="lds-dual-ring"></div>
                </div>

                <div v-else class="each-question">
                    <QuestionCard 
                        v-for="(ques, index) in questions"
                        :key="ques._id"
                        :question="ques"
                        :ind="index"
                        :updateQuestion="updateQuestion"
                        :deleteQuestion="deleteQuestion"
                        @updateQuestion="updateQuestion(questions[index])"
                        @deleteQuestion="deleteQuestionConfirm(questions[index])" />
                </div>
            </div>

            <div class="buttons-container">
                <button class="btn draft" @click="bankConfirm"><i class="fas fa-book"></i> Autorizar y agregar al banco</button>
                <button class="btn send" @click="simulatorConfirm"><i class="fas fa-book-open"></i> Autorizar y agregar al simulador</button>
            </div>
        </div>

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
import DescriptionCard from '../../components/cards/DescriptionCard';
import RejectModal from '../../components/modals/RejectModal';

export default {
    components: {
        Navigation,
        Loading,
        DescriptionCard,
        RejectModal
    },
    data() {
        return {
            loading: false,
            busy: false,
            isShowModalDiscardCase: false,
            busyDiscardCase: false,

            titleModal: '',
            bodyModal: '',
            button: '',
            topics: [],

            caseDetails: {},
            questions: [],
            name: '',
            pending_case_id: '',
            language: '',
            status: '',
            request_description: '',
            feedback: '',
            name_topic: '',
            name_subtopic: '',

            content: '',
            editorOption: {
                theme: 'snow',
                placeholder: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti veniam, illum esse sunt soluta iste deleniti, ab autem alias magnam sapiente, ipsam officiis eveniet laborum sint? Eum exercitationem alias maiores?',
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
            // this.types = JSON.parse(localStorage.getItem('types'));
        }

        await this.getCaseDetails();
    },
    methods: {
        async getCaseDetails() {
            try {
                this.loading = !this.loading;

                let caseDetailsResponse = await this.$axios.get('/getDetails', { params: { case_id: this.$route.params.id } })

                this.caseDetails = caseDetailsResponse.data.payload;
                this.content = caseDetailsResponse.data.payload.request_description.html;
                this.caseDetails.name_topic = this.filterTopicName(this.caseDetails.topic_bubble);
            this.caseDetails.name_subtopic = this.filterSubtopicName(this.caseDetails.topic_bubble, this.caseDetails.subtopic_bubble)
                // alert(caseDetailsResponse.data.message);
                
                this.loading = !this.loading
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
        discardCaseConfirm() {
            this.isShowModalDiscardCase = !this.isShowModalDiscardCase;
            this.titleModal = 'Descartar caso';
            this.bodyModal = 'Al descartar este caso, se eliminará toda la información relacionada con él. Esta acción no se puede deshacerse. ¿Deseas descartarlo?';
            this.button = 'Descartar caso';
        },
        async discardCase() {
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
            alert('Retroalimentaión')
        },
        requestQuestion() {

        },
        updateQuestion() {

        },
        deleteQuestionConfirm() {

        },
        bankConfirm() {
            alert('Confirm to bank')
        },
        simulatorConfirm() {
            alert('Confirm to simulator')
        },
        closeRejectDiscardCaseModal() {
            this.isShowModalDiscardCase = false;
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