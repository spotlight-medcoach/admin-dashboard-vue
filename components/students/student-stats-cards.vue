<template>
  <div class="student-stats-container">
    <div class="stats-cards">
      <!-- Card 1: Total de estudiantes -->
      <div class="stat-card">
        <div class="stat-card-header">
          <h5>Total de Estudiantes</h5>
        </div>
        <div class="stat-card-body">
          <div class="chart-wrapper">
            <Chart
              v-if="totalChartData.labels"
              :chart-data="totalChartData"
              :height="200"
            />
            <div v-else class="loading-placeholder">Cargando...</div>
          </div>
          <div class="stat-value">
            <span class="number">{{ stats.total || 0 }}</span>
            <span class="label">estudiantes</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Registro completo vs pendiente -->
      <div class="stat-card">
        <div class="stat-card-header">
          <h5>Estado de Registro</h5>
        </div>
        <div class="stat-card-body">
          <div class="chart-wrapper">
            <Chart
              v-if="registrationChartData.labels"
              :chart-data="registrationChartData"
              :height="200"
            />
            <div v-else class="loading-placeholder">Cargando...</div>
          </div>
          <div class="stat-values">
            <div class="stat-item">
              <span class="number completed">{{ stats.completed || 0 }}</span>
              <span class="label">Completos</span>
            </div>
            <div class="stat-item">
              <span class="number pending">{{ stats.pending || 0 }}</span>
              <span class="label">Pendientes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Distribución de correos enviados -->
      <div class="stat-card">
        <div class="stat-card-header">
          <h5>Correos Enviados</h5>
        </div>
        <div class="stat-card-body">
          <div class="chart-wrapper">
            <Chart
              v-if="emailChartData.labels"
              :chart-data="emailChartData"
              :height="200"
            />
            <div v-else class="loading-placeholder">Cargando...</div>
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
  name: 'StudentStatsCards',
  components: {
    Chart,
  },
  props: {
    stats: {
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
  },
  computed: {
    totalChartData() {
      // Gráfica simple mostrando el total
      return {
        labels: ['Total'],
        datasets: [
          {
            backgroundColor: ['#1CA4FC'],
            data: [this.stats.total || 1],
          },
        ],
      };
    },
    registrationChartData() {
      const completed = this.stats.completed || 0;
      const pending = this.stats.pending || 0;

      if (completed === 0 && pending === 0) {
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
        labels: [
          `Registro completo (${completed})`,
          `Pendiente (${pending})`,
        ],
        datasets: [
          {
            backgroundColor: ['#20B000', '#FABE23'],
            data: [completed, pending],
          },
        ],
      };
    },
    emailChartData() {
      const sent = this.emailStats.sent || 0;
      const pending = this.emailStats.pending || 0;
      const failed = this.emailStats.failed || 0;

      if (sent === 0 && pending === 0 && failed === 0) {
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

<style lang="scss" scoped>
.student-stats-container {
  width: 100%;
  margin-bottom: 30px;

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;

    .stat-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .stat-card-header {
        padding: 16px 20px;
        background: linear-gradient(135deg, #1ca4fc 0%, #0d7bc4 100%);
        color: white;

        h5 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .stat-card-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;

        .chart-wrapper {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;

          .loading-placeholder {
            color: #999;
            font-size: 14px;
          }
        }

        .stat-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;

          .number {
            font-size: 32px;
            font-weight: 700;
            color: #1ca4fc;
          }

          .label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }

        .stat-values {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;

          .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #f8f9fa;
            border-radius: 6px;

            .number {
              font-size: 24px;
              font-weight: 700;

              &.completed {
                color: #20b000;
              }

              &.pending {
                color: #fabe23;
              }

              &.sent {
                color: #20b000;
              }

              &.failed {
                color: #db1212;
              }
            }

            .label {
              font-size: 14px;
              color: #666;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .student-stats-container {
    .stats-cards {
      grid-template-columns: 1fr;
    }
  }
}
</style>
