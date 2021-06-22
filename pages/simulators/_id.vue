<template>
    <div>
        <Navigation />

        <Loading v-if="loading" />
        
        <div v-else class="sim-container">
            <!-- <h1>{{this.$route.params.id}}</h1> -->
            <div class="header-container">
                <h1>{{simulatorData.name}}</h1>

                <div class="questions-info">
                    <p>Preguntas totales:</p>
                    <span>{{simulatorData.questions.length}}/450</span>
                </div>

                <label class="switch">
                    <input type="checkbox" v-model="simulatorData.enabled" @change="changeStatusSimulator(simulatorData)">
                    <span class="slider round"></span>
                </label>
                <button class="btn" @click="sendQuestions"><i class="fas fa-upload"></i> Enviar preguntas al banco</button>
            </div>

            <div class="body-container">
                <div class="content-container">
                    <h3>Contenido</h3>
                    <hr>

                    <div class="topics-container">
                        <div class="topics">
                            <button
                                class="btn"
                                v-for="topic in topics"
                                :key="topic.topic_id" 
                                @click="changeSubtopics(topic)" >
                                {{topic.topic_name == "Gine&Obstetricia" ? 'Ginecología y obstetricia' : topic.topic_name}}
                                <br>
                                <span>{{topic.total_questions}}/{{simulatorData.questions.length}}</span>
                            </button>
                        </div>

                        <div class="subtopics">
                            <h3>{{topicSelected}}</h3>

                            <ul>
                                <li v-for="subtopic in subtopics" :key="subtopic.subtopic_id">
                                    {{subtopic.subtopic_name}}:<span>{{subtopic.total_questions}}/{{topicTotalQuestions}}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="analitics-container">
                    <h3>Análisis del simulador</h3>
                    <hr>

                    <div>
                        <Chart 
                            :chartData="chartDataType" />
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';
import Chart from '../../components/chart/Chart.vue'

export default {
    
    components: {
        Navigation,
        Loading,
        Chart
    },
    data() {
        return {
            
            loading: false,

            simulatorData: {},
            topics: [],
            topicSelected: '',
            topicTotalQuestions: 0,
            subtopics: [],
            questionsByType: [],
            questionsByDificulty: [],
            chartDataType: {},
            chartOptionsType: {}
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            // this.topics = JSON.parse(localStorage.getItem('topics'));
        }

        await this.getSimulator();
        await this.getQuestionsByType();
        await this.getQuestionsByDificulty();

        this.createDataForType();
    },
    methods: {
        async getSimulator() {
            try {
                this.loading = !this.loading;
                
                let simulatorResponse = await this.$axios.get('/getNumSimulatorQuestionsTopic', { params: { simulator_id: this.$route.params.id } })
                
                this.simulatorData = simulatorResponse.data.payload.simulator;
                this.topics = simulatorResponse.data.payload.topics;

                console.log('simulator', this.simulatorData)
                console.log('topics', this.topics)

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        async getQuestionsByType() {
            try {
                this.loading = !this.loading;

                let typeResponse = await this.$axios.get('/getNumSimulatorQuestionsType', { params: { simulator_id: this.$route.params.id } });
                this.questionsByType = typeResponse.data.payload;
                console.log('type', this.questionsByType);

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        async getQuestionsByDificulty() {
            try {
                this.loading = !this.loading;
                
                let dificultyResponse = await this.$axios.get('/getNumSimulatorQuestionsDificulty', { params: { simulator_id: this.$route.params.id } });
                this.questionsByDificulty = dificultyResponse.data.payload;
                console.log('dificulty', this.questionsByDificulty)

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        createDataForType() {
            let typesNames = [];
            let totalQuestions = [];
            this.questionsByType.forEach(type => {
                typesNames.push(type.type_display)
                totalQuestions.push(type.total_questions);
            });

            console.log('names', typesNames)
            console.log('total', totalQuestions)

            this.chartDataType = {
                
                labels: typesNames,
                datasets: [{
                    borderWidth: 1,
                    backgroundColor: [
                        'rgb(28, 164, 252)',
                        'rgb(28, 164, 252)',
                        'rgb(28, 164, 252)',
                        'rgb(28, 164, 252)',
                        'rgb(28, 164, 252)',
                        'rgb(28, 164, 252)'
                        // '#1CA4FC',
                        // '#F48FC2',
                        // '#2ACE06',
                        // '#FFC942',
                        // '#EE2F2F',
                        // '#FE9400'
                    ],
                    data: totalQuestions
                }]
            }
        },
        changeSubtopics(topic) {
            this.topicSelected = topic.topic_name == 'Gine&Obstetricia' ? 'Ginecología y obstetricia' : topic.topic_name;
            this.topicTotalQuestions = topic.total_questions;
            this.subtopics = topic.subtopics;
        },
        async changeStatusSimulator(simulator) {
            alert('change the status')
        },
        async sendQuestions() {
            try {
                alert('Enviar preguntas')
            } catch (err) {
                console.log(err);
            }
        }
    }
}
</script>

<style scoped>
    .sim-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
    }

    .header-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 20px 40px;
    }

    .header-container h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 32px;
        line-height: 39px;
        color: #000000;
        margin-bottom: 0;
    }

    .header-container p {
        margin-bottom: 0;
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
    }

    .questions-info {
        display: flex;
        flex-direction: row;
    }

    .questions-info span {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        color: #1CA4FC;
        margin: 0px 8px;
    }

    .header-container i {
        margin: 0px 8px;
    }

    .header-container button {
        padding: 12px 20px;
        background: #FE9400;
        color: #FFF;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 0px 20px;
    }

    .body-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    hr {
        border: 3px solid #000000;
        opacity: 1;
        margin: 0;
    }

    .content-container {
        display: flex;
        flex-direction: column;
        width: 45%;
        margin: 20px 40px;
    }

    .content-container h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        color: #000000;
        margin-bottom: 0;
    }

    .topics-container {
        display: flex;
        flex-direction: row;
    }

    .topics {
        display: flex;
        flex-direction: column;
        margin: 40px 0px;
        width: 50%;
        border-right: 2px solid #000000;
    }

    .topics button {
        text-align: right;
        border-bottom: 1px solid #C6E8FE;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        color: #212529;
        padding: 20px 40px 20px 20px;
        margin: 0px 20px;
    }

    .topics button:focus {
        background: #E9F6FF;
    }

    .topics span {
        font-weight: bold;
    }



    .subtopics {
        display: flex;
        flex-direction: column;
        margin: 40px 0px;
        width: 50%;
        border-left: 2px solid #000000;
    }

    .subtopics h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #FE9400;
        margin: 20px 20px;
    }

    .subtopics ul {
        margin: 0px 20px;
    }

    .subtopics li {
        margin: 12px 4px;
        font-style: normal;
        font-weight: normal;
        font-size: 15px;
        line-height: 21px;
        color: #212529;
    }

    .subtopics span {
        margin: 0px 4px;
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
        color: #1CA4FC;
    }



    .analitics-container {
        display: flex;
        flex-direction: column;
        width: 45%;
        margin: 20px 40px;
    }

    .analitics-container h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        color: #000000;
        margin-bottom: 0;
    }



    /* switch */
    .switch {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 22px;
    }

    .switch input { 
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #D4D5D7;
        -webkit-transition: .4s;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }

    input:checked + .slider {
        background-color: #20B000;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #20B000;
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }

    /* Rounded sliders */
    .slider.round {
        border-radius: 34px;
    }

    .slider.round:before {
        border-radius: 50%;
    }

</style>