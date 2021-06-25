<script>
    import { Doughnut } from 'vue-chartjs'

    export default {
        extends: Doughnut,
        props: ['chartData'],
        data () {
            return {
                options: {
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                }
            }
        },
        mounted () {
            this.renderChart(this.chartData, this.options)
            console.log('from component', this.chartData)
        }
    }
</script>