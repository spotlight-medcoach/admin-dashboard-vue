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
                    <input type="searchText" placeholder="    Buscar">
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
                            <td>{{ theCase.name }}</td>
                            <td>{{ theCase.topic_name }}</td>
                            <td>{{ theCase.subtopic_name }}</td>
                            <td>{{ theCase.description.content }}</td>
                            <td>{{ new Date(theCase.approved_date).toLocaleDateString('es-ES') }}</td>
                            <td>{{ theCase.spotlighter_id.admin_id.name }} {{ theCase.spotlighter_id.admin_id.last_name }}</td>
                            <td>
                                <button class="btn options" @click="caseDetails(cases[index])"><i class="fas fa-list-alt"></i> Ver caso</button>
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
                    <span>1 - {{pageResults}} of {{totalCases}} casos</span>
                    <button class="btn fas fa-chevron-left" @click="before"></button>
                    <button class="btn fas fa-chevron-right" @click="after"></button>
                </div>
            </div>


        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';

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
            topicSelected: '',
            subtopicSelected: '',
            topicBubbleSelected: '',
            subtopicBubbleSelected: '',
            topicName: '',
            subtopicName: '',

            totalCases: 0,
            pageResults: 5,
            page: 1
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
        }

        await this.getCasesWithReview();
        console.log('cases: ', this.cases)
        console.log('topics: ', this.topics)
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
                        pageResults: this.pageResults
                    }
                });
                // console.log(cases_response)
                this.cases = cases_response.data.payload.cases;
                this.totalCases = cases_response.data.payload.length;

                let cases = this.cases;
                // console.log(new Date(this.cases[0].approved_date).toLocaleDateString('es-ES'))
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
        getTopicName(topic_bubble) {
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0].name
            return topic;
        },
        getSubtopicName(topic_bubble, subtopic_bubble) {
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0]
            let subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);
            return subtopic[0].name
        },
        caseDetails(theCase) {
            this.$router.push({ path: `/reviewNewQuestions/${theCase._id}` });
        },
        rowsChange() {
            this.getCasesWithReview()
        },
        before() {
            alert('Logica para esta asunto')
        },
        after() {
            alert('Logica para esta asunto')
        },
    }
}
</script>

<style scoped>
    .cases-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
        margin: 40px 40px;
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
        align-items: center;
        position: static;
        width: 100%;
        height: 48px;
    }

    .search {
        display: flex;
        align-items: center;
        width: 60%;
        height: 100%;
    }

    .search input {
        width: 800px;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
    }

    .select-container {
        display: flex;
        /* justify-content: space-between; */
        height: 32px;
        margin: 0px 40px;
        /* width: 25%; */
    }

    .select-container select {
        margin: 0px 20px;
        border: none;
        border-bottom: 1px solid #000;
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