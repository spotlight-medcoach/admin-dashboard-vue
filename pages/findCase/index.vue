<template>
    <div>
        <Navigation />
        
        <div class="case-container">
            <div class="title">
                <h1>Busqueda de casos</h1>
                <button v-if="!loading" class="btn"><i class="fas fa-list-alt"></i> Crear un nuevo caso</button>
            </div>

            <Loading v-if="loading" />
            <div v-if="!loading" class="filter-container">
                <input v-model="search" type="text" placeholder="Buscar">

                <select v-model="topicSelected" name="topic" class="js-example-basic-single" @change="filterSubtopics(topicSelected)">
                    <option :value="''" selected>Temas</option>
                    <option :value="top" v-for="top in topics" :key="top._id">{{top.name}}</option>
                </select>

                <select v-model="subtopicBubbleSelected" name="subtopic" class="subtopic js-example-basic-single" @change="getCasesFilteredBySubtopic(subtopicBubbleSelected)">
                    <option :value="''" selected>Subtemas</option>
                    <option :value="sub.subtopic" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                </select>
            </div>

            <div v-if="!loading" class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-cases">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Caso</th>
                            <th scope="col">Tema</th>
                            <th scope="col">Subtema</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(theCase) in cases" :key="theCase._id">
                            <td>{{ theCase.spotlight_id }}</td>
                            <td>{{ theCase.name }}</td>
                            <td>{{ theCase.name_topic }}</td>
                            <td>{{ theCase.name_subtopic }}</td>
                            <td>{{ theCase.active ? 'Activo' : 'Inactivo' }}</td>
                            <td class="td-actions">
                                <label class="switch">
                                    <input type="checkbox" v-model="theCase.active" @change="changeStatusCase(theCase)">
                                    <span class="slider round"></span>
                                </label>
                                <button class="pencil btn fas fa-pencil-alt" @click="caseDetails(theCase._id)"></button>
                                <button class="plus btn fas fa-plus-square" @click="addToSimulatorConfirm(theCase._id)"></button>
                                <button class="trash btn fas fa-trash" @click="deleteConfirm(theCase._id)"></button>
                                <!-- <button class="btn op" @click="viewCase(cases[index])"><i class="fas fa-list-alt"></i> Ver caso</button> -->
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    <!-- v-model="contentDescription" -->
    <!-- {{contentDescription}}
<quill-editor
    :options="editorOptionAnswer"
    @change="onEditorChange($event)" /> -->

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
        
        <!-- Cambiar status del caso -->
        <InfoModal
            v-if="isShowInfoModal"
            @close="closeInfoModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :textButton="button" />

        <!-- Agregar al simulador -->
        <AddToSimulator
            v-if="isShowAddToSimulatorModal"
            @close="closeAddToSimulatorModal"
            @addSimu="addToSimulator"
            :data.sync="simulatorSelected"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :textButton="button"
            :allSimulators="simulators"
            :isBusy="busyAddToSimulator" />



        <!-- Eliminar el caso -->
        <RejectModal
            v-if="isShowDeleteModal"
            @close="closeRejectModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="deleteCase"
            :textButton="button"
            :isBusy="busyReject" />
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';
import InfoModal from '../../components/modals/InfoModal';
import AddToSimulator from '../../components/modals/AddToSimulator';
import RejectModal from '../../components/modals/RejectModal';

