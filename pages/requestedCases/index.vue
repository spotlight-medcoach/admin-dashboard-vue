<template>
    <div>
        <Navigation />
        <div class="cases-container">
            <div class="head-container">
                <div class="title">
                    <p>Casos solicitados</p>
                </div>
                <nuxt-link 
                    v-if="!loading"
                    to="/requestedCases/addRequestedCase"
                    class="add-button" >
                    <i class="fas fa-list-alt"></i>
                        Solicitar nuevo caso
                </nuxt-link>
            </div>

            <Loading v-if="loading" />
            <div v-else class="search-container">
                <input type="searchText" placeholder="    Buscar">
                
                <select v-model="selected" class="options" @change="changeStatus(selected)">
                    <option value="" selected>Filtrar por estado</option>
                    <option value="Approved by Spotlighter" selected>Aprobado</option>
                    <option value="Pending">Pendiente</option>
                    <option value="Accepted by Spotlighter">Aceptado por spotlighter</option>
                    <option value="In edit">En edición</option>
                    <option value="Pendign review">Pendiente de revisión</option>
                    <option value="With feedback">Con retroalimentación</option>
                </select>
            </div>

            <div v-if="!loading" class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Descripcion</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Usuario</th>
                            <th scope="col" class="act">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="theCase in cases" :key="theCase._id">
                            <td>{{ theCase.name }}</td>
                            <td>{{ theCase.topic_name }}</td>
                            <td>{{ theCase.subtopic_name }}</td>
                            <td>{{ theCase.request_description.content }}</td>
                            <td>{{ theCase.status }}</td>
                            <td>{{ theCase.spotlighter_id ? theCase.admin_user.name + " " + theCase.admin_user.last_name : 'Sin asignar' }}</td>
                            <td class="act">
                                <div class="op">
                                    <button class="btn op" @click="caseDetails(theCase._id)"><i class="fas fa-list-alt"></i> Ver caso</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="!loading" class="pagination-container">
                <div class="select-container">
                    <span>Rows per page: </span>
                    <select v-model="pageResults" class="js-example-basic-single" @change="rowsChange">
                        <option value=1>1</option>
                        <option value=2>2</option>
                        <option value=3>3</option>
                        <option value=5>5</option>
                        <option value=10>10</option>
                        <option value=15>15</option>
                        <option value=20>20</option>
                    </select>
                </div>

                <div class="arrows-container">
                    <span>{{ (page - 1) * pageResults + 1 }} - {{ pageResults > totalCases ? totalCases : (page * pageResults) > totalCases ? totalCases : page * pageResults }} of {{totalCases}} casos</span>
                    <button class="btn fas fa-chevron-left" @click="before" :disabled="disbaledBefore == 1"></button>
                    <button class="btn fas fa-chevron-right" @click="after" :disabled="disabledAfter == 1"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import ActionsModal from '../../components/modals/ActionsModal';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        Navigation,
        ActionsModal,
        Loading
    },
    data() {
        return {
            cases: [],
            topics: [],
            subtopics: [],
            selected: '',
            loading: false,
            showModal: false,
            disbaledBefore: 0,
            disabledAfter: 0,

            totalCases: 0,
            pageResults: 5,
            page: 1
        }
    },
    async created() {
        if (process.browser) 
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`

        await this.getCases()
        this.before();
        // this.loading = !this.loading
    },
    methods: {
        filterTopic(topic_bubble) {
            var topic = '';
            if (process.browser) {
                let topics = JSON.parse(localStorage.getItem('topics'))
                topic = topics.filter(top => top.bubble_id == topic_bubble)[0].name
            }
            return topic;
        },
        filterSubtopic(topic_bubble, subtopic_bubble) {
            var topic
            var subtopic
            if (process.browser) {
                let topics = JSON.parse(localStorage.getItem('topics'));
                topic = topics.filter(top => top.bubble_id == topic_bubble)[0]
                subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);
            }

            return subtopic[0].name
        },
        async getCases() {
            try {
                this.loading = !this.loading

                let cases_response = await this.$axios.get('/getCasesRequested', {
                    params: {
                        status: this.selected,
                        page: this.page,
                        pageResults: this.pageResults
                    }
                });
                this.cases = cases_response.data.payload.cases;
                this.totalCases = cases_response.data.payload.length;
                // console.log('tot:', this.totalCases)
                let cases = this.cases;
                cases.forEach(oneCase => {
                    oneCase.topic_name = this.filterTopic(oneCase.topic_bubble)
                    oneCase.subtopic_name = this.filterSubtopic(oneCase.topic_bubble, oneCase.subtopic_bubble)
                });

                this.cases = cases;
                this.loading = !this.loading
                console.log(this.cases);
            } catch (err) {
                console.log(err);
            }
        },
        caseDetails(case_id) {
            this.$router.push({ path: `/requestedCases/${case_id}` });
        },
        rowsChange() {
            this.page = 1;

            if (this.pageResults > this.totalCases || this.totalCases == 0) {
                this.disabledAfter = 1
                this.disbaledBefore = 1
            } else {
                this.disbaledBefore = 1
                this.disabledAfter = 0
            }

            this.getCases()
        },
        before() {
            if (this.page == 1) {
                this.disbaledBefore = 1
                if (this.totalCases == 0)
                    this.disabledAfter = 1
            } else if (this.page > 1) {
                this.page -= 1;
                this.disabledAfter = 0

                if (this.page == 1)
                    this.disbaledBefore = 1
            }
            this.getCases();
        },
        after() {
            this.page += 1;
            if (this.page * this.pageResults > this.totalCases) {
                this.disabledAfter = 1
                this.disbaledBefore = 0
            } else {
                if (this.page > 1)
                    this.disbaledBefore = 0
            }

            this.getCases();
        },
        changeStatus(new_status) {
            console.log(new_status);
            this.getCases()
        }
    }
}
</script>

<style scoped>
    .cases-container {
        display: flex;
        flex-direction: column;
        margin: 0px 40px;
        font-family: Montserrat;
    }

    .head-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 39px;
        margin: 20px 0px;
    }

    .title {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
        color: #000;
        height: 39px;
    }
    
    .title p {
        margin: 0;
    }

    .add-button {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 12px 20px;

        background: #20B000;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;

        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        letter-spacing: 0.4px;
        color: #FFFFFF;
        text-decoration: none;
    }

    .add-button i {
        position: static;
        font-size: 24px;
        margin-right: 12px;
    }

    .search-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 48px;
    }

    .search-container input {
        width: 800px;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
    }

    .search-container input:focus {
        outline: none;
    }

    .options {
        font-family: Montserrat;
        width: 15%;
        height: 32px;
        margin: 0px 40px;
        border: none;
        border-bottom: 1px solid #000;
    }

    .table-container {
        margin: 20px 0px;
    }

    .thead-admin {
        background: #212529;
        color: #FFF;
        text-transform: uppercase;
    }

    .thead-admin th:last-child {
        border-radius: 0px 15px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 0px 15px 0px 0px;
        -webkit-border-radius: 0px 15px 0px 0px;
    }

    .thead-admin th:first-child {
        border-radius: 15px 0px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 15px 0px 0px 0px;
        -webkit-border-radius: 15px 0px 0px 0px;
    }

    .tbody {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 18px;
        color: #212529;
    }

    td {
        vertical-align: middle;
    }

    .act {
        width: 10%;
    }

    .op {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #1CA4FC;
        font-size: 12px;
    }

    .op i {
        font-size: 24px;
        padding-right: 5px;
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
        height: 56px;
    }

    .select-container {
        display: flex;
        align-items: center;
        margin: 0px 40px;
    }

    .select-container span {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        margin: 0px 10px;
        color: #212529;
    }

    .arrows-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 0px 40px;
    }

    .arrows-container span {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        color: #212529;
    }

    .arrows-container button {
        color: #FE9400;
    }

</style>