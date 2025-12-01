<template>
    <div>
        <Navigation />
        
        <div class="cases-container">
            <div class="head-container">
                <p>Revisión de casos nuevos</p>
            </div>

            <Loading v-if="loading" />
            <div v-else class="filter-container">
                <div class="search">
                    <input v-model="search" type="searchText" placeholder="Buscar" @keyup.enter="searchCases">
                </div>
                
                <div class="select-container">
                    <select v-model="topicSelected" name="topic" class="js-example-basic-single" @change="filterSubtopics(topicSelected)">
                        <option value="" selected>Temas</option>
                        <option :value="top" v-for="top in topics" :key="top._id">{{top.name}}</option>
                    </select>

                    <select v-model="subtopicSelected" name="subtopic" class="js-example-basic-single" @change="getCasesFilteredBySubtopic(subtopicSelected)">
                        <option value="" selected>Subtemas</option>
                        <option :value="sub.subtopic" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                    </select>
                </div>
            </div>

            <div v-if="!loading" class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-cases">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Descripcion</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Usuario</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(theCase, index) in cases" :key="theCase._id">
                            <td>{{ theCase.pending_case_id }}</td>
                            <td>{{ theCase.name }}</td>
                            <td>{{ theCase.topic_name }}</td>
                            <td>{{ theCase.subtopic_name }}</td>
                            <td data-toggle="tooltip" data-placement="right" :title="theCase.description.content.ops[0].insert" class="over">{{ theCase.description.content.ops[0].insert }}</td>
                            <td>{{ theCase.approved_date ? new Date(theCase.approved_date).toLocaleDateString('es-ES') : 'Sin fecha de aceptación' }}</td>
                            <td>{{ theCase.spotlighter_id.admin_id.name }} {{ theCase.spotlighter_id.admin_id.last_name }}</td>
                            <td>
                                <button class="btn options" @click="caseDetails(cases[index])"><i class="fas fa-list-alt"></i> Ver caso</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="!loading" class="pagination-container">
                <div class="results-container">
                    <span>Resultados por página: </span>
                    <select v-model="pageResults" class="js-example-basic-single" @change="rowsChange">
                        <option value=1>1</option>
                        <option value=2>2</option>
                        <option value=3>3</option>
                        <option value=5>5</option>
                        <option value=10>10</option>
                        <option value=15>15</option>
                    </select>
                </div>

                <div class="arrows-container">
                    <span>{{ (page - 1) * pageResults + 1 }} - {{ pageResults > totalCases ? totalCases : (page * pageResults) > totalCases ? totalCases : page * pageResults }} de {{totalCases}} casos</span>
                    <button class="btn fas fa-chevron-left" @click="before" :disabled="disbaledBefore == 1"></button>
                    <button class="btn fas fa-chevron-right" @click="after" :disabled="disabledAfter == 1"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Navigation from '../../../components/navs/Navigation';
import Loading from '../../../components/modals/Loading';

