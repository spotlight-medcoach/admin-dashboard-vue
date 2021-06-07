<template>
    <div>
        <SpotlighterNavigation />
        <div class="feedback-container">
            <div class="title">
                <p>Casos que requieren corrección</p>
            </div>

            <Loading v-if="loading" />
            <div v-else class="cards-container">
                
                <FeedbackCard
                    v-for="oneCase in casesFeedback"
                    :key="oneCase._id"
                    :name="oneCase.name"
                    :topicName="oneCase.topic_name"
                    :subtopicName="oneCase.subtopic_name"
                    :requestDescription="oneCase.request_description"
                 />
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
import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import Loading from '../../components/modals/Loading';
import FeedbackCard from '../../components/cards/FeedbackCard';

export default {
    components: {
        SpotlighterNavigation,
        Loading,
        FeedbackCard
    },
    data() {
        return {
            casesFeedback: [],
            topics: [],
            subtopics: [],
            loading: false,
            name: '',
            topicName: '',
            subtopicName: '',
            requestDescription: '',

            totalCases: 0,
            page: 1,
            pageResults: 5
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'))
        }

        await this.getCasesWithFeddback()
        
        console.log('cases: ', this.casesFeedback)
    },
    methods: {
        async getCasesWithFeddback() {
            this.loading = !this.loading;

            let casesWithFeedback = await this.$axios.get('/getCasesWithFeedback', {
                params: {
                    page: this.page,
                    pageResults: this.pageResults
                }
            })
            // console.log(casesWithFeedback)
            this.casesFeedback = casesWithFeedback.data.payload.cases;
            this.totalCases = casesWithFeedback.data.payload.length;
            this.filterTopicSubtopicName()
            
            this.loading = !this.loading;
        },
        filterTopicSubtopicName() {
            let casesUpdated = []
            this.casesFeedback.forEach(oneCase => {
                oneCase.topic_name = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0].name
                let topic = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0]

                let subtopic = topic.subtopics.filter(sub => sub.subtopic == oneCase.subtopic_bubble)
                oneCase.subtopic_name = subtopic[0].name
                
                casesUpdated.push(oneCase);
            });

            this.casesFeedback = casesUpdated;
        },
        update(theCase) {
            alert(theCase)
        },
        rowsChange() {
            this.getCasesWithFeddback()
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
    .feedback-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
    }

    .title {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
        color: #000;
        margin: 20px 40px;
    }

    .title p {
        margin: 0;
    }

    .cards-container {
        display: flex;
        flex-direction: column;
        margin: 00px 40px;
    }







    /* .table-container {
        margin: 0px 40px;
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

    .edit {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #1CA4FC;
    }

    .edit button {
        color: #1CA4FC;
    }

    .actions {
        width: 5%;
    } */

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