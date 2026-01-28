<template>
  <div class="accordion-item">
    <h2 class="accordion-header" id="annual-analysis">
      <button
        @click="$emit('load-bar-data')"
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
                :value="yearSelected"
                class="options"
                @change="$emit('year-change', $event.target.value)"
              >
                <option v-for="year in years" :key="year" :value="year">
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
</template>

<script>
import ChartBar from '@/components/chart/chart-bar.vue';

export default {
  name: 'AnnualAnalysisCard',
  components: {
    ChartBar,
  },
  props: {
    barData: {
      type: Object,
      default: () => ({}),
    },
    yearSelected: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    years: {
      type: Array,
      default: () => [],
    },
    renderCount: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style scoped>
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