export default {
    components: {
        Navigation,
        Loading
    },
    data() {
        return {
            cases: [],
            topics: [],
            subtopics: [],
            loading: false,
            search: '',
            topicSelected: '',
            subtopicSelected: '',
            topicBubbleSelected: '',
            subtopicBubbleSelected: '',
            topicName: '',
            subtopicName: '',

            disbaledBefore: 0,
            disabledAfter: 0,
            totalCases: 0,
            page: 1,
            pageResults: 10,
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
        }

        await this.getCasesWithReview();
        this.before()
    },
    methods: {
        async getCasesWithReview() {
            try {
                this.loading = !this.loading;

                let cases_response = await this.$axios.get('/getPendingReview', {
                    params: {
                        topic_bubble: this.topicBubbleSelected,
                        subtopic_bubble: this.subtopicBubbleSelected,
                        page: this.page,
                        pageResults: this.pageResults,
                        pending_case_id: this.search
                    }
                });
                
                this.cases = cases_response.data.payload.cases;
                this.totalCases = cases_response.data.payload.length;

                let cases = this.cases;
                cases.forEach(oneCase => {
                    oneCase.topic_name = this.getTopicName(oneCase.topic_bubble);
                    oneCase.subtopic_name = this.getSubtopicName(oneCase.topic_bubble, oneCase.subtopic_bubble);
                })

                this.cases = cases;
                this.loading = !this.loading;
            } catch (err) {
                console.log('err', err);
            }
        },
        filterSubtopics(topic) {
            this.topicBubbleSelected = topic.bubble_id;
            this.subtopics = topic.subtopics;
            this.getCasesWithReview();
        },
        getCasesFilteredBySubtopic(subtopic) {
            this.subtopicBubbleSelected = subtopic;
            this.getCasesWithReview();
        },
        searchCases() {
            try {
                this.getCasesWithReview();
            } catch (err) {
                console.log(err);
            }
        },
        getTopicName(topic_bubble) {
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0].name
            return topic;
        },
        getSubtopicName(topic_bubble, subtopic_bubble) {
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0]
            let subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);
            return subtopic[0].name
        },
        caseDetails(theCase) { // ?totalCases=${this.cases.length}
            this.$router.push({ path: `/administratorsPages/reviewNewQuestions/${theCase._id}?totalCases=${this.cases.length}` });
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

            this.getCasesWithReview()
        },
        before() {
            if (this.page == 1) {
                this.disbaledBefore = 1
                if (this.totalCases == 0)
                    this.disabledAfter = 1
                else {
                    if (this.totalCases > this.pageResults)
                        this.disabledAfter = 0
                    else
                        this.disabledAfter = 1
                }
            } else if (this.page > 1) {
                this.page -= 1;
                this.disabledAfter = 0

                if (this.page == 1)
                    this.disbaledBefore = 1
                
                this.getCasesWithReview();
            }
        },
        after() {
            this.page += 1;
            if (this.page * this.pageResults >= this.totalCases) {
                this.disabledAfter = 1
                this.disbaledBefore = 0
            } else {
                if (this.page > 1)
                    this.disbaledBefore = 0
            }

            this.getCasesWithReview();
        },
    }
}
</script>

<style scoped>
    .cases-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: Montserrat;
    }

    .head-container {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
        color: #000000;
    }


    .filter-container {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        position: static;
        width: 100%;
        height: 48px;
    }

    .filter-container select {
        height: 32px;
        width: 60%;
        margin: 0px 20px;
        border: none;
        border-bottom: 1px solid #000;
        background-color: transparent;
        background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill=''><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;
        background-size: 12px;
        background-position: calc(100% - 10px) center;
        background-repeat: no-repeat;
        -webkit-appearance: none;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        border-bottom-left-radius: 0px;
    }

    .filter-container select:focus {
        outline: none;
    }

    .search {
        display: flex;
        align-items: center;
        width: 60%;
        height: 100%;
    }

    .search input {
        padding: 12px;
        width: 800px;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
    }

    .select-container {
        display: flex;
        height: 32px;
        margin: 0px 40px;
        width: 40%;
    }

    /* .select-container select {
        margin: 0px 20px;
        border: none;
        border-bottom: 1px solid #000;
        width: 60%;
    } */

    table {
        table-layout:fixed;
    }

    .table-container {
        width: 100%;
        height: 100%;
        margin: 20px 0px;
    }

    .thead-cases {
        background: #212529;
        color: #FFF;
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 15px;
        text-transform: uppercase;
    }

    .thead-cases th:last-child {
        border-radius: 0px 15px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 0px 15px 0px 0px;
        -webkit-border-radius: 0px 15px 0px 0px;
    }

    .thead-cases th:first-child {
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

    .over {
        overflow: hidden;
        -webkit-box-orient: vertical;
        display: -webkit-box;
        text-overflow: ellipsis;
        -webkit-line-clamp: 4;
        margin-bottom: 8px;
        border: none;
    }

    .options {
        color: #FE9400;
    }

    .options i {
        font-size: 24px;
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 56px;
    }

    .results-container {
        display: flex;
        align-items: center;
        margin: 0px 40px;
    }

    .results-container span {
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