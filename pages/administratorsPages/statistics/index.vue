<template>
  <div class="statistics-container">
    <Loading v-if="loading" />

    <div v-else class="accordion" id="accordion">
      <div class="accordion-item">
        <h2 class="accordion-header" id="chart-analysis">
          <button
            @click="createDataToCharts"
            class="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapse-chart-analysis"
            aria-expanded="true"
            aria-controls="collapse-chart-analysis"
          >
            <i class="fas fa-chart-bar"></i> Análisis del banco de casos
          </button>
        </h2>
        <div
          v-if="!loading"
          id="collapse-chart-analysis"
          class="accordion-collapse collapse show"
          aria-labelledby="chart-analysis"
          data-bs-parent="#accordion"
        >
          <div class="accordion-body">
            <div class="graphic">
              <span>Casos por tema</span>
              <!-- :width="420" -->
              <Chart
                :height="220"
                :render="renderCount"
                :chartData="chartDataTopic"
                :pos="'bottom'"
              />
            </div>

            <div class="graphic">
              <span>Preguntas por dificultad</span>
              <!-- :width="420" -->
              <Chart
                :height="200"
                :render="renderCount"
                :chartData="chartDataDificulty"
                :pos="'bottom'"
              />
            </div>

            <div class="graphic">
              <span>Preguntas por tipo</span>
              <!-- :width="420" -->
              <Chart
                :height="240"
                :render="renderCount"
                :chartData="chartDataType"
                :pos="'bottom'"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="cases-analysis">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapse-cases-analysis"
            aria-expanded="false"
            aria-controls="collapse-cases-analysis"
          >
            <i class="fas fa-list-alt"></i> Total de casos:
            <p>{{ totalCases }}</p>
          </button>
        </h2>

        <div
          id="collapse-cases-analysis"
          class="accordion-collapse collapse"
          aria-labelledby="cases-analysis"
          data-bs-parent="#accordion"
        >
          <div class="accordion-body">
            <div class="topics-container">
              <div class="topics">
                <button
                  class="btn"
                  v-for="topic in questionsByTopic"
                  :key="topic.topic_id"
                  @click="changeSubtopics(topic)"
                >
                  {{
                    topic.topic_name == 'Gine&Obstetricia'
                      ? 'Ginecología y obstetricia'
                      : topic.topic_name
                  }}
                  <br />
                  <span>{{ topic.total_questions }}/450</span>
                </button>
              </div>

              <div class="subtopics">
                <h3>{{ topicSelected }}</h3>

                <button
                  class="btn ml-4"
                  v-for="subtopic in subtopics"
                  :key="subtopic.subtopic_id"
                  @click="subtopicSelected(subtopic)"
                >
                  <i class="fas fa-circle"></i>
                  <span>{{ subtopic.subtopic_name }}</span>
                </button>
              </div>

              <div class="no-cases">
                <button class="btn no-cases-button">
                  No. casos <i class="fas fa-arrow-down"></i>
                </button>

                <button
                  class="btn buttons"
                  v-for="sub in topic.subtopics"
                  :key="sub.subtopic_bubble"
                >
                  {{ sub.cases.length }}
                </button>
              </div>

              <div class="porcent">
                <button class="btn porcent-button">
                  Porcentaje<i class="fas fa-arrow-down"></i>
                </button>

                <button
                  class="btn buttons"
                  v-for="sub in topic.subtopics"
                  :key="sub.subtopic_bubble"
                >
                  {{
                    Math.round((sub.cases.length * 100) / topic.cases.length)
                  }}%
                </button>
              </div>

              <div class="cases-graphics">
                <div>
                  <h3>Preguntas por tipo</h3>
                  <Chart
                    :height="180"
                    :width="420"
                    :render="renderCount"
                    :chartData="chartDataDificultyTopics"
                    :pos="'bottom'"
                  />
                </div>

                <div class="by-dificult">
                  <h3>Preguntas por dificultad</h3>
                  <Chart
                    :height="210"
                    :width="420"
                    :render="renderCount"
                    :chartData="chartDataTypeTopics"
                    :pos="'bottom'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="annual-analysis">
          <button
            @click="createBarData"
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapse-annual-analysis"
            aria-expanded="false"
            aria-controls="collapse-annual-analysis"
          >
            <i class="fas fa-calendar-alt"></i> Análisis anual
          </button>
        </h2>
        <div
          id="collapse-annual-analysis"
          class="accordion-collapse collapse"
          aria-labelledby="annual-analysis"
          data-bs-parent="#accordion"
        >
          <div class="accordion-body">
            <div class="bar-container">
              <div class="year-container">
                <div class="year">
                  <h3>Filtrar por año</h3>
                  <select
                    v-model="yearSelected"
                    class="options"
                    @change="createBarData"
                  >
                    <option v-for="year in years" :key="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
              </div>

              <ChartBar :chartData="barData" :render="renderCount" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from '../../../components/modals/Loading';