export default {
    components: {
        Navigation,
        Loading,
        InfoModal,
        AddToSimulator,
        RejectModal
    },
    data() {
        return {
            loading: false,
            isShowInfoModal: false,
            isShowDeleteModal: false,
            busyReject: false,
            isShowAddToSimulatorModal: false,
            busyAddToSimulator: false,

            simulators: [],
            topics: [],
            subtopics: [],
            topicSelected: {},
            topicBubbleSelected: '',
            subtopicBubbleSelected: '',
            search: '',
            simulatorSelected: '',

            titleModal: '',
            bodyModal: '',
            button: '',

            cases: [],
            caseToAddASimulator: '',
            caseToDelete: '',

            disbaledBefore: 0,
            disabledAfter: 0,
            totalCases: 0,
            page: 1,
            pageResults: 5,

            // contentDescription: '',
            // editorOptionAnswer: {
            //     theme: 'bubble',
            //     placeholder: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            // }
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
        }
        // console.log('topics', this.topics) 
        await this.getCases();
        await this.getSimulators();
    },
    methods: {
        // onEditorChange({ quill, html, text }) {
        //     this.contentDescription = quill.getContents()
        // },
        filterTopicName(topic_bubble) {
            let topic = '';
            topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0].name
            return topic;
        },
        filterSubtopicName(topic_bubble, subtopic_bubble) {
            var topic
            var subtopic
            topic = this.topics.filter(top => top.bubble_id == topic_bubble)[0]
            subtopic = topic.subtopics.filter(sub => sub.subtopic == subtopic_bubble);

            return subtopic[0].name
        },
        async getCases() {
            try {
                this.loading = !this.loading;

                let casesResponse = await this.$axios.get('/getCasesBank', {
                    params: {
                        page: this.page,
                        pageResults: this.pageResults,
                        bubble_topic: this.topicBubbleSelected,
                        bubble_subtopic: this.subtopicBubbleSelected,
                        spotlight_id: this.search
                    }
                })

                this.cases = casesResponse.data.payload.cases;
                this.cases.forEach(theCase => {
                    theCase.name_topic = this.filterTopicName(theCase.topic);
                    theCase.name_subtopic = this.filterSubtopicName(theCase.topic, theCase.subtopic)
                })

                this.totalCases = casesResponse.data.payload.length;

                console.log(this.cases)
                this.loading = !this.loading;
            } catch (err) {
                console.log(err)
            }
        },
        async getSimulators() {
            try {
                let simulatorsResponse = await this.$axios.get('/getAllSimulators');

                this.simulators = simulatorsResponse.data.payload;
            } catch (err) {
                console.log(err);
            }
        },
        filterSubtopics(topic) {
            this.subtopics = topic.subtopics;
            this.topicBubbleSelected = topic.bubble_id;
        },
        getCasesFilteredBySubtopic(subtopic) {
            console.log('sub', subtopic)
        },
        async changeStatusCase(theCase) {
            try {
                if (theCase.active) {
                    this.titleModal = 'Caso activado'
                    this.bodyModal = 'Cambiaste este caso a \"activo\".'
                    this.button = 'Entendido'
                } else {
                    this.titleModal = 'Caso desactivado'
                    this.bodyModal = 'Cambiaste este caso a \"inactivo\".'
                    this.button = 'Entendido'
                }
                
                this.isShowInfoModal = !this.isShowInfoModal;

                let updateCaseResponse = await this.$axios.put('/changeCaseStatus', {
                    case_id: theCase._id,
                    status: theCase.active
                })
                // console.log(updateCaseResponse)
            } catch (err) {
                console.log(err);
            }
        },
        addToSimulatorConfirm(theCase) {
            this.titleModal = 'Agregar caso al simulador'
            this.bodyModal = ' Selecciona el simulador al que deseas enviar este caso.'
            this.button = 'Agregar al simulador'
            this.caseToAddASimulator = theCase

            this.isShowAddToSimulatorModal = !this.isShowAddToSimulatorModal;
        },
        async addToSimulator() {
            try {
                this.busyAddToSimulator = !this.busyAddToSimulator;

                let addResponse = await this.$axios.put('/addCaseToSimulator', {
                    case_id: this.caseToAddASimulator,
                    simulator_id: this.simulatorSelected
                })

                alert(addResponse.data.message)

                this.busyAddToSimulator = !this.busyAddToSimulator;
                this.isShowAddToSimulatorModal = !this.isShowAddToSimulatorModal;
            } catch (err) {
                console.log(err);
            }
        },
        caseDetails(theCase) {
            this.$router.push({ path: `/findCase/${theCase}` });
        },
        deleteConfirm(theCase) {
            this.titleModal = 'Eliminar caso'
            this.bodyModal = '¿Deseas eliminar este caso? Esta acción no puede deshacerse.'
            this.button = 'Sí, eliminar'
            this.caseToDelete = theCase;
            this.isShowDeleteModal = !this.isShowDeleteModal;
        },
        async deleteCase() {
            try {
                this.busyReject = !this.busyReject;

                let deleteResponse = await this.$axios.delete('/deleteCaseBank', {
                    params: { case_id: this.caseToDelete }
                })

                console.log(deleteResponse);
                this.cases = this.cases.filter(theCase => theCase._id != deleteResponse.data.payload);
                this.totalCases -= 1;

                this.busyReject = !this.busyReject;
                this.isShowDeleteModal = !this.isShowDeleteModal;
            } catch (err) {
                console.log(err)
            }
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
        closeInfoModal() {
            this.isShowInfoModal = !this.isShowInfoModal
        },
        closeAddToSimulatorModal() {
            this.isShowAddToSimulatorModal = !this.isShowAddToSimulatorModal;
        },
        closeRejectModal() {
            this.isShowDeleteModal = !this.isShowDeleteModal;
        }
    }
}
</script>

<style scoped>
    .case-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
        margin: 20px 40px;
    }

    .title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .title h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 32px;
        line-height: 39px;
        color: #000000;
    }

    .title button {
        padding: 12px 20px;
        background: #20B000;
        color: #FFF;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
    }

    .title i {
        margin: 0px 8px;
    }

    .filter-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0px;
    }

    .filter-container input {
        padding: 12px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
        width: 65%;
    }

    .filter-container select {
        height: 32px;
        width: 15%;
        border: none;
        border-bottom: 1px solid #000;
    }

    table {
        table-layout:fixed;
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

    .td-actions button {
        font-size: 24px;
    }

    .pencil {
        color: #1CA4FC;
    }

    .plus {
        color: #000000;
    }

    .trash {
        color: #DB1212;
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

    /* switch */
    .switch {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 22px;
    }

    .switch input { 
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #D4D5D7;
        -webkit-transition: .4s;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }

    input:checked + .slider {
        background-color: #FE9400;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #FE9400;
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }

    /* Rounded sliders */
    .slider.round {
        border-radius: 34px;
    }

    .slider.round:before {
        border-radius: 50%;
    }

</style>