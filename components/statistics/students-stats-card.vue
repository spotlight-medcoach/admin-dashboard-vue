<template>
  <div class="accordion-item">
    <h2 class="accordion-header" id="students-analysis">
      <button
        class="accordion-button"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapse-students-analysis"
        aria-expanded="true"
        aria-controls="collapse-students-analysis"
      >
        <i class="fas fa-user-graduate"></i> Estudiantes
      </button>
    </h2>
    <div
      id="collapse-students-analysis"
      class="accordion-collapse collapse show"
      aria-labelledby="students-analysis"
      data-bs-parent="#accordion"
    >
      <div class="accordion-body students-charts">
        <div class="student-chart-card">
          <div class="graphic">
            <span>Distribución por Estado de Registro</span>
            <div class="chart-with-stats">
              <Chart
                v-if="
                  combinedStudentChartData.labels &&
                  combinedStudentChartData.labels.length > 0
                "
                :height="220"
                :chart-data="combinedStudentChartData"
                :pos="'bottom'"
                :render="renderCount"
              />
              <div v-else class="loading-placeholder">Cargando...</div>
            </div>
          </div>
          <div class="stat-values-container">
            <div class="stat-values">
              <div class="stat-item">
                <span class="number completed">{{
                  studentStats.completed || 0
                }}</span>
                <span class="label">Registro completo</span>
              </div>
              <div class="stat-item">
                <span class="number pending">{{
                  studentStats.pending || 0
                }}</span>
                <span class="label">Pendiente de registro</span>
              </div>
            </div>
            <div class="total-students">
              <span
                >Total de Estudiantes:
                <strong>{{ studentStats.total || 0 }}</strong></span
              >
            </div>
          </div>
        </div>

        <div class="student-chart-card">
          <div class="graphic">
            <span>Estado de Correos</span>
            <div class="chart-with-stats">
              <Chart
                v-if="emailChartData.labels && emailChartData.labels.length > 0"
                :height="220"
                :chart-data="emailChartData"
                :pos="'bottom'"
                :render="renderCount"
              />
              <div v-else class="loading-placeholder">Cargando...</div>
            </div>
          </div>
          <div class="stat-values">
            <div class="stat-item">
              <span class="number sent">{{ emailStats.sent || 0 }}</span>
              <span class="label">Enviados</span>
            </div>
            <div class="stat-item">
              <span class="number pending">{{ emailStats.pending || 0 }}</span>
              <span class="label">Pendientes</span>
            </div>
            <div class="stat-item">
              <span class="number failed">{{ emailStats.failed || 0 }}</span>
              <span class="label">Fallidos</span>
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
  name: 'StudentsStatsCard',
  components: {
    Chart,
  },
  props: {
    studentStats: {
      type: Object,
      default: () => ({
        total: 0,
        completed: 0,
        pending: 0,
      }),
    },
    emailStats: {
      type: Object,
      default: () => ({
        sent: 0,
        pending: 0,
        failed: 0,
      }),
    },
    renderCount: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    combinedStudentChartData() {
      const total = Number(this.studentStats.total) || 0;
      const completed = Number(this.studentStats.completed) || 0;
      const pending = Number(this.studentStats.pending) || 0;

      if (total === 0) {
        return {
          labels: ['Sin estudiantes'],
          datasets: [
            {
              backgroundColor: ['#CCCCCC'],
              data: [1],
            },
          ],
        };
      }

      const dataArray = [];
      const labelsArray = [];
      const colorsArray = [];

      if (completed > 0) {
        labelsArray.push(`Registro completo (${completed})`);
        dataArray.push(completed);
        colorsArray.push('#20B000');
      }

      if (pending > 0) {
        labelsArray.push(`Pendiente (${pending})`);
        dataArray.push(pending);
        colorsArray.push('#FABE23');
      }

      if (dataArray.length === 0) {
        return {
          labels: ['Sin datos'],
          datasets: [
            {
              backgroundColor: ['#CCCCCC'],
              data: [1],
            },
          ],
        };
      }

      return {
        labels: labelsArray,
        datasets: [
          {
            backgroundColor: colorsArray,
            data: dataArray,
          },
        ],
      };
    },
    emailChartData() {
      const sent = this.emailStats.sent || 0;
      const pending = this.emailStats.pending || 0;
      const failed = this.emailStats.failed || 0;
      const total = sent + pending + failed;

      if (total === 0) {
        return {
          labels: ['Sin correos'],
          datasets: [
            {
              backgroundColor: ['#CCCCCC'],
              data: [1],
            },
          ],
        };
      }

      const labels = [];
      const data = [];
      const colors = [];

      if (sent > 0) {
        labels.push(`Enviados (${sent})`);
        data.push(sent);
        colors.push('#20B000');
      }

      if (pending > 0) {
        labels.push(`Pendientes (${pending})`);
        data.push(pending);
        colors.push('#FABE23');
      }

      if (failed > 0) {
        labels.push(`Fallidos (${failed})`);
        data.push(failed);
        colors.push('#DB1212');
      }

      return {
        labels,
        datasets: [
          {
            backgroundColor: colors,
            data,
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.students-charts {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-around;
}

.student-chart-card {
  display: flex;
  flex-direction: row;
  border-radius: 10px;
  padding: 20px;
  min-width: 320px;
  @media (min-width: 1600px) {
    max-width: 500px;
  }

  flex: 1;
}

.student-chart-card .graphic {
  margin-bottom: 20px;
}

.student-chart-card .graphic span {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  display: block;
  text-align: center;
}

.stat-values-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.chart-with-stats {
  display: flex;
  justify-content: center;
}

.loading-placeholder {
  color: #999;
  font-size: 14px;
  padding: 40px;
  text-align: center;
}

.stat-values {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.stat-item {
  display: flex;
  justify-content: left;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 6px;
  min-width: 250px;
}

.stat-item .number {
  font-size: 20px;
  font-weight: 700;
  text-align: right;
  min-width: 50px;
}

.stat-item .number.completed {
  color: #20b000;
}

.stat-item .number.pending {
  color: #fabe23;
}

.stat-item .number.sent {
  color: #20b000;
}

.stat-item .number.failed {
  color: #db1212;
}

.stat-item .label {
  font-size: 14px;
  color: #666;
}

.total-students {
  margin-top: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #1ca4fc 0%, #0d7bc4 100%);
  border-radius: 6px;
  text-align: center;
}

.total-students span {
  color: white;
  font-size: 16px;
}

.total-students strong {
  font-size: 20px;
  font-weight: 700;
}
</style>