import Chart from '../../../components/chart/Chart';
import ChartBar from '../../../components/chart/ChartBar';

export default {
  components: {
    Loading,
    Chart,
    ChartBar,
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
      yearSelected: new Date().getFullYear(),
      years: Array.from(
        { length: (2019 - new Date().getFullYear()) / -1 + 1 },
        (_, i) => new Date().getFullYear() + i * -1
      ),
      types: [],
      topics: [],
      subtopics: [],
      topicSelected: '',
      topic: {},
    };
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;
      this.loading = !this.loading;

      let promises = [];

      if (
        !localStorage.getItem('universities') ||
        !localStorage.getItem('types') ||
        !localStorage.getItem('topics')
      )
        await this.getToLocalStorage();

      this.topics = JSON.parse(localStorage.getItem('topics'));
      this.types = JSON.parse(localStorage.getItem('types'));

      await this.getStatistics();

      this.loading = !this.loading;
    }
  },
  methods: {
    async getToLocalStorage() {
      try {
        let localResponse = await this.$axios.get('/localStorage');

        localStorage.setItem(
          'universities',
          JSON.stringify(localResponse.data.payload.universities)
        );
        this.$store.commit('setUniversities');

        localStorage.setItem(
          'topics',
          JSON.stringify(localResponse.data.payload.topics)
        );
        this.$store.commit('setTopics');

        localStorage.setItem(
          'types',
          JSON.stringify(localResponse.data.payload.types)
        );
        this.$store.commit('setTypes');
      } catch (err) {
        console.log(err);
      }
    },
    async getUniversities() {
      let universities = await this.$axios.get('/getUniversities');
      localStorage.setItem(
        'universities',
        JSON.stringify(universities.data.payload)
      );
      this.$store.commit('setUniversities');
    },
    async getTopics() {
      let topics = await this.$axios.get('/topics');
      localStorage.setItem('topics', JSON.stringify(topics.data.data));
      this.$store.commit('setTopics');
    },
    async getTypes() {
      let types = await this.$axios.get('/getTypes');
      localStorage.setItem('types', JSON.stringify(types.data.payload));
      this.$store.commit('setTypes');
    },
    async getStatistics() {
      try {
        let statisticsResponse = await this.$axios.get('/statistics');
        this.questionsByTopic = statisticsResponse.data.data.topics;
        this.questionsByDificulty = statisticsResponse.data.data.difficulties;
        this.questionsByType = statisticsResponse.data.data.types;
        this.totalCases = statisticsResponse.data.data.totalCases;
        this.casesByYear = 0;
        this.createDataToCharts();
      } catch (err) {
        console.log(err);
      }
    },
    loadTopicChart() {
      let topicsName = [];
      let totalTopics = [];
      this.questionsByTopic.forEach((ques) => {
        topicsName.push(ques.name + ' (' + ques.total_questions + ')');
        totalTopics.push(ques.total_questions);
      });

      this.chartDataTopic = {
        labels: topicsName,
        datasets: [
          {
            backgroundColor: [
              '#FE9400',
              '#1CA4FC',
              '#FFC942',
              '#F48FC2',
              '#2ACE06',
            ],
            data: totalTopics,
          },
        ],
      };
    },
    loadTypeChart() {
      let typesNames = [];
      let totalTypes = [];
      this.questionsByType.forEach((type) => {
        typesNames.push(type.display + ' (' + type.total_questions + ')');
        totalTypes.push(type.total_questions);
      });

      this.chartDataType = {
        labels: typesNames,
        datasets: [
          {
            backgroundColor: [
              '#1CA4FC',
              '#F48FC2',
              '#2ACE06',
              '#FFC942',
              '#EE2F2F',
              '#FE9400',
            ],
            data: totalTypes,
          },
        ],
      };
    },
    loadDificultyChart() {
      let dificultyName = [];
      let totalDificulty = [];
      this.questionsByDificulty.forEach((dificulty) => {
        dificultyName.push(
          dificulty.label + ' (' + dificulty.total_questions + ')'
        );
        totalDificulty.push(dificulty.total_questions);
      });

      this.chartDataDificulty = {
        labels: dificultyName,
        datasets: [
          {
            backgroundColor: ['#20B000', '#FABE23', '#DB1212'],
            data: totalDificulty,
          },
        ],
      };
    },
    createDataToCharts() {
      this.renderCount += 1;
      try {
        this.loadTopicChart();
      } catch (err) {
        console.log(err);
      }

      try {
        this.loadTypeChart();
      } catch (err) {
        console.log(err);
      }

      try {
        this.loadDificultyChart();
      } catch (err) {
        console.log(err);
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
        { value: 1, label: 'Baja' },
        { value: 2, label: 'Moderada' },
        { value: 3, label: 'Alta' },
      ];

      // Preguntas por tipo y datos para la grafica
      let totalQuestionsByType = [];
      this.types.forEach((type) => {
        let totalByType = 0;
        casesTopicSelected.forEach((eachCase) => {
          let questions = eachCase.questions;
          questions.forEach((question) => {
            if (type.bubble_id == question.type) totalByType += 1;
          });
        });

        totalQuestionsByType.push({
          bubble_id: type.bubble_id,
          display: type.display,
          total: totalByType,
        });
      });

      let typesNames = [];
      let totalTypes = [];
      totalQuestionsByType.forEach((type) => {
        typesNames.push(type.display + ' (' + type.total + ')');
        totalTypes.push(type.total);
      });

      this.chartDataTypeTopics = {
        labels: typesNames,
        datasets: [
          {
            backgroundColor: [
              '#FFC942',
              '#FE9400',
              '#61C0FD',
              '#EF5EA7',
              '#2ACE06',
              '#1CA4FC',
            ],
            data: totalTypes,
          },
        ],
      };

      // Preguntas por dificultad y datos para la grafica
      let totalQuestionsByDificulty = [];
      importances.forEach((imp) => {
        let totalByDificulty = 0;
        casesTopicSelected.forEach((eachCase) => {
          let questions = eachCase.questions;
          questions.forEach((question) => {
            if (imp.value == question.importance) totalByDificulty += 1;
          });
        });

        totalQuestionsByDificulty.push({
          label: imp.label,
          total: totalByDificulty,
        });
      });

      let dificultyNames = [];
      let dificultyTotal = [];
      totalQuestionsByDificulty.forEach((question) => {
        dificultyNames.push(question.label + ' (' + question.total + ')');
        dificultyTotal.push(question.total);
      });

      this.chartDataDificultyTopics = {
        labels: dificultyNames,
        datasets: [
          {
            backgroundColor: ['#20B000', '#FABE23', '#DB1212'],
            data: dificultyTotal,
          },
        ],
      };
    },
    subtopicSelected(subtopic) {},
    createBarData() {
      this.renderCount += 1;
      // console.log('byYear', this.casesByYear)
      let ordered = this.casesByYear.sort((a, b) => {
        return a._id.month - b._id.month;
      });

      let filterYear = ordered.filter(
        (obj) => obj._id.year == this.yearSelected
      );
      let months = [
        'ENE',
        'FEB',
        'MAR',
        'ABR',
        'MAY',
        'JUN',
        'JUL',
        'AGO',
        'SEP',
        'OCT',
        'NOV',
        'DIC',
      ];
      let newData = new Array(months.length).fill(0);
      filterYear.forEach((obj) => {
        newData[obj._id.month - 1] = obj.count;
      });

      this.barData = {
        labels: months,
        datasets: [
          {
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
          },
        ],
      };
    },
  },
  mounted() {
    this.$store.dispatch('pageHeader/setHeader', {
      hasHeader: false,
    });
  },
};
</script>

