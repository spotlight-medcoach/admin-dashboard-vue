<template>
    <div>
        <Navigation />
        <div class="add-case-container">
            <div class="btn-container">
                <nuxt-link to="/requestedCases">
                    <i class="fas fa-chevron-left"></i>
                    Volver
                </nuxt-link>
            </div>

            <Loading v-if="loading" />
            <div v-else class="form-container">
                <div class="title-container">
                    <h1>Solicitar nuevo caso</h1>
                    <button type="button" class="btn cancel" @click="discardCase"><i class="fas fa-trash mr-5 pr-5"></i> Descartar caso</button>
                </div>

                <div class="inputs-container">
                    <div class="name">
                        <Input
                            type="text"
                            placeholder="Nombre del caso"
                            v-model="case_name"
                            title="Nombre del caso" />
                    </div>

                    <div class="id">
                        <Input
                            type="text"
                            placeholder="1234"
                            v-model="case_id"
                            title="ID" />
                    </div>
                </div>

                <div class="inputs-container topic">
                    <div class="topic-container">
                        <div class="input">
                            <h3>Tema</h3>
                            <select v-model="topicBubbleSelected" class="js-example-basic-single" @change="filterSubtopics(topicBubbleSelected)">
                                <option value="" disabled selected>Tema</option>
                                <option :value="top.bubble_id" v-for="top in topics" :key="top._id">{{top.name}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="subtopic-container">
                        <div class="input">
                            <h3>Subtema</h3>
                            <select v-model="subtopicBubbleSelected" class="js-example-basic-single">
                                <option value="" selected>Elegir subtema</option>
                                <option :value="sub.subtopic" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                            </select>
                        </div>
                    </div>

                    <div class="inp-cont">
                        <Input
                            type="text"
                            placeholder="Español"
                            v-model="language"
                            title="Idioma" />
                    </div>
                </div>

                <div class="inputs-container">
                    <div class="description">
                        <h3>Descripción</h3>
                        <textarea
                                name="description"
                                id="description"
                                v-model="description"
                                rows="7"
                                placeholder="Lorem ipsum dolor, sit amet consectetur adipisicing elit. Veniam, nobis expedita provident eveniet distinctio odio iusto recusandae facere. Molestiae, consectetur. Corporis temporibus voluptate velit quis quae animi cumque nobis tenetur."></textarea>
                    </div>
                </div>
                
                <div class="assign">
                    <h3>Asignar caso a: {{ selected }}</h3>
                    <select v-model="selected" class="js-example-basic-single" name="state" @change="setSelectedUser(selected)">
                        <option :value="spot.spotlighter_id" v-for="spot in spotlighters" :key="spot.spotlighter_id">{{spot.name}} {{spot.last_name}}</option>
                    </select>
                </div>

                <div class="load-container">
                    <div class="lds-dual-ring" v-if="busy"></div>
                </div>

                <div class="add-btn">
                    <SuccessButton 
                        :text="'Solicitar nuevo caso'"
                        :click="addPendingCase"
                        :new_class="'btn'"
                        :i_class="'fas fa-list-alt'" /> 
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Input from '../../components/inputs/Input';
import InputTitle from '../../components/inputs/InputTitle';
import SuccessButton from '../../components/buttons/SuccessButton';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        Navigation,
        Input,
        InputTitle,
        SuccessButton,
        Loading,
    },
    data() {
        return {
            loading: true,
            busy: false,
            topicBubbleSelected: '',
            subtopicBubbleSelected: '',
            textModal: '',
            textTitle: '',
            admin_data: {},
            spotlighters: [],
            topics: [],
            subtopics: [],
            selected: '',
            case_name: '',
            case_id: '',
            topic: '',
            subtopic: '',
            language: '',
            description: ''
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.topics = JSON.parse(localStorage.getItem('topics'));
        }
        
        await this.getSpotlighters();
        this.getAdminData();
        this.loading = !this.loading;
        console.log('topics: ', this.topics);
    },
    methods: {
        async getSpotlighters() {
            try {
                let spotlighters_response = await this.$axios.get('/getAllSpotlighters?status=true');
                this.spotlighters = spotlighters_response.data.payload.spotlighters;
                console.log(spotlighters_response.data)
            } catch (err) {
                console.log(err);
            }
        },
        getAdminData() {
            if (process.browser) {
                this.admin_data = JSON.parse(localStorage.getItem('user'));
            }
        },
        setSelectedUser(spotlighter) {
            console.log('selected: ', spotlighter);
        },
        filterSubtopics(topic) {
            let topicFiltered = this.topics.filter(top => top.bubble_id == topic)
            this.subtopics = topicFiltered[0].subtopics
        },
        async addPendingCase() {
            try {
                this.busy = !this.busy;

                console.log({
                    admin_user: this.admin_data.admin_id,
                    pending_case_id: this.case_id,
                    name: this.case_name,
                    topic_bubble: this.topicBubbleSelected,
                    subtopic_bubble: this.subtopicBubbleSelected,
                    language: this.language,
                    requested: true,
                    request_description: this.description,
                    spotlighter_id: this.selected,
                })
                
                let case_response = await this.$axios.post('/createPendingCase', {
                    admin_user: this.admin_data.admin_id,
                    pending_case_id: this.case_id,
                    name: this.case_name,
                    topic_bubble: this.topicBubbleSelected,
                    subtopic_bubble: this.subtopicBubbleSelected,
                    language: this.language,
                    requested: true,
                    request_description: this.description,
                    spotlighter_id: this.selected,
                })

                this.busy = !this.busy;
                alert(case_response.data.message)
                this.$router.push({ path: '/requestedCases' })
            } catch (err) {
                console.log(err)
                alert(err.message)
            }
        },
        discardCase() {
             this.$router.push({ path: '/requestedCases'});
        },
        closeModal() {
            this.isShowModal = !this.isShowModal;
        }
    }
}
</script>

