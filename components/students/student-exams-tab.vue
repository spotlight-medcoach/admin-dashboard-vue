<template>
  <div class="exams-tab">
    <!-- Summary Cards -->
    <div class="summary-row fade-in-up">
      <div class="summary-card">
        <div class="summary-icon icon-primary">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="summary-info">
          <span class="summary-number">{{ totalExams }}</span>
          <span class="summary-label">Examenes realizados</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon icon-accent">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="summary-info">
          <span class="summary-number">{{ averageScore }}%</span>
          <span class="summary-label">Promedio</span>
        </div>
      </div>
    </div>

    <!-- Chart Section: Questions by Topic -->
    <div class="chart-section fade-in-up delay-1">
      <div class="section-header">
        <h5 class="section-title">Preguntas respondidas vs disponibles</h5>
        <div class="toggle-group">
          <button
            :class="['toggle-btn', { active: groupMode === 'topic' }]"
            @click="groupMode = 'topic'"
          >
            Solo tema
          </button>
          <button
            :class="['toggle-btn', { active: groupMode === 'subtopic' }]"
            @click="groupMode = 'subtopic'"
          >
            Tema y subtema
          </button>
        </div>
      </div>
      <div class="chart-container">
        <BarChart
          v-if="barChartData && barChartData.labels && barChartData.labels.length > 0"
          :chart-data="barChartData"
          :render="renderCount"
        />
        <div v-else class="empty-chart">
          <i class="fas fa-chart-bar"></i>
          <p>Sin datos disponibles</p>
        </div>
      </div>
    </div>

    <!-- Exams List -->
    <div class="list-section fade-in-up delay-2">
      <div class="section-header">
        <h5 class="section-title">Listado de examenes personalizados</h5>
      </div>
      <div v-if="examsList.length > 0" class="table-responsive">
        <table class="table exams-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Preguntas</th>
              <th>Correctas</th>
              <th>Calificacion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(exam, index) in examsList" :key="exam._id">
              <td class="index-cell">{{ index + 1 }}</td>
              <td>{{ formatDate(exam.created_at) }}</td>
              <td>{{ exam.total_questions }}</td>
              <td>{{ exam.total_correct }}</td>
              <td>
                <span
                  :class="[
                    'score-badge',
                    getScoreClass(exam.score),
                  ]"
                >
                  {{ exam.score >= 0 ? exam.score + '%' : 'Sin terminar' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>No se han realizado examenes personalizados</p>
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from '@/components/chart/bar-chart.vue';

export default {
  name: 'StudentExamsTab',
  components: { BarChart },
  props: {
    examsList: {
      type: Array,
      default: () => [],
    },
    totalExams: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    questionsByTopic: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      groupMode: 'topic',
      renderCount: 0,
    };
  },
  computed: {
    barChartData() {
      if (this.groupMode === 'topic') {
        return this.buildTopicBarChart();
      }
      return this.buildSubtopicBarChart();
    },
  },
  watch: {
    groupMode() {
      this.renderCount++;
    },
  },
  methods: {
    buildTopicBarChart() {
      if (!this.questionsByTopic || this.questionsByTopic.length === 0) {
        return {};
      }
      const labels = this.questionsByTopic.map((t) => t.topic);
      const answered = this.questionsByTopic.map((t) => t.answered);
      const total = this.questionsByTopic.map((t) => t.total_available);

      return {
        labels,
        datasets: [
          {
            label: 'Respondidas',
            backgroundColor: '#FF9300',
            data: answered,
            borderRadius: 4,
          },
          {
            label: 'Total disponibles',
            backgroundColor: '#E8E8E1',
            data: total,
            borderRadius: 4,
          },
        ],
      };
    },
    buildSubtopicBarChart() {
      if (!this.questionsByTopic || this.questionsByTopic.length === 0) {
        return {};
      }
      const labels = [];
      const answered = [];
      const total = [];

      this.questionsByTopic.forEach((topic) => {
        if (topic.subtopics) {
          topic.subtopics.forEach((st) => {
            labels.push(st.subtopic);
            answered.push(st.answered);
            total.push(st.total_available);
          });
        }
      });

      return {
        labels,
        datasets: [
          {
            label: 'Respondidas',
            backgroundColor: '#FF9300',
            data: answered,
            borderRadius: 4,
          },
          {
            label: 'Total disponibles',
            backgroundColor: '#E8E8E1',
            data: total,
            borderRadius: 4,
          },
        ],
      };
    },
    formatDate(date) {
      if (!date) return '-';
      const d = new Date(date);
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
    getScoreClass(score) {
      if (score < 0) return 'score-pending';
      if (score >= 80) return 'score-high';
      if (score >= 60) return 'score-mid';
      return 'score-low';
    },
  },
};
</script>

<style lang="scss" scoped>
.exams-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-row {
  display: flex;
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 28px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  flex: 0 0 auto;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &.icon-primary {
    background: rgba(255, 147, 0, 0.1);
    color: #ff9300;
  }

  &.icon-accent {
    background: rgba(67, 182, 244, 0.1);
    color: #43b6f4;
  }
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-number {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1b;
  line-height: 1;
}

.summary-label {
  font-size: 13px;
  color: #979797;
  margin-top: 4px;
}

.chart-section,
.list-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1b;
  margin: 0;
}

.toggle-group {
  display: flex;
  background: #f3f3f0;
  border-radius: 8px;
  padding: 3px;
}

.toggle-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #5b5b5b;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background: #fff;
    color: #ff9300;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  &:hover:not(.active) {
    color: #1d1d1b;
  }
}

.chart-container {
  height: 350px;
  position: relative;
}

.empty-chart,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #bbbbb3;

  i {
    font-size: 40px;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}

.exams-table {
  width: 100%;
  font-size: 14px;

  thead th {
    background: #f8f8f8;
    border-bottom: 2px solid #e8e8e1;
    font-weight: 600;
    color: #5b5b5b;
    padding: 12px 16px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  tbody td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f3f0;
    color: #1d1d1b;
    vertical-align: middle;
  }

  tbody tr:hover {
    background: #fafafa;
  }
}

.index-cell {
  color: #979797;
  width: 40px;
}

.score-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;

  &.score-high {
    background: rgba(116, 237, 92, 0.15);
    color: #2faa2e;
  }

  &.score-mid {
    background: rgba(255, 208, 38, 0.15);
    color: #b78c13;
  }

  &.score-low {
    background: rgba(255, 87, 79, 0.15);
    color: #db393f;
  }

  &.score-pending {
    background: rgba(151, 151, 151, 0.15);
    color: #858383;
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

.delay-1 {
  animation-delay: 0.1s;
}

.delay-2 {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
