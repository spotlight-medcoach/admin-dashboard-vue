<template>
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
              @click="handleTopicChange(topic)"
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
              @click="$emit('subtopic-selected', subtopic)"
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
              v-for="sub in selectedTopic.subtopics"
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
              v-for="sub in selectedTopic.subtopics"
              :key="sub.subtopic_bubble"
            >
              {{
                selectedTopic.cases && selectedTopic.cases.length
                  ? Math.round((sub.cases.length * 100) / selectedTopic.cases.length)
                  : 0
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
</template>

<script>
import Chart from '@/components/chart/chart.vue';

export default {
  name: 'TotalCasesCard',
  components: {
    Chart,
  },
  props: {
    totalCases: {
      type: Number,
      default: 0,
    },
    questionsByTopic: {
      type: Array,
      default: () => [],
    },
    subtopics: {
      type: Array,
      default: () => [],
    },
    topicSelected: {
      type: String,
      default: '',
    },
    selectedTopic: {
      type: Object,
      default: () => ({}),
    },
    chartDataDificultyTopics: {
      type: Object,
      default: () => ({}),
    },
    chartDataTypeTopics: {
      type: Object,
      default: () => ({}),
    },
    renderCount: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    handleTopicChange(topic) {
      this.$emit('topic-change', topic);
    },
  },
};
</script>

<style scoped>
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
</style>
