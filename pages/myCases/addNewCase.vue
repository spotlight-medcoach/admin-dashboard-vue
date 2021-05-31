<template>
    <div>
        <SpotlighterNavigation />
        
        <div class="back">
            <nuxt-link to="/myCases">
                <i class="fas fa-chevron-left"></i>
                Volver
            </nuxt-link>
        </div>

        <div class="case-container">
            <div class="title-container">
                <h3>Datos del caso</h3>
                <button type="button" class="btn cancel" @click="discardCase"><i class="fas fa-trash mr-5 pr-5"></i> Descartar caso</button>
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
                    <Input
                        type="text"
                        placeholder="12345"
                        v-model="id"
                        title="ID" />
                </div>
            </div>

            <div class="inputs-container">
                <div class="input">
                    <select v-model="topicBubbleSelected" class="js-example-basic-single" @change="filterSubtopics(topicBubbleSelected)">
                        <option value="" disabled selected>Tema</option>
                        <option :value="top.bubble_id" v-for="top in topics" :key="top._id">{{top.name}}</option>
                    </select>
                </div>
                <div class="input">
                    <select v-model="subtopicBubbleSelected" class="js-example-basic-single">
                        <option value="" selected>Elegir subtema</option>
                        <option :value="sub.subtopic" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                    </select>
                </div>
                <div class="input">
                    <Input
                        type="text"
                        placeholder="Español"
                        v-model="language"
                        title="Idioma" />
                </div>
            </div>

            <div class="description-container">
                <h3>Descripción del caso</h3>
                <textarea v-model="description" name="" id="" cols="30" rows="10"></textarea>
            </div>

            <div class="questions-container">
                <h3>Preguntas</h3>
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

            <!-- Loader -->
            <div class="lds-dual-ring" v-if="busy"></div>

            <div class="request-case">
                <button class="btn" @click="requestCase"><i class="fas fa-list-alt"></i> <span>Solicitar nuevo caso</span></button>
            </div>
        </div>
        <!-- <h2>name: {{name}}</h2>
        <h2>id: {{id}}</h2>
        <h2>topic: {{topicBubbleSelected}}</h2>
        <h2>subtopic: {{subtopicBubbleSelected}}</h2>
        <h2>idioma: {{language}}</h2>
        <h2>descrición: {{description}}</h2> -->
    </div>
</template>

<script>
import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import Input from '../../components/inputs/Input';
import QuestionCard from '../../components/cards/QuestionsCard';

export default {
    components: {
        SpotlighterNavigation,
        Input,
        QuestionCard
    },
    data() {
        return {
            userData: {},
            busy: false,
            dataCase: {},
            topics: [],
            subtopics: [],
            name: '',
            id: '',
            topicBubbleSelected: '',
            subtopicBubbleSelected: '',
            language: '',
            description: '',
            questions: []
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.userData = JSON.parse(localStorage.getItem('user'));
        }
    },
    methods: {
        async requestCase() {
            this.busy = !this.busy;
            let caseResponse = await this.$axios.post('/createPendingCase', {
                admin_user: this.userData.admin_id,
                pending_case_id: this.id,
                name: this.name,
                topic_bubble: this.topicBubbleSelected,
                subtopic_bubble: this.subtopicBubbleSelected,
                language: this.language,
                description: this.description,
                requested: true,
                spotlighter_id: this.userData.spotlighter_id.spotlighter_id
            });

            alert(caseResponse.data.message);

            this.busy = !this.busy;
            this.$router.push({ path: '/myCases'});
        },
        discardCase() {
             this.$router.push({ path: '/myCases'});
        },
        filterSubtopics(topic) {
            let topicFiltered = this.topics.filter(top => top.bubble_id == topic)
            this.subtopics = topicFiltered[0].subtopics
        },
        addQuestion() {
            alert('Add question')
        },
        updateQuestion() {
            alert('Update question')
        },
        deleteQuestion() {
            alert('Delete question')
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

    .case-name {
        width: 65%;
        margin: 10px 0px;
    }

    .input {
        width: 30%;
        margin: 10px 0px;
    }

    .description-container {
        display: flex;
        flex-direction: column;
    }

    .description-container h3 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
        color: #000;
        margin: 20px 0px;
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
        justify-content: flex-end;
    }

    .request-case button {
        display: flex;
        color: #FFF;
        background: #20B000;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        padding: 12px 20px;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        align-items: center;
    }

    .request-case i {
        font-size: 24px;
        margin: 0px 12px;
    }

    /* estilos para el loading predeterminado */
    .lds-dual-ring {
        display: inline-block;
        width: 50px;
        height: 50px;
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