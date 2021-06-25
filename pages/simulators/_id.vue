<template>
    <div>
        <Navigation />

        <Loading v-if="loading" />
        
        <div v-else class="sim-container">
            <!-- <h1>{{this.$route.params.id}}</h1> -->
            <nuxt-link to="/simulators" v-if="subtopicIdSelected == ''">
                <i class="fas fa-chevron-left"></i>
                Volver a simuladores
            </nuxt-link>

            <div v-if="subtopicIdSelected == ''" class="header-container">
                <h1>{{simulatorData.name}}</h1>

                <div class="questions-info">
                    <p>Casos totales:</p>
                    <span>{{simulatorData.questions.length}}</span>
                </div>

                <div>
                    <label :class="simulatorStatus ? 'inactive' : 'active'">{{simulatorStatus ? 'Desactivar' : 'Desactivado' }}</label>
                    <label class="switch">
                        <input type="checkbox" v-model="simulatorStatus" @change="changeStatusSimulator(simulatorData)">
                        <span class="slider round"></span>
                    </label>
                    <label :class="simulatorStatus ? 'active' : 'inactive'">{{simulatorStatus ? 'Activo' : 'Activar'}}</label>
                </div>

                <button class="btn" @click="addQuestionsConfirm"><i class="fas fa-upload"></i> Enviar preguntas al banco</button>
            </div>

            <div v-if="subtopicIdSelected == ''" class="body-container">
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

                            <button
                                class="btn"
                                v-for="subtopic in subtopics"
                                :key="subtopic.subtopic_id"
                                @click="subtopicSelected(subtopic)">

                                <i class="fas fa-circle"></i>
                                {{subtopic.subtopic_name}} <span>{{subtopic.total_questions}}/{{topicTotalQuestions}}</span>
                            </button>

                            <!-- <ul>
                                <li v-for="subtopic in subtopics" :key="subtopic.subtopic_id">
                                    {{subtopic.subtopic_name}}:<span>{{subtopic.total_questions}}/{{topicTotalQuestions}}</span>
                                </li>
                            </ul> -->
                        </div>
                    </div>
                </div>

                <div class="analitics-container">
                    <h3>Análisis del simulador</h3>
                    <hr>

                    <span>Preguntas por dificultad</span>
                    <Chart
                        height=180
                        :chartData="chartDataDificulty" />

                    <span>Preguntas por tipo</span>
                    <Chart 
                        height=180
                        :chartData="chartDataType" />
                </div>
            </div>

            <div v-if="subtopicIdSelected != ''" class="filter-container">
                <div class="back">
                    <button class="btn" @click="goBack"><i class="fas fa-chevron-left"></i>Volver a {{simulatorData.name}}</button>
                </div>

                <div class="head-container">
                    <h3>{{simulatorData.name}} <i class="fas fa-circle"></i> {{topicSelected}} <i class="fas fa-circle"></i><span class="sub">{{subtopicName}}</span></h3>
                    <p class="title">Preguntas totales: <span class="num">{{totalQuestionsBySubtopic}}/450</span></p>
                </div>

                <div class="subtopic-analitics">
                    <div class="cases-subtopic">
                        <h3>Casos de subtema</h3>
                        <hr>

                        <div class="table-container">
                            <table class="table table-bordered">
                                <thead class="thead-admin">
                                    <tr>
                                        <th scope="col" class="th-case">ID</th>
                                        <th scope="col">Caso</th>
                                        <th scope="col">Idioma</th>
                                        <!-- <th scope="col" class="th-description">Tipo</th>
                                        <th scope="col">Dificultad</th>
                                        <th scope="col">Subtema1</th> -->
                                        <th scope="col" class="act">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody class="tbody">
                                    <tr v-for="theCase in casesFiltered" :key="theCase._id">
                                        <td>{{ theCase.spotlight_id }}</td>
                                        <td>{{ theCase.name }}</td>
                                        <td>{{ theCase.language }}</td>
                                        <td class="act">
                                            <button class="btn edit" @click="viewCase(theCase)"><i class="fas fa-pencil-alt"></i></button>
                                            <button class="btn delete" @click="deleteCaseConfirm(theCase)"><i class="fas fa-trash"></i></button>
                                            <!-- <div v-if="theCase.status == 'Accepted by Spotlighter' || theCase.status == 'Pending' || theCase.status == 'In edit'" class="appro">
                                                <button class="btn accep" @click="acceptedCaseModal(theCase.status)"><i class="fas fa-exclamation-circle"></i> Info</button>
                                            </div>
                                            <div v-else class="op">
                                                <button class="btn op" @click="caseDetails(theCase._id)"><i class="fas fa-list-alt"></i> Ver caso</button>
                                            </div> -->
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="graphics">
                        <h3>Análisis subtema</h3>

                        <span>Preguntas por dificultad</span>
                        <Chart
                            height=180
                            :chartData="chartSubtopicDificulty" />

                        <span>Preguntas por tipo</span>
                        <Chart 
                            height=180
                            :chartData="chartSubtopicType" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Agregar preguntas al banco -->
        <AcceptModal 
            v-if="isShowAddQuestionsModal"
            @close="closeAddQuestionsModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="sendQuestions"
            :textButton="button"
            :isBusy="busyQuestions" />

        <!-- Eliminar caso del simulador -->
        <RejectModal 
            v-if="isShowDeleteCaseModal"
            @close="closeDeleteCaseModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="deleteCase"
            :textButton="button"
            :isBusy="busyDelete" />
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';
import Chart from '../../components/chart/Chart.vue';
import AcceptModal from '../../components/modals/AcceptModal';
import RejectModal from '../../components/modals/RejectModal';

