<script>
    import { Doughnut } from 'vue-chartjs'

    export default {
        extends: Doughnut,
        props: ['chartData', 'pos', 'render'],
        data () {
            return {
                options: {
                    tooltips: { enabled: false },
                    hover: { mode: null },
                    legend: {
                        display: true,
                        position: this.pos ? this.pos : 'right',
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                }
            }
        },
        mounted () {
            this.renderChart(this.chartData, this.options)
        },
        watch: {
            render: function(oldVal, newVal) {
                this.renderChart(this.chartData, this.options)
            }
        }
    }
</script>