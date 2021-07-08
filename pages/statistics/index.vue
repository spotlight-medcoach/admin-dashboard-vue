<template>
    <div>
        <Navigation />
        <div class="statistics-container">
            <Loading v-if="loading" />

            <div v-else class="accordion" id="accordionExample">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne">
                        <button @click="createDataToCharts" class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            <i class="fas fa-chart-bar"></i> Análisis del banco de casos
                        </button>
                    </h2>
                    <div v-if="!loading" id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                            <div class="graphic">
                                <span>Casos por tema</span>
                                <Chart
                                    :height="180"
                                    :width="420"
                                    :render="renderCount"
                                    :chartData="chartDataTopic"
                                    :pos="'bottom'" />
                            </div>
                                
                            <div class="graphic">
                                <span>Casos por dificultad</span>
                                <Chart
                                    :height="180"
                                    :width="420"
                                    :render="renderCount"
                                    :chartData="chartDataDificulty"
                                    :pos="'bottom'" />
                            </div>

                            <div class="graphic">
                                <span>Casos por tipo</span>
                                <Chart
                                    :height="180"
                                    :width="420"
                                    :render="renderCount"
                                    :chartData="chartDataType"
                                    :pos="'bottom'" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingTwo">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            <i class="fas fa-list-alt"></i> Total de casos: <p>{{totalCases}}</p>
                        </button>
                    </h2>
                    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                            <div class="topics-container">
                                <div class="topics">
                                    <button
                                        class="btn"
                                        v-for="topic in questionsByTopic"
                                        :key="topic.topic_id" 
                                        @click="changeSubtopics(topic)" >
                                        {{topic.topic_name == "Gine&Obstetricia" ? 'Ginecología y obstetricia' : topic.topic_name}}
                                        <br>
                                        <span>{{topic.total_questions}}/450</span>
                                    </button>
                                </div>

                                <div class="subtopics">
                                    <h3>{{topicSelected}}</h3>

                                    <button
                                        class="btn ml-4"
                                        v-for="subtopic in subtopics"
                                        :key="subtopic.subtopic_id"
                                        @click="subtopicSelected(subtopic)" >

                                        <i class="fas fa-circle"></i>
                                        <span>{{subtopic.subtopic_name}}</span>
                                    </button>
                                </div>

                                <div class="no-cases">
                                    <button class="btn no-cases-button">No. casos <i class="fas fa-arrow-down"></i></button>

                                    <button class="btn buttons" v-for="sub in topic.subtopics" :key="sub.subtopic_bubble">{{sub.cases.length}}</button>
                                </div>

                                <div class="porcent">
                                    <button class="btn porcent-button">Porcentaje<i class="fas fa-arrow-down"></i></button>

                                    <button class="btn buttons" v-for="sub in topic.subtopics" :key="sub.subtopic_bubble">{{Math.round(sub.cases.length * 100 / topic.cases.length)}}%</button>
                                </div>

                                <div class="cases-graphics">
                                    <div>
                                        <h3>Preguntas por tipo</h3>
                                        <Chart
                                            :height="180"
                                            :width="420"
                                            :render="renderCount"
                                            :chartData="chartDataDificultyTopics"
                                            :pos="'bottom'" />
                                    </div>

                                    <div class="by-dificult">
                                        <h3>Preguntas por dificultad</h3>
                                        <Chart
                                            :height="180"
                                            :width="420"
                                            :render="renderCount"
                                            :chartData="chartDataTypeTopics"
                                            :pos="'bottom'" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingThree">
                        <button @click="createBarData" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                            <i class="fas fa-calendar-alt"></i> Análisis anual
                        </button>
                    </h2>
                    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                            <div class="bar-container">
                                <div class="year-container">
                                    <div class="year">
                                        <h3>Filtrar por año</h3>
                                        <select v-model="yearSelected" class="options" @change="createBarData">
                                            <option value=2019 selected>2019</option>
                                            <option value=2020>2020</option>
                                            <option value=2021>2021</option>
                                        </select>
                                    </div>
                                </div>

                                <ChartBar
                                    :chartData="barData"
                                    :render="renderCount" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';
import Chart from '../../components/chart/Chart';
import ChartBar from '../../components/chart/ChartBar';