<style scoped>
    .add-case-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
    }

    .btn-container {
        margin-top: 1.5%;
        margin-left: 3%;
    }
    
    .btn-container a {
        color: #000;
        text-decoration: none;
    }

    .form-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin: 2%;
    }

    .title-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }

    .title-container h1 {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
    }

    .cancel {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        color: #DB1212;
        margin-right: 2%;
    }

    .cancel i {
        margin: .5rem;
    }

    .inputs-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        margin-top: 1%;
    }

    .topic-container {
        display: flex;
        width: 30%;
    }

    .topic-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .input {
        width: 100%;
    }

    .input select {
        width: 100%;
        border: 0px;
        outline: 0px;
        border-bottom: 2px solid lightgray;
    }

    .subtopic-container {
        display: flex;
        width: 30%;
    }

    .subtopic-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .name {
        width: 65%;
    }
    .id {
        width: 30%;
    }

    .topic {
        justify-content: space-between;
    }

    .inp-cont {
        width: 30%;
    }

    .assign {
        margin: 20px 0px;
    }

    .assign h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 24px;
    }

    .description {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .description h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 0;
    }

    textarea {
        margin-top: 1%;
        border: 1px solid #000000;
        box-sizing: border-box;
        border-radius: 10px;
        padding: 10px;
    }

    textarea:focus {
        outline: none;
    }
    
    .select-users {
        margin-top: 2%;
    }

    .add-btn {
        display: flex;
        justify-content: flex-end;
        width: 100%;
    }

    /* estilos para el loading predeterminado */
    .load-container {
        display: flex;
        justify-content: center;
        margin: 0px auto;
    }

    .lds-dual-ring {
        display: inline-block;
        width: 50px;
        height: 50px;
    }

    .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 44px;
        height: 44px;
        /* margin: 8px; */
        border-radius: 50%;
        border: 6px solid #FE9400;
        border-color: #FE9400 transparent #FE9400 transparent;
        animation: lds-dual-ring 1.2s linear infinite;
    }

    @keyframes lds-dual-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

</style>