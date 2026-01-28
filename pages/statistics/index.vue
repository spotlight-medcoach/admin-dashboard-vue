<template>
  <div class="statistics-container">
    <Loading v-if="loading" />

    <div v-else class="accordion" id="accordion">
      <!-- Estudiantes -->
      <StudentsStatsCard
        :student-stats="studentStats"
        :email-stats="emailStats"
        :render-count="renderCount"
      />

      <!-- Análisis del banco de casos -->
      <CasesAnalysisCard
        :chart-data-topic="chartDataTopic"
        :chart-data-dificulty="chartDataDificulty"
        :chart-data-type="chartDataType"
        :render-count="renderCount"
        @load-charts="createDataToCharts"
      />

      <!-- Total de casos -->
      <TotalCasesCard
        :total-cases="totalCases"
        :questions-by-topic="questionsByTopic"
        :subtopics="subtopics"
        :topic-selected="topicSelected"
        :selected-topic="topic"
        :chart-data-dificulty-topics="chartDataDificultyTopics"
        :chart-data-type-topics="chartDataTypeTopics"
        :render-count="renderCount"
        @topic-change="changeSubtopics"
        @subtopic-selected="subtopicSelected"
      />

      <!-- Análisis anual -->
      <AnnualAnalysisCard
        :bar-data="barData"
        :year-selected="yearSelected"
        :years="years"
        :render-count="renderCount"
        @load-bar-data="createBarData"
        @year-change="handleYearChange"
      />
    </div>
  </div>
</template>

<script>
import Loading from '@/components/modals/loading.modal.vue';
import StudentsStatsCard from '@/components/statistics/students-stats-card.vue';
import CasesAnalysisCard from '@/components/statistics/cases-analysis-card.vue';
import TotalCasesCard from '@/components/statistics/total-cases-card.vue';
import AnnualAnalysisCard from '@/components/statistics/annual-analysis-card.vue';

export default {
  components: {
    Loading,
    StudentsStatsCard,
    CasesAnalysisCard,
    TotalCasesCard,
    AnnualAnalysisCard,
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
      // Student statistics
      studentStats: {
        total: 0,
        completed: 0,
        pending: 0,
      },
      emailStats: {
        sent: 0,
        pending: 0,
        failed: 0,
      },
    };
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;
      this.loading = !this.loading;

      if (
        !localStorage.getItem('universities') ||
        !localStorage.getItem('types') ||
        !localStorage.getItem('topics')
      )
        await this.getToLocalStorage();

      this.topics = JSON.parse(localStorage.getItem('topics'));
      this.types = JSON.parse(localStorage.getItem('types'));

      await Promise.all([this.getStatistics(), this.getStudentStats()]);

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
    async getStudentStats() {
      try {
        const [statsResponse, emailResponse] = await Promise.all([
          this.$axios.get('/students/stats'),
          this.$axios.get('/students/email-queue-status'),
        ]);

        const stats = statsResponse.data.payload ||
          statsResponse.data.data ||
          statsResponse.data || {
            total: 0,
            completed: 0,
            pending: 0,
          };
        this.studentStats = stats;

        const emailStatus = emailResponse.data.payload ||
          emailResponse.data.data || {
            pending: 0,
            sent: 0,
            failed: 0,
          };
        this.emailStats = emailStatus;
        this.renderCount += 1;
      } catch (err) {
        console.error('Error fetching student stats:', err);
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
    subtopicSelected() {},
    handleYearChange(year) {
      this.yearSelected = parseInt(year);
      this.createBarData();
    },
    createBarData() {
      this.renderCount += 1;
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

.accordion >>> .accordion-item {
  align-items: center;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0px 0px 20px #d4d5d7;
  border-radius: 10px;
  margin: 20px 0px;
}

.accordion >>> .accordion-button {
  font-style: normal;
  font-weight: bold;
  font-size: 28px;
  line-height: 34px;
  color: #000000;
}

.accordion >>> .accordion-item i {
  margin-right: 24px;
  color: #fe9400;
}

.accordion >>> .accordion-button:not(.collapsed) i {
  color: #1ca4fc;
}

.accordion >>> .accordion-body {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
}
</style>