export default {
    components: {
        Navigation,
        Loading,
        Chart,
        ChartBar
    },
    data() {
        return {
            loading: false,
            renderCount: 0,

            questionsByTopic: [],
            questionsByDificulty: [],
            questionsByType: [],
            casesByYear: [],
            chartDataTopic: {},
            chartDataDificulty: {},
            chartDataType: {},
            chartDataTypeTopics: {},
            chartDataDificultyTopics: {},
            barData: {},
            totalCases: 0,
            topicTotalQuestions: 0,
            yearSelected: 2019,

            types: [],
            topics: [],
            subtopics: [],
            topicSelected: '',
            topic: {}
        }
    },
    async created() {
        if (process.browser){
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            
            if (!localStorage.getItem('universities'))
                await this.getUniversities()
            if (!localStorage.getItem('topics'))
                await this.getTopics()
            if (!localStorage.getItem('types'))
                await this.getTypes()
            
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.types = JSON.parse(localStorage.getItem('types'));
            await this.getStatistics();
        }
    },
    methods: {
        async getUniversities() {
            this.loading = !this.loading;

            let universities = await this.$axios.get('/getUniversities')
            localStorage.setItem('universities', JSON.stringify(universities.data.payload))
            this.$store.commit('setUniversities')

            this.loading = !this.loading;
        },
        async getTopics() {
            this.loading = !this.loading;

            let topics = await this.$axios.get('/getTopicsWithSubtopics')
            localStorage.setItem('topics', JSON.stringify(topics.data.payload))
            this.$store.commit('setTopics')

            this.loading = !this.loading;
        },
        async getTypes() {
            this.loading = !this.loading;

            let types = await this.$axios.get('/getTypes');
            localStorage.setItem('types', JSON.stringify(types.data.payload));
            this.$store.commit('setTypes');

            this.loading = !this.loading;
        },
        async getStatistics() {
            try {
                this.loading = !this.loading;

                let statisticsResponse = await this.$axios.get('/getStatistics');
                this.questionsByTopic = statisticsResponse.data.payload.byTopic;
                this.questionsByDificulty = statisticsResponse.data.payload.byDificulty;
                this.questionsByType = statisticsResponse.data.payload.byType;
                this.totalCases = statisticsResponse.data.payload.totalCases;
                this.casesByYear = statisticsResponse.data.payload.byYear;
                // console.log('payload', statisticsResponse.data.payload);
                this.createDataToCharts();

                this.questionsByTopic.forEach(topic => {
                    topic.cases.forEach(eachCase => {
                        eachCase.topic_name = this.topics.filter(top => top.bubble_id == eachCase.topic)[0].name
                        // eachCase.subtopic_name = 
                    })
                })

                // console.log('types: ', this.types);
                
                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        createDataToCharts() {
            this.renderCount += 1;
            let topicsName = [];
            let totalTopics = [];
            this.questionsByTopic.forEach(ques => {
                topicsName.push(ques.topic_name);
                totalTopics.push(ques.total_questions);
            })

            this.chartDataTopic = {
                labels: topicsName,
                datasets: [{
                    backgroundColor: [
                        '#FE9400',
                        '#1CA4FC',
                        '#FFC942',
                        '#F48FC2',
                        '#2ACE06'
                    ],
                    data: totalTopics
                }]
            }
            
            let typesNames = [];
            let totalTypes = [];
            this.questionsByType.forEach(type => {
                typesNames.push(this.types.filter(typ => typ.bubble_id == type.type)[0].display)
                totalTypes.push(type.total_questions);
            });

            this.chartDataType = {
                labels: typesNames,
                datasets: [{
                    backgroundColor: [
                        '#1CA4FC',
                        '#F48FC2',
                        '#2ACE06',
                        '#FFC942',
                        '#EE2F2F',
                        '#FE9400'
                    ],
                    data: totalTypes
                }]
            }

            let dificultyName = [];
            let totalDificulty = [];
            this.questionsByDificulty.forEach(dificulty => {
                dificultyName.push(dificulty.dificulty);
                totalDificulty.push(dificulty.total_questions);
            });

            this.chartDataDificulty = {
                labels: dificultyName,
                datasets: [{
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
            this.renderCount += 1;
            // Cambiar datos del tema y subtema al seleccionarlo, tambien cambiar los datos de las graficas (tipo y dificultad)
            this.subtopics = topic.subtopics;
            this.topicTotalQuestions = topic.total_questions;
            this.topicSelected = topic.topic_name;
            this.topic = topic;

            let casesTopicSelected = topic.cases;
            let importances = [
                { value: 1, label: "Baja" },
                { value: 2, label: "Moderada" },
                { value: 3, label: "Alta" }
            ]
            
            // Preguntas por tipo y datos para la grafica
            let totalQuestionsByType = [];
            this.types.forEach(type => {
                let totalByType = 0;
                casesTopicSelected.forEach(eachCase => {
                    let questions = eachCase.questions;
                    questions.forEach(question => {
                        if (type.bubble_id == question.type)
                            totalByType += 1;
                    });
                });

                totalQuestionsByType.push({
                    bubble_id: type.bubble_id,
                    display: type.display,
                    total: totalByType
                });
            });

            let typesNames = [];
            let totalTypes = [];
            totalQuestionsByType.forEach(type => {
                typesNames.push(type.display);
                totalTypes.push(type.total);
            });

            this.chartDataTypeTopics = {
                labels: typesNames,
                datasets: [{
                    backgroundColor: [
                        '#FFC942',
                        '#FE9400',
                        '#61C0FD',
                        '#EF5EA7',
                        '#2ACE06',
                        '#1CA4FC'
                    ],
                    data: totalTypes
                }]
            }

            // Preguntas por dificultad y datos para la grafica
            let totalQuestionsByDificulty = [];
            importances.forEach(imp => {
                let totalByDificulty = 0;
                casesTopicSelected.forEach(eachCase => {
                    let questions = eachCase.questions;
                    questions.forEach(question => {
                        if (imp.value == question.importance)
                            totalByDificulty += 1;
                    });
                });

                totalQuestionsByDificulty.push({
                    label: imp.label,
                    total: totalByDificulty
                });
            });

            let dificultyNames = [];
            let dificultyTotal = [];
            totalQuestionsByDificulty.forEach(question => {
                dificultyNames.push(question.label);
                dificultyTotal.push(question.total);
            });

            this.chartDataDificultyTopics = {
                labels: dificultyNames,
                datasets: [{
                    backgroundColor: [
                        '#20B000',
                        '#FABE23',
                        '#DB1212'
                    ],
                    data: dificultyTotal
                }]
            }

            // console.log('questionsByType', totalQuestionsByType);
            // console.log('questionsByDificulty', totalQuestionsByDificulty);
        },
        subtopicSelected(subtopic) {
            console.log('subtopic', subtopic);
        },
        createBarData() {
            this.renderCount += 1;
            // console.log('byYear', this.casesByYear)
            let ordered = this.casesByYear.sort((a, b) => {
                return a._id.month -b._id.month
            });

            let filterYear = ordered.filter(obj => obj._id.year == this.yearSelected)
            let months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'] 
            let newData = new Array(months.length).fill(0);
            filterYear.forEach(obj => {
                newData[obj._id.month - 1] = obj.count
            });

            console.log('newData', newData)

            this.barData = {
                labels: months,
                datasets: [{
                    data: newData,
                    backgroundColor: [
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                        '#8DD1FD',
                    ],
                    borderRadius: 50,
                }]
            }
        }
    }
}
</script>

<style scoped>
    .statistics-container {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        margin: auto;
    }

    .accordion {
        font-family: Montserrat;
        margin: 0px 20px;
        width: 100%;
    }

    .accordion-header p {
        font-style: normal;
        font-weight: bold;
        font-size: 28px;
        line-height: 34px;
        color: #1CA4FC;
        margin-bottom: 0px;
        margin-left: 12px;
    }

    .accordion-item {
        align-items: center;
        padding: 10px;
        background: #FFFFFF;
        box-shadow: 0px 0px 20px #D4D5D7;
        border-radius: 10px;
        margin: 20px 0px;
    }

    .accordion-button {
        font-style: normal;
        font-weight: bold;
        font-size: 28px;
        line-height: 34px;
        color: #000000;
    }

    .accordion-item i {
        margin-right: 24px;
        color: #FE9400;
    }

    .accordion-button:not(.collapsed) i {
        color: #1CA4FC;
    }

    .accordion-body {
        display: flex;
        flex-direction: row;
    }

    .graphic {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .graphic span {
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        line-height: 23px;
        color: #000000;
        margin-bottom: 4px;
    }

    .topics-container {
        display: flex;
        flex-direction: row;
    }

    .topics {
        display: flex;
        flex-direction: column;
        margin: 40px 0px;
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
        border-left: 2px solid #000000;
    }

    .subtopics h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #FE9400;
        margin: 15px 20px;
    }

    .subtopics span {
        margin: 0px 4px;
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
        color: #1CA4FC;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .subtopics button {
        display: flex;
        flex-direction: row;
        align-items: center;
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
        margin-right: 4px;
    }

    .no-cases {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0px 20px;
        margin: 40px 0px;
        border-right: 2px solid #EBEBEB;
        border-left: 2px solid #EBEBEB;
    }

    .no-cases-button {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0px;
        margin: 15px 0px;
        font-style: normal;
        font-weight: bold;
        line-height: 20px;
        font-size: 16px;
        color: #1CA4FC;
    }

    .no-cases i {
        color: #1CA4FC;
        font-size: 16px;
        margin: 0px;
        margin-left: 12px;
    }

    .buttons {
        font-style: normal;
        font-weight: normal;
        font-size: 15px;
        line-height: 21px;
        color: #212529;
    }

    .buttons button:focus {
        outline: none;
        border: none;
    }

    .porcent {
        display: flex;
        flex-direction: column;
        margin: 40px 0px;
        padding: 0px 25px;
        border-right: 2px solid #EBEBEB;
    }

    .porcent-button {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 15px 0px;
        padding: 0px;
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #1CA4FC;
    }

    .porcent i {
        font-size: 16px;
        color: #1CA4FC;
        margin: 0px;
        margin-left: 12px;
    }

    .cases-graphics {
        display: flex;
        flex-direction: column;
        margin: 40px 40px;
    }

    .cases-graphics h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        line-height: 23px;
        color: #000000;
    }

    .by-dificult {
        margin-top: 40px;
    }

    .year-container {
        display: flex;
        justify-content: flex-end;
    }

    .year {
        width: 30%;
        margin-bottom: 15px;
    }

    .year h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #1CA4FC;
    }

    .options {
        font-family: Montserrat;
        width: 100%;
        height: 32px;
        border: none;
        border-bottom: 1px solid #000;
    }

    .bar-container {
        width: 100%;
    }



</style>