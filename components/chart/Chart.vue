<script>
    import { Doughnut } from 'vue-chartjs'

    export default {
        extends: Doughnut,
        props: ['chartData'],
        data () {
            return {
                // chartData: {
                //     labels: [
                //         'Red',
                //         'Blue',
                //         'Yellow'
                //     ],
                //     datasets: [{
                //         label: 'My First Dataset',
                //         data: [300, 50, 100],
                //         backgroundColor: [
                //             'rgb(255, 99, 132)',
                //             'rgb(54, 162, 235)',
                //             'rgb(255, 205, 86)'
                //         ],
                //         hoverOffset: 4
                //     }]
                // },
                options: {
                    legend: {
                        display: true
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        mounted () {
            this.renderChart(this.chartData, this.options)
            console.log('from component', this.chartData)
        }
    }
</script>