<style scoped>
.statistics-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
}

.accordion {
  font-family: Montserrat;
  margin: 0px;
  width: 100%;
}

.accordion-header p {
  font-style: normal;
  font-weight: bold;
  font-size: 28px;
  line-height: 34px;
  color: #1ca4fc;
  margin-bottom: 0px;
  margin-left: 12px;
}

.accordion-item {
  align-items: center;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0px 0px 20px #d4d5d7;
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
  color: #fe9400;
}

.accordion-button:not(.collapsed) i {
  color: #1ca4fc;
}

.accordion-body {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
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
  border-bottom: 1px solid #c6e8fe;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #212529;
  padding: 20px 40px 20px 20px;
  margin: 0px 20px;
}

.topics button:focus {
  background: #e9f6ff;
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
  color: #fe9400;
  margin: 15px 20px;
}

.subtopics span {
  margin: 0px 4px;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  color: #1ca4fc;
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
  background: #e9f6ff;
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
  border-right: 2px solid #ebebeb;
  border-left: 2px solid #ebebeb;
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
  color: #1ca4fc;
}

.no-cases i {
  color: #1ca4fc;
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
  border-right: 2px solid #ebebeb;
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
  color: #1ca4fc;
}

.porcent i {
  font-size: 16px;
  color: #1ca4fc;
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
  color: #1ca4fc;
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
