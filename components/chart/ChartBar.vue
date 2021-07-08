<script>
    import { Bar } from 'vue-chartjs'

    export default {
        extends: Bar,
        props: ['chartData', 'render', 'max'],
        data () {
            return {
                options: {
                    scales: {
                        xAxes:[{
                            barPercentage: 0.7,
                        }],
                        yAxes: [
                            {
                                ticks: {
                                    beginAtZero: true,
                                    max: this.max + 1
                                }
                            }]
                    },
                    legend: {
                        display: false,
                        // position: this.pos ? this.pos : 'right'
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    borderRadius: 5,
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