<template>
  <div class="manuals-tab">
    <!-- Chart Section -->
    <div class="chart-section fade-in-up">
      <div class="section-header">
        <h5 class="section-title">Manuales por tema</h5>
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
        <DoughnutChart
          v-if="chartData && chartData.labels && chartData.labels.length > 0"
          :chart-data="chartData"
          :render="renderCount"
          pos="right"
        />
        <div v-else class="empty-chart">
          <i class="fas fa-chart-pie"></i>
          <p>Sin datos disponibles</p>
        </div>
      </div>
    </div>

    <!-- Manuals List -->
    <div class="list-section fade-in-up delay-1">
      <div class="section-header">
        <h5 class="section-title">Listado de manuales leidos</h5>
      </div>
      <div v-if="manualsList.length > 0" class="table-responsive">
        <table class="table manuals-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Manual</th>
              <th>Tema</th>
              <th>Subtema</th>
              <th>Fecha de lectura</th>
              <th>Tiempo (min)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(manual, index) in manualsList" :key="index">
              <td class="index-cell">{{ index + 1 }}</td>
              <td class="name-cell">{{ manual.name }}</td>
              <td>{{ manual.topic }}</td>
              <td>{{ manual.subtopic }}</td>
              <td>{{ formatDate(manual.date) }}</td>
              <td>
                <span class="time-badge">{{ manual.reading_time }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <i class="fas fa-book"></i>
        <p>No se han leido manuales</p>
      </div>
    </div>
  </div>
</template>

<script>
import DoughnutChart from '@/components/chart/chart.vue';

const CHART_COLORS = [
  '#FF9300',
  '#43B6F4',
  '#FF39AA',
  '#74ED5C',
  '#818FF9',
  '#FFD026',
  '#FF574F',
  '#4FCB43',
  '#5E6AD6',
  '#FFC942',
  '#DB7500',
  '#308FD1',
  '#B71C94',
  '#2ACE06',
  '#293190',
  '#7A3100',
];

export default {
  name: 'StudentManualsTab',
  components: { DoughnutChart },
  props: {
    manualsList: {
      type: Array,
      default: () => [],
    },
    byTopic: {
      type: Array,
      default: () => [],
    },
    totalRead: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      groupMode: 'topic',
      renderCount: 0,
    };
  },
  computed: {
    chartData() {
      if (this.groupMode === 'topic') {
        return this.buildTopicChart();
      }
      return this.buildSubtopicChart();
    },
  },
  watch: {
    groupMode() {
      this.renderCount++;
    },
  },
  methods: {
    buildTopicChart() {
      if (!this.byTopic || this.byTopic.length === 0) return {};
      const labels = this.byTopic.map(
        (t) => `${t.topic} (${t.count})`
      );
      const data = this.byTopic.map((t) => t.count);
      return {
        labels,
        datasets: [
          {
            backgroundColor: CHART_COLORS.slice(0, labels.length),
            data,
          },
        ],
      };
    },
    buildSubtopicChart() {
      if (!this.byTopic || this.byTopic.length === 0) return {};
      const labels = [];
      const data = [];
      this.byTopic.forEach((topic) => {
        if (topic.subtopics) {
          topic.subtopics.forEach((st) => {
            labels.push(`${topic.topic} - ${st.subtopic} (${st.count})`);
            data.push(st.count);
          });
        }
      });
      return {
        labels,
        datasets: [
          {
            backgroundColor: CHART_COLORS.slice(0, labels.length),
            data,
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
  },
};
</script>

<style lang="scss" scoped>
.manuals-tab {
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
  background: rgba(255, 147, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #ff9300;
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
  height: 420px;
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

.manuals-table {
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

.name-cell {
  font-weight: 500;
}

.time-badge {
  display: inline-block;
  background: rgba(255, 147, 0, 0.1);
  color: #ff9300;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
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
