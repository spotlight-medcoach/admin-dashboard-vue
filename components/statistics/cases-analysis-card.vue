<template>
  <div class="accordion-item">
    <h2 class="accordion-header" id="chart-analysis">
      <button
        @click="$emit('load-charts')"
        class="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapse-chart-analysis"
        aria-expanded="false"
        aria-controls="collapse-chart-analysis"
      >
        <i class="fas fa-chart-bar"></i> Análisis del banco de casos
      </button>
    </h2>
    <div
      id="collapse-chart-analysis"
      class="accordion-collapse collapse"
      aria-labelledby="chart-analysis"
      data-bs-parent="#accordion"
    >
      <div class="accordion-body">
        <div class="graphic">
          <span>Casos por tema</span>
          <Chart
            :height="220"
            :render="renderCount"
            :chartData="chartDataTopic"
            :pos="'bottom'"
          />
        </div>

        <div class="graphic">
          <span>Preguntas por dificultad</span>
          <Chart
            :height="200"
            :render="renderCount"
            :chartData="chartDataDificulty"
            :pos="'bottom'"
          />
        </div>

        <div class="graphic">
          <span>Preguntas por tipo</span>
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
</template>

<script>
import Chart from '@/components/chart/chart.vue';

export default {
  name: 'CasesAnalysisCard',
  components: {
    Chart,
  },
  props: {
    chartDataTopic: {
      type: Object,
      default: () => ({}),
    },
    chartDataDificulty: {
      type: Object,
      default: () => ({}),
    },
    chartDataType: {
      type: Object,
      default: () => ({}),
    },
    renderCount: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style scoped>
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
</style>