export default {
    
    components: {
        Navigation,
        Loading,
        Chart,
        AcceptModal,
        RejectModal
    },
    data() {
        return {
            loading: false,
            isShowAddQuestionsModal: false,
            busyQuestions: false,
            isShowDeleteCaseModal: false,
            busyDelete: false,

            titleModal: '',
            bodyModal: '',
            button: '',

            simulatorData: {},
            topics: [],
            topicSelected: '',
            topicIdSelected: '',
            subtopicIdSelected: '',
            subtopicName: '',
            topicTotalQuestions: 0,
            subtopics: [],
            questionsByType: [],
            questionsByDificulty: [],
            casesFiltered: [],
            chartDataType: {},
            chartSubtopicType: {},
            simulatorStatus: false,

            questionsSubtopicType: [],
            questionsSubtopicDificulty: [],
            chartDataDificulty: {},
            chartSubtopicDificulty: {},
            totalQuestionsBySubtopic: 0,
            topicsInfo: [],
            topicBubble: '',
            subtopicBubble: '',
            caseToDelete: {}
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topicsInfo = JSON.parse(localStorage.getItem('topics'));
        }

        await this.getSimulator();
        // await this.getQuestionsByType();
        // await this.getQuestionsByDificulty();

        // this.createDataForType();
    },
    methods: {
        async getSimulator() {
            try {
                this.loading = !this.loading;
                
                let simulatorResponse = await this.$axios.get('/getNumSimulatorQuestionsTopic', { params: { simulator_id: this.$route.params.id } })
                
                this.simulatorData = simulatorResponse.data.payload.simulator;
                this.topics = simulatorResponse.data.payload.topics;
                this.questionsByType = simulatorResponse.data.payload.byType;
                this.questionsByDificulty = simulatorResponse.data.payload.byDificulty;
                this.simulatorStatus = this.simulatorData.enabled;

                this.createDataForType();
                this.createDataForDificulty();

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        createDataForType() {
            this.loading = !this.loading

            let typesNames = [];
            let totalQuestions = [];
            this.questionsByType.forEach(type => {
                typesNames.push(type.type_display)
                totalQuestions.push(type.total_questions);
            });

            this.chartDataType = {
                labels: typesNames,
                datasets: [{
                    // borderWidth: 1,
                    backgroundColor: [
                        '#1CA4FC',
                        '#F48FC2',
                        '#2ACE06',
                        '#FFC942',
                        '#EE2F2F',
                        '#FE9400'
                    ],
                    data: totalQuestions
                }]
            }

            this.loading = !this.loading
        },
        createDataForDificulty() {
            let dificultyName = [];
            let totalDificulty = [];
            this.questionsByDificulty.forEach(dificulty => {
                dificultyName.push(dificulty.dificulty);
                totalDificulty.push(dificulty.total_questions);
            });

            this.chartDataDificulty = {
                labels: dificultyName,
                datasets: [{
                    // borderWidth: 1,
                    backgroundColor: [
                        '#20B000',
                        '#FABE23',
                        '#DB1212',
                    ],
                    data: totalDificulty
                }]
            }
        },
        changeSubtopics(topic) {
            this.topicSelected = topic.topic_name == 'Gine&Obstetricia' ? 'Ginecología y obstetricia' : topic.topic_name;
            this.topicTotalQuestions = topic.total_questions;
            this.subtopics = topic.subtopics;
            this.topicIdSelected = topic.topic_id;
        },
        async subtopicSelected(subtopic) {
            try {
                this.loading = !this.loading;

                this.subtopicIdSelected = subtopic.subtopic_id;
                this.subtopicName = subtopic.subtopic_name;
                // console.log('cases!', this.topics)

                let topic = this.topicsInfo.filter(top => top._id == this.topicIdSelected)
                let topic_bubble = topic[0].bubble_id
                // console.log('subtopics', topic.subtopics)

                let sub = topic[0].subtopics.filter(s => s._id == subtopic.subtopic_id);
                let subtopic_bubble = sub[0].subtopic;
                this.topicBubble = topic_bubble;
                this.subtopicBubble = subtopic_bubble;
                console.log('bubbleT', topic_bubble)
                console.log('bubbleS', subtopic_bubble)


                let casesResponse = await this.$axios.get('/getCasesFromSimulator', { 
                        params: {
                            topic: topic_bubble,
                            subtopic: subtopic_bubble,
                            simulator_id: this.$route.params.id
                        }
                    });
                
                console.log('response: ', casesResponse);
                this.casesFiltered = casesResponse.data.payload.cases;
                this.questionsSubtopicType = casesResponse.data.payload.byType;
                this.questionsSubtopicDificulty = casesResponse.data.payload.byDificulty;
                // console.log('cases', this.casesFiltered)
                this.createDataSubtopicType();
                this.createDataSubtopicDificulty();
                this.setTotalQuestionsBySubtopic();

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        createDataSubtopicType() {
            this.loading = !this.loading

            let typesNames = [];
            let totalQuestions = [];
            this.questionsSubtopicType.forEach(type => {
                typesNames.push(type.type_display)
                totalQuestions.push(type.total_questions);
            });

            this.chartSubtopicType = {
                labels: typesNames,
                datasets: [{
                    // borderWidth: 1,
                    backgroundColor: [
                        '#1CA4FC',
                        '#F48FC2',
                        '#2ACE06',
                        '#FFC942',
                        '#EE2F2F',
                        '#FE9400'
                    ],
                    data: totalQuestions
                }]
            }

            this.loading = !this.loading
        },
        createDataSubtopicDificulty() {
            let dificultyName = [];
            let totalDificulty = [];
            this.questionsSubtopicDificulty.forEach(dificulty => {
                dificultyName.push(dificulty.dificulty);
                totalDificulty.push(dificulty.total_questions);
            });

            this.chartSubtopicDificulty = {
                labels: dificultyName,
                datasets: [{
                    // borderWidth: 1,
                    backgroundColor: [
                        '#20B000',
                        '#FABE23',
                        '#DB1212',
                    ],
                    data: totalDificulty
                }]
            }
        },
        setTotalQuestionsBySubtopic() {
            this.totalQuestionsBySubtopic = 0;
            this.casesFiltered.forEach(theCase => {
                this.totalQuestionsBySubtopic += theCase.individual_questions.length;
            });
        },
        goBack() {
            this.subtopicIdSelected = '';
            this.subtopicName = '';
        },
        async changeStatusSimulator(simulator) {
            try {
                if (this.simulatorStatus) {
                    let activeResponse = await this.$axios.put('/setSimulatorActive', { simulator_id: this.$route.params.id })
                    simulator.enabled = this.simulatorStatus;

                    setTimeout(() => {
                        alert(activeResponse.data.message)
                    }, 2000)
                } else {
                    let inactiveResponse = await this.$axios.put('/setSimulatorInactive', { simulator_id: this.$route.params.id })
                    simulator.enabled = this.simulatorStatus;

                    setTimeout(() => {
                        alert(inactiveResponse.data.message)
                    }, 2000)
                }
            } catch (err) {
                console.log(err);
            }
        },
        addQuestionsConfirm() {
            this.titleModal = 'Enviar preguntas al banco';
            this.bodyModal = 'Al enviar las preguntas al banco, este simulador se vaciará y quedará sin información. Al quedar limpio, deberán agregarse los casos nuevamente. Esta acción no puede deshacerse.';
            this.button = 'Enviar al banco';

            this.isShowAddQuestionsModal = !this.isShowAddQuestionsModal;
        },
        async sendQuestions() {
            try {
                this.busyQuestions = !this.busyQuestions;
                let sendQuestionsResponse = await this.$axios.delete('/deleteAllCasesFromSimulator', {
                    simulator_id: this.$route.params.id,
                    topic: this.topicBubble,
                    subtopic: this.subtopicBubble
                })
                
                console.log(sendQuestionsResponse);
                alert(sendQuestionsResponse.data.message);

                // setTimeout(() => {
                    this.busyQuestions = !this.busyQuestions;
                    this.isShowAddQuestionsModal = !this.isShowAddQuestionsModal;
                // })
            } catch (err) {
                console.log(err);
            }
        },
        viewCase(theCase) {
            alert('detalles del caso')
        },
        deleteCaseConfirm(theCase) {
            this.titleModal = 'Eliminar caso';
            this.bodyModal = '¿Deaseas eliminar este caso? Esta acción no puede deshacerse.';
            this.button = 'Eliminar caso';

            this.isShowDeleteCaseModal = !this.isShowDeleteCaseModal;
            
            this.caseToDelete = theCase;
            console.log('case!!!!', theCase)
        },
        async deleteCase() {
            try {
                this.busyDelete = !this.busyDelete;

                let caseDeletedResponse = await this.$axios.delete('/deleteCaseFromSimulator', {
                    simulator_id: this.$route.params.id,
                    case_id: this.caseToDelete._id
                })
                console.log(caseDeletedResponse);
                alert(caseDeletedResponse.data.message);

                this.busyDelete = !this.busyDelete;
                this.isShowDeleteCaseModal = !this.isShowDeleteCaseModal;
            } catch (err) {
                console.log(err);
            }
        },
        closeAddQuestionsModal() {
            this.isShowAddQuestionsModal = false;
        },
        closeDeleteCaseModal() {
            this.isShowDeleteCaseModal = false;
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

    .sim-container a {
        color: #000;
        text-decoration: none;
        margin: 10px 40px;
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

    .inactive {
        font-style: normal;
        font-weight: bold;
        font-size: 18px;
        line-height: 22px;
        color: #9E9E9E;
    }

    .active {
        font-style: normal;
        font-weight: bold;
        font-size: 18px;
        line-height: 22px;
        color: #000000;
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

    .subtopics button {
        width: 85%;
        text-align: left;
        font-style: normal;
        font-weight: normal;
        font-size: 15px;
        line-height: 21px;
        color: #212529;
    }

    .subtopics button:focus {
        background: #E9F6FF;
    }

    .subtopics i {
        font-size: 8px;
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

    .analitics-container span {
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        line-height: 23px;
        color: #000000;
        margin-top: 40px;
        margin-bottom: 10px;
    }

    /* .chart-container {
        width: 100%;
        height: 50%;
    } */

    canvas {
        /* width: 173px !important; */
        height: 800px !important;
    }









    .filter-container {
        display: flex;
        flex-direction: column;
        margin: 10px 40px;
    }

    .back {
        width: 50%;
    }

    .head-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 15px 0px;
    }

    .head-container h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        color: #000000;
        margin-bottom: 0;
        align-items: center;
    }

    .head-container p {
        margin-bottom: 0;
    }

    .head-container i {
        font-size: 8px;
        color: #1CA4FC;
    }

    .sub {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        color: #FE9400;
        margin: 0px 5px;
    }

    .title {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        color: #212529;
    }

    .num {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        color: #1CA4FC;
        margin: 0px 8px;
    }

    .subtopic-analitics {
        display: flex;
        flex-direction: row;
        margin: 15px 0px;
    }

    .subtopic-analitics h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        color: #000000;
        margin-bottom: 0;
    }

    .cases-subtopic {
        display: flex;
        flex-direction: column;
        width: 70%;
        margin: 0px 40px;
    }

    .table-container {
        margin: 20px 0px;
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

    .tbody {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 18px;
        color: #212529;
    }

    td {
        vertical-align: middle;
        /* max-width: fit-content !important; */
    }

    .edit {
        color: #1CA4FC;
    }

    .delete {
        color: #DB1212;
    }


    .graphics {
        display: flex;
        flex-direction: column;
        width: 45%;
        margin: 0px 40px;
    }

    .graphics span {
        margin-top: 40px;
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
        background-color: #DB1212;
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