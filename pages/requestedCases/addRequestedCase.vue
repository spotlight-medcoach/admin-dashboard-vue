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
                    
                    <div class="input-name">
                        <InputTitle 
                            icon=""
                            title="Nombre del caso" />

                        <Input
                            type="text"
                            placeholder="Example"
                            v-model="case_name" />
                    </div>

                    <div class="">
                        <InputTitle 
                            icon=""
                            title="ID" />
                        <Input
                            type="text"
                            placeholder="123456"
                            v-model="case_id" />
                    </div>
                </div>

                <div class="inputs-container topic-container">
                    <div class="">
                        <InputTitle 
                            icon=""
                            title="Tema" />
                        <Input
                            type="text"
                            placeholder="Texto"
                            v-model="topic" />
                    </div>

                    <div class="">
                        <InputTitle 
                            icon=""
                            title="Subtema" />
                        <Input
                            type="text"
                            placeholder="Texto"
                            v-model="subtopic" />
                    </div>

                    <div class="">
                        <InputTitle 
                            icon=""
                            title="Idioma" />
                        <Input
                            type="text"
                            placeholder="Español"
                            v-model="language" />
                    </div>
                </div>

                <div class="inputs-container">
                    <div class="description">
                        <InputTitle 
                            icon=""
                            title="Descripción" />
                        <textarea
                            name="description"
                            id="description"
                            v-model="description"
                            rows="7"
                            placeholder="Lorem ipsum dolor, sit amet consectetur adipisicing elit. Veniam, nobis expedita provident eveniet distinctio odio iusto recusandae facere. Molestiae, consectetur. Corporis temporibus voluptate velit quis quae animi cumque nobis tenetur."></textarea>
                    </div>
                </div>
                
                <select v-model="selected" class="js-example-basic-single" name="state" @change="setSelectedUser(selected)">
                    <option :value="spot.spotlighter_id" v-for="spot in spotlighters" :key="spot.spotlighter_id">{{spot.name}} {{spot.last_name}}</option>
                </select>

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

            <ModalConfirm v-if="isShowModal" @close="closeModal" :textBody="textModal" :textTitle="textTile" :deleteUser="deleteUser" />
        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Input from '../../components/inputs/Input';
import InputTitle from '../../components/inputs/InputTitle';
import SuccessButton from '../../components/buttons/SuccessButton';
import Loading from '../../components/modals/Loading';
import ModalConfirm from '../../components/modals/ModalConfirm';

export default {
    components: {
        Navigation,
        Input,
        InputTitle,
        SuccessButton,
        Loading,
        ModalConfirm
    },
    data() {
        return {
            loading: true,
            busy: false,
            isShowModal: false,
            textModal: '',
            textTitle: '',
            admin_data: {},
            spotlighters: [],
            topics: [],
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
                this.spotlighters = spotlighters_response.data.payload;
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
        filterBubbleTopic(topic_name) {
            var topic_bubble = '';
            
            topic_bubble = this.topics.filter(top => top.name.toLowerCase() == topic_name.toLowerCase())

            return topic_bubble[0].bubble_id;
        },
        filterBubbleSubtopic(topic_bubble, subtopic_name) {
            let topic = this.topics.filter(top => top.bubble_id == topic_bubble);
            let subtopics = topic[0].subtopics
            
            let subtopic = subtopics.filter(sub => sub.name.toLowerCase() == subtopic_name.toLowerCase())

            return subtopic[0].subtopic;
        },
        async addPendingCase() {
            this.busy = !this.busy;

            let topic_bubble = this.filterBubbleTopic(this.topic);;
            let subtopic_bubble = this.filterBubbleSubtopic(topic_bubble, this.subtopic);

            let case_response = await this.$axios.post('/createPendingCase', {
                admin_user: this.admin_data.admin_id,
                pending_case_id: this.case_id,
                name: this.case_name,
                topic_bubble: topic_bubble,
                subtopic_bubble: subtopic_bubble,
                language: this.language,
                requested: true,
                request_description: this.description,
                spotlighter_id: this.selected,
            })

            // console.log(case_response.data.message)
            this.busy = !this.busy;
            this.isShowModal = !this.isShowModal;
            this.textTitle = 'Nuevo caso'
            this.textModal = case_response.data.message
            setTimeout(() => {
                this.$router.push({ path: '/requestedCases' })
                this.isShowModal = !this.isShowModal;
            }, 1500);
        },
        discardCase() {
             this.$router.push({ path: '/requestedCases'});
        },
        deleteUser() {

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
        width: 100%;
        margin-top: 1%;
    }

    .input-name {
        width: 80%;
    }

    .topic-container {
        display: flex;
        justify-content: space-between;
    }

    .description {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    textarea {
        margin-top: 1%;
        border: 1px solid #000000;
        box-sizing: border-box;
        border-radius: 10px;
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