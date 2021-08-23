<script>
    import { Bar } from 'vue-chartjs'

    export default {
        extends: Bar,
        props: ['chartData', 'render'],
        data () {
            return {
                max: 0,
                options: {
                    tooltips: { enabled: false },
                    hover: { mode: null },
                    datasets: {
                        bar: {
                            categoryPercentage: 0.6
                        }
                    },
                    scales: {
                        // dataset: {
                        //     barPercentage: 0.1
                        // },
                        // xAxes:[{
                        //     // dataset: {
                        //         barPercentage: 0.1,
                        //     // }
                        // }],
                        yAxes: [
                            {
                                ticks: {
                                    beginAtZero: true,
                                    // max: Math.max(...this.chartData.datasets[0].data) + 1,
                                    // stepSize: 1
                                }
                            }]
                    },
                    legend: {
                        display: false,
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    borderRadius: 5,
                }
            }
        },
        mounted () {
            this.renderChart(this.chartData, this.options)
            // this.max = Math.max(...this.chartData.datasets[0].data) + 1
            // console.log('max', Math.max(...this.chartData.datasets[0].data) + 1)
        },
        watch: {
            render: function(oldVal, newVal) {
                this.renderChart(this.chartData, this.options)
                // this.max = Math.max(...this.chartData.datasets[0].data) + 1
                // console.log('max', Math.max(...this.chartData.datasets[0].data) + 1)
            }
        }
    }
</script>