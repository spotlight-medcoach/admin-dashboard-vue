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
                <button type="button" class="btn cancel" @click="discardCase"><i class="fas fa-trash mr-5 pr-5"></i> Descartar caso</button>
            </div>

            <DescriptionCard
                :caseName="caseDetails.name"
                :id="caseDetails.pending_case_id"
                :language="caseDetails.language"
                :request_description="caseDetails.request_description"
                :topic="caseDetails.name_topic"
                :subtopic="caseDetails.name_subtopic" />

            <div class="description-container">
                <h1>Descripción del caso</h1>
                <h5>Editor de texto</h5>
                <!-- <quill-editor
                    :content="content"
                    :options="editorOption"
                    @change="onEditorChange($event)"
                /> -->

                <!-- <quill-editor
                    ref="myQuillEditor"
                    v-model="content"
                    :options="editorOption"
                    @blur="onEditorBlur($event)"
                    @focus="onEditorFocus($event)"
                    @ready="onEditorReady($event)"
                /> -->

                <!-- <quill-editor
                    ref="noteQuillEditor"
                    v-model="content"
                    :options="editorOption"
                    @blur="onEditorBlur($event)"
                /> -->
            </div>

            <div class="questions-container">
                <h1>Preguntas</h1>

                <div class="each-question">
                    <QuestionCard 
                        v-for="(ques, index) in questions"
                        :key="ques._id"
                        :question="ques"
                        :ind="index"
                        :updateQuestion="updateQuestion"
                        :deleteQuestion="deleteQuestion" />
                </div>

                <div class="add-question-container">
                    <button class="btn" @click="addQuestion"><i class="fas fa-plus-circle"></i> Agregar pregunta</button>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
// import 'quill/dist/quill.core.css';
// import 'quill/dist/quill.snow.css';
// import 'quill/dist/quill.bubble.css';

// { rel: "stylesheet", href: "path/to/quill.core.css" },
// { rel: "stylesheet", href: "path/to/quill.snow.css" },
// { rel: "stylesheet", href: "path/to/quill.bubble.css" }
// { src: "path/to/quill.js", type: "text/javascript" },
// { src: "path/to/vue.min.js", type: "text/javascript" },
// { src: "path/to/dist/vue-quill-editor.js", type: "text/javascript" }

import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import DescriptionCard from '../../components/cards/DescriptionCard';
import QuestionCard from '../../components/cards/QuestionsCard';
import Loading from '../../components/modals/Loading';
// import { quillEditor } from 'vue-quill-editor'

export default {
    components: {
        SpotlighterNavigation,
        DescriptionCard,
        QuestionCard,
        Loading
        // quillEditor
    },
    data() {
        return {
            loading: false,
            caseDetails: {},
            questions: [],
            topics: [],
            content: '',
            editorOption: ''
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
        }

        await this.getCaseDetails();
        // console.log('case: ', this.caseDetails)
        // console.log('ques: ', this.questions)
    },
    methods: {
        async getCaseDetails() {
            this.loading = !this.loading;
            
            let caseResponse = await this.$axios.get('/getDetails', { params: { case_id: this.$route.params.id } })
            this.caseDetails = caseResponse.data.payload;
            this.caseDetails.name_topic = this.filterTopic(this.caseDetails.topic_bubble);
            this.caseDetails.name_subtopic = this.filterSubtopic(this.caseDetails.topic_bubble, this.caseDetails.subtopic_bubble)
            
            this.questions = this.caseDetails.pending_questions;
            // console.log('cas: ', this.caseDetails.pending_questions)

            this.loading = !this.loading;
        },
        updateQuestion() {
            alert('update question')
        },
        deleteQuestion() {
            alert('delete question')
        },
        addQuestion() {
            alert('add question')
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
        discardCase() {
            this.$router.push({ path: '/myCases'});
        },
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
</style>