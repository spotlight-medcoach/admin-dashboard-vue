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
                    :requestDescription="oneCase.request_description.content.ops[0].insert"
                 />
            </div>

            <div v-if="!loading" class="pagination-container">
                <div class="select-container">
                    <span>Resultados por página: </span>
                    <select v-model="pageResults" class="js-example-basic-single" @change="rowsChange">
                        <option value=1>1</option>
                        <option value=2>2</option>
                        <option value=3>3</option>
                        <option value=5>5</option>
                        <option value=10>10</option>
                        <option value=20>20</option>
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
import SpotlighterNavigation from '@/components/navs/spotlighter.nav.vue';
import Loading from '@/components/modals/loading.modal.vue';
import FeedbackCard from '@/components/cards/feedback.card.vue';

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
            pageResults: 10,
            page: 1,
            disbaledBefore: 0,
            disabledAfter: 0,
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'))
        }

        await this.getCasesWithFeddback();
        this.before();
    },
    methods: {
        async getCasesWithFeddback() {
            try {
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
            } catch (err) {
                console.log(err);
            }
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
            this.page = 1;

            if (this.pageResults > this.totalCases || this.totalCases == 0) {
                this.disabledAfter = 1
                this.disbaledBefore = 1
            } else {
                this.disbaledBefore = 1
                this.disabledAfter = 0
            }

            this.getCasesWithFeddback()
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
                
                this.getCasesWithFeddback();
            }
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

            this.getCasesWithFeddback();
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