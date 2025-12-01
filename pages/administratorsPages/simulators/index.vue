<template>
    <div>
        <div class="simulator-container">
            <h1>Simuladores</h1>

            <Loading v-if="loading" />
            <div v-else class="cards-container">
                <SimulatorCard
                    v-for="simulator in simulators"
                    :key="simulator._id"
                    :title="simulator.name"
                    :id="simulator._id"
                    :totalQuestions="simulator.questions.length"
                    :status="simulator.enabled"
                    @view="simulatorDetails(simulator)" />
            </div>
        </div>
    </div>
</template>

<script>
import Loading from '../../../components/modals/Loading';
import SimulatorCard from '../../../components/cards/administrators/SimulatorCard';

export default {
    components: {
        Loading,
        SimulatorCard
    },
    data() {
        return {
            loading: false,
            simulators: []
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            // this.topics = JSON.parse(localStorage.getItem('topics'));
        }
        await this.getSimulators();
        console.log(this.simulators)
    },
    methods: {
        async getSimulators() {
            try {
                this.loading = !this.loading;

                let simulatorsResponse = await this.$axios.get('/getAllSimulators');
                this.simulators = simulatorsResponse.data.payload;

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        simulatorDetails(simulator) {
            this.$router.push({ path: `/administratorsPages/simulators/${simulator._id}` });
        }
    }
}
</script>

<style scoped>
    .simulator-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
        width: 100%;
    }

    .simulator-container h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 32px;
        line-height: 39px;
        color: #000000;
    }

    .cards-container {
        display: flex;
        flex-direction: column;
    }
</style>
