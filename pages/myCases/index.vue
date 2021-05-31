<template>
    <div>
        <SpotlighterNavigation />

        <div class="my-cases-container">
            <div class="head-container">
                <div class="title">
                    <h1>Mis casos</h1>
                </div>

                <div class="pay-container">
                    <p>Fecha de último pago</p>
                    <button class="btn"><i class="fas fa-dollar-sign"></i> Solicitar pago</button>
                </div>

            </div>

            <div class="filter-container">
                <div class="search-input">
                    <input type="text" placeholder="    Buscar">
                </div>

                <select name="" id="" class="js-example-basic-single">
                    <option value="" selected>Todos los estados</option>
                    <option value="">En edición</option>
                    <option value="">Feedback</option>
                    <option value="">Aprobados</option>
                </select>
                <button class="btn" @click="addCase"><i class="fas fa-plus-circle"></i> Crear nuevo caso</button>
            </div>

            <div class="table-container">
                <Loading v-if="loading" />
                <table v-else class="table table-bordered">
                    <thead class="thead-cases">
                        <tr>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Descripcion</th>
                            <th scope="col">Estado</th>
                            <th scope="col" class="actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(theCase, index) in myCases" :key="theCase._id">
                            <td>{{ theCase.name }}</td>
                            <td>{{ theCase.topic_name }}</td>
                            <td>{{ theCase.subtopic_name }}</td>
                            <td>{{ theCase.request_description }}</td>
                            <td>{{ theCase.status }}</td>
                            <td class="td-style">
                                <button class="btn op" @click="viewCase(myCases[index])"><i class="fas fa-list-alt"></i> Ver caso</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination-container">
                <div class="dropdown drop">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Rows per page:!!!!
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                        <button class="dropdown-item" type="button">10</button>
                        <button class="dropdown-item" type="button">15</button>
                        <button class="dropdown-item" type="button">20</button>
                    </div>
                </div>

                <nav class="arrows" aria-label="Page navigation example">
                    <ul class="pagination">
                        <div class="loco">
                            1 - 10 of n items!!!
                        </div>
                        <li class="page-item p-2">
                            <a class="page-link arrow" href="#" aria-label="Previous">
                                <span class="fas fa-chevron-left"></span>
                            </a>
                        </li>
                        <li class="page-item p-2">
                            <a class="page-link arrow" href="#" aria-label="Next">
                                <span class="fas fa-chevron-right"></span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<script>
import SpotlighterNavigation from '../../components/navs/SpotlighterNavigation';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        SpotlighterNavigation,
        Loading
    },
    data() {
        return {
            loading: false,
            myCases: [],
            topics: []
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`

            if (!localStorage.getItem('universities'))
                await this.getUniversities()
            if (!localStorage.getItem('topics'))
                await this.getTopics()
            
            this.topics = JSON.parse(localStorage.getItem('topics'));
            this.universities = JSON.parse(localStorage.getItem('universities'));
        }

        await this.getMyCases();
        console.log('cas', this.myCases)
    },
    methods: {
        async getMyCases() {
            this.loading = !this.loading;

            let casesResponse = await this.$axios.get('/getMyCases')
            this.myCases = casesResponse.data.payload;
            console.log(casesResponse.data.payload)

            this.loading = !this.loading;
            this.filterTopicSubtopicName();
        },
        filterTopicSubtopicName() {
            console.log('filter')
            let casesUpdated = []
            this.myCases.forEach(oneCase => {
                oneCase.topic_name = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0].name
                let topic = this.topics.filter(top => top.bubble_id == oneCase.topic_bubble)[0]

                let subtopic = topic.subtopics.filter(sub => sub.subtopic == oneCase.subtopic_bubble)
                oneCase.subtopic_name = subtopic[0].name
                
                casesUpdated.push(oneCase);
            });
            console.log('updated', casesUpdated)
            this.myCases = casesUpdated;
        },
        addCase() {
            this.$router.push({ path: '/myCases/addNewCase' });
        },
        viewCase(theCase) {
            // console.log(theCase)
            this.$router.push({ path: `/myCases/${theCase._id}` });
        }
    }
}
</script>

<style scoped>
    .my-cases-container {
        display: flex;
        flex-direction: column;
        margin: 20px 20px;
        font-family: Montserrat;
    }

    .head-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 48px;
    }

    .title h1 {
        margin: 0;
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
    }

    .pay-container {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .pay-container p {
        margin: 0;
    }

    .pay-container button {
        background: #20B000;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        color: #FFF;
        margin-left: 40px;
        padding: 12px 20px;
        width: 254px;
        height: 48px;
    }

    .filter-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0px;
    }

    .search-input {
        height: 48px;
        width: 50%;
    }

    .search-input input {
        height: 100%;
        width: 100%;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
    }

    .search-input input:focus {
        outline: none;
    }

    .filter-container button {
        border-radius: 10px;
        color: #1CA4FC;
        border: 1px solid #1CA4FC;
        padding: 12px 20px;
        width: 254px;
        height: 48px;
    }

    .filter-container select {
        height: 32px;
        width: 20%;
        border: none;
        border-bottom: 1px solid #000;
    }

    .thead-cases {
        background: #212529;
        color: #FFF;
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
    }

    .loco {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .drop {
        margin-right: 5%;
    }

    .arrows {
        margin-left: 5%;
    }
    .arrow {
        border: none;
        color: #FE9400;
    }
</style>