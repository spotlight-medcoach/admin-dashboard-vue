<script>
import { Bar } from 'vue-chartjs';

export default {
  extends: Bar,
  props: ['chartData', 'options', 'render'],
  data() {
    return {
      defaultOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true,
          position: 'top',
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                precision: 0,
              },
              gridLines: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)',
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                maxRotation: 45,
                minRotation: 0,
              },
            },
          ],
        },
        tooltips: {
          enabled: true,
          mode: 'index',
          intersect: false,
        },
      },
    };
  },
  mounted() {
    this.renderChart(
      this.chartData,
      Object.assign({}, this.defaultOptions, this.options || {})
    );
  },
  watch: {
    render() {
      this.renderChart(
        this.chartData,
        Object.assign({}, this.defaultOptions, this.options || {})
      );
    },
    chartData: {
      deep: true,
      handler() {
        this.renderChart(
          this.chartData,
          Object.assign({}, this.defaultOptions, this.options || {})
        );
      },
    },
  },
};
</script>
