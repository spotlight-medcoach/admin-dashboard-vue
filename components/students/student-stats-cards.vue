<template>
  <div class="student-stats-container">
    <div class="accordion" id="student-stats-accordion">
      <!-- Card 1: Total de estudiantes con estado de registro -->
      <div class="accordion-item">
        <h2 class="accordion-header" id="total-students-header">
          <button
            :class="['accordion-button', { collapsed: !isTotalStudentsOpen }]"
            type="button"
            @click="isTotalStudentsOpen = !isTotalStudentsOpen"
            :aria-expanded="isTotalStudentsOpen"
            aria-controls="collapse-total-students"
          >
            <i class="fas fa-users"></i>
            <span
              >Total de Estudiantes:
              <strong style="font-size: 18px">{{
                stats.total || 0
              }}</strong></span
            >
          </button>
        </h2>
        <div
          id="collapse-total-students"
          :class="[
            'accordion-collapse',
            'collapse',
            { show: isTotalStudentsOpen },
          ]"
          aria-labelledby="total-students-header"
        >
          <div class="accordion-body">
            <div class="graphic">
              <span>Distribución por Estado de Registro</span>
              <Chart
                v-if="
                  combinedChartData.labels &&
                  combinedChartData.labels.length > 0
                "
                :height="220"
                :chart-data="combinedChartData"
                :pos="'bottom'"
                :render="renderCount"
              />
              <div v-else class="loading-placeholder">Cargando...</div>
            </div>
            <div class="stat-values">
              <div class="stat-item">
                <span class="number completed">{{ stats.completed || 0 }}</span>
                <span class="label">Registro completo</span>
              </div>
              <div class="stat-item">
                <span class="number pending">{{ stats.pending || 0 }}</span>
                <span class="label">Pendiente de registro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="accordion" id="email-stats-accordion">
      <!-- Card 2: Distribución de correos enviados -->
      <div class="accordion-item">
        <h2 class="accordion-header" id="email-stats-header">
          <button
            :class="['accordion-button', { collapsed: !isEmailStatsOpen }]"
            type="button"
            @click="isEmailStatsOpen = !isEmailStatsOpen"
            :aria-expanded="isEmailStatsOpen"
            aria-controls="collapse-email-stats"
          >
            <i class="fas fa-envelope"></i>
            <span>Correos Enviados</span>
          </button>
        </h2>
        <div
          id="collapse-email-stats"
          :class="[
            'accordion-collapse',
            'collapse',
            { show: isEmailStatsOpen },
          ]"
          aria-labelledby="email-stats-header"
        >
          <div class="accordion-body">
            <div class="graphic">
              <span>Estado de Correos</span>
              <Chart
                v-if="emailChartData.labels && emailChartData.labels.length > 0"
                :height="220"
                :chart-data="emailChartData"
                :pos="'bottom'"
                :render="renderCount"
              />
              <div v-else class="loading-placeholder">Cargando...</div>
            </div>
            <div class="stat-values">
              <div class="stat-item">
                <span class="number sent">{{ emailStats.sent || 0 }}</span>
                <span class="label">Enviados</span>
              </div>
              <div class="stat-item">
                <span class="number pending">{{
                  emailStats.pending || 0
                }}</span>
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
  data() {
    return {
      renderCount: 0,
      isTotalStudentsOpen: true,
      isEmailStatsOpen: true,
    };
  },
  computed: {
    combinedChartData() {
      const total = Number(this.stats.total) || 0;
      const completed = Number(this.stats.completed) || 0;
      const pending = Number(this.stats.pending) || 0;

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

      // Asegurar que siempre haya datos válidos
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

      // Si no hay datos, mostrar un placeholder
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
  watch: {
    stats: {
      handler() {
        this.renderCount += 1;
      },
      deep: true,
    },
    emailStats: {
      handler() {
        this.renderCount += 1;
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.student-stats-container {
  width: 100%;
  margin-bottom: 30px;
  display: flex;
  flex-direction: row;
  gap: 16px;

  .accordion {
    flex: 1;
    .accordion-item {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 15px;
      overflow: hidden;

      .accordion-header {
        .accordion-button {
          background: linear-gradient(135deg, #1ca4fc 0%, #0d7bc4 100%);
          color: white;
          font-weight: 600;
          border: none;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;

          &::after {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ffffff'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
            filter: brightness(0) invert(1);
          }

          &.collapsed::after {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ffffff'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
            filter: brightness(0) invert(1);
            transform: rotate(-90deg);
          }

          i {
            font-size: 18px;
          }

          strong {
            font-size: 20px;
            font-weight: 700;
          }

          &:not(.collapsed) {
            background: linear-gradient(135deg, #1ca4fc 0%, #0d7bc4 100%);
            color: white;
            box-shadow: none;
          }

          &:focus {
            box-shadow: none;
            border-color: transparent;
          }
        }
      }

      .accordion-body {
        padding: 20px;

        .graphic {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;

          span {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
          }

          .loading-placeholder {
            color: #999;
            font-size: 14px;
            padding: 40px;
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
            padding: 12px 16px;
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
</style>
