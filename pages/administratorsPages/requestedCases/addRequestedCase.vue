<template>
    <div>
        <Navigation />
        <div class="add-case-container">
            <div class="btn-container">
                <nuxt-link to="/administratorsPages/requestedCases">
                    <i class="fas fa-chevron-left"></i>
                    Volver
                </nuxt-link>
            </div>

            <Loading v-if="loading" />
            <div v-else class="form-container">
                <div class="title-container">
                    <h1>Solicitar nuevo caso</h1>
                    <button type="button" class="btn cancel" @click="discardCaseConfirm"><i class="fas fa-trash"></i> Descartar caso</button>
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
                        <label for="">ID</label>
                        <input type="text" name="" id="" disabled v-model="new_id">
                    </div>
                </div>

                <div class="inputs-container topic">
                    <div class="topic-container">
                        <div class="input">
                            <h3>Tema</h3>
                            <select v-model="topicBubbleSelected" class="js-example-basic-single" @change="filterSubtopics(topicBubbleSelected)">
                                <option :value="''" disabled selected>Tema</option>
                                <option :value="top.bubble_id" v-for="top in topics" :key="top._id">{{top.name}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="subtopic-container">
                        <div class="input">
                            <h3>Subtema</h3>
                            <select v-model="subtopicBubbleSelected" class="js-example-basic-single" @change="changeSubtopic(subtopicBubbleSelected)">
                                <option :value="''" selected>Elegir subtema</option>
                                <option :value="sub.subtopic" v-for="sub in subtopics" :key="sub._id">{{sub.name}}</option>
                            </select>
                        </div>
                    </div>

                    <div class="language-container">
                        <h3>Idioma</h3>
                        <select v-model="languageSelected" class="js-example-basic-single">
                            <option value="" selected disabled>Idioma</option>
                            <option value="Español">Español</option>
                            <option value="Ingles">Ingles</option>
                        </select>
                    </div>
                </div>

                <div class="inputs-container">
                    <div class="description">
                        <h3>Descripción requerida</h3>
                        <quill-editor
                            :options="editorOptionAnswer"
                            @change="onEditorChange($event)" />
                    </div>
                </div>
                
                <div class="assign">
                    <h3>Asignar caso a: {{ nameSpotlighter }}</h3>
                    <div class="input">
                        <select v-model="spotlighterSelected" class="js-example-basic-single" name="state" @change="setSelectedUser(spotlighterSelected)">
                            <option :value="''" selected>No asignar a alguien</option>
                            <option :value="spot.spotlighter_id" v-for="spot in spotlighters" :key="spot.spotlighter_id">{{spot.name}} {{spot.last_name}}</option>
                        </select>
                    </div>
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

        <!-- Descartar caso -->
        <RejectModal 
            v-if="showRejectModal"
            @close="closeRejectModal"
            :action="discardCase"
            :textTitle="textTitle"
            :textBody="textModal"
            :textButton="button"
            :isBusy="rejectBusy" />

        <SuccessToast
            v-if="showSuccessToast"
            :textTitle="titleToast" />

        <FailToast 
            v-if="showFailToast"
            :textTitle="titleToast" />
    </div>
</template>

<script>
import Navigation from '../../../components/navs/Navigation';
import Input from '../../../components/inputs/Input';
import InputTitle from '../../../components/inputs/InputTitle';
import SuccessButton from '../../../components/buttons/SuccessButton';
import Loading from '../../../components/modals/Loading';
import RejectModal from '../../../components/modals/RejectModal';
import SuccessToast from '../../../components/toasts/SuccessToast';
import FailToast from '../../../components/toasts/FailToast';

export default {
    components: {
        Navigation,
        Input,
        InputTitle,
        SuccessButton,
        Loading,
        RejectModal,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            loading: true,
            busy: false,
            showRejectModal: false,
            showSuccessToast: false,
            showFailToast: false,
            rejectBusy: false,

            topicBubbleSelected: '',
            subtopicBubbleSelected: '',
            languageSelected: '',

            textModal: '',
            textTitle: '',
            button: '',
            titleToast: '',

            spotlighters: [],
            topics: [],
            subtopics: [],
            admin_data: {},
            spotlighterSelected: '',
            nameSpotlighter: '',

            case_name: '',
            id: 'A-',
            new_id: '',
            topicFolio: '',
            subtopicFolio: '',
            topic: '',
            subtopic: '',

            contentDescription: '',
            contentHtml: '',
            editorOptionAnswer: {
                theme: 'bubble',
                placeholder: 'Descripción requerida para el caso.',
            }
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
        onEditorChange({ quill, html, text }) {
            this.contentDescription = quill.getContents();
            this.contentHtml = quill.root.innerHTML;
        },
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
            if (spotlighter == '') {
                this.nameSpotlighter = ''
            } else {
                let spotlighterData = this.spotlighters.filter(spot => spot.spotlighter_id == spotlighter)[0];
                console.log(spotlighterData)
                this.nameSpotlighter = spotlighterData.name + " " + spotlighterData.last_name;
            }
        },
        filterSubtopics(topic) {
            console.log('topic', this.topics)
            this.topicFolio = this.topics.filter(top => top.bubble_id == topic)[0].topic_folio;
            this.new_id = this.id + this.topicFolio + '-';

            let topicFiltered = this.topics.filter(top => top.bubble_id == topic)
            this.subtopics = topicFiltered[0].subtopics
        },
        changeSubtopic(subtopic) {
            this.subtopicFolio = this.subtopics.filter(sub => sub.subtopic == subtopic)[0].subtopic_folio;
            this.new_id = this.id + this.topicFolio + '-' + this.subtopicFolio + '-' + (parseInt(this.$route.query.length) + 1);
            console.log('length', this.$route.query.length)
        },
        async addPendingCase() {
            try {
                this.busy = !this.busy;
                console.log('spot: ', this.spotlighterSelected)

                if (this.case_name.trim() == '' || this.topicBubbleSelected == '' || this.subtopicBubbleSelected == '' || this.languageSelected == '' || this.contentHtml.trim() == '') {
                    this.titleToast = 'Todos los campos deben ser llenados';
                    this.showFailToast = !this.showFailToast;

                    setTimeout(() => {
                        this.busy = !this.busy;
                        this.showFailToast = !this.showFailToast;
                    }, 1);
                } else {
                    let case_response = await this.$axios.post('/createPendingCase', {
                        admin_user: this.admin_data.admin_id,
                        pending_case_id: this.new_id,
                        name: this.case_name,
                        topic_bubble: this.topicBubbleSelected,
                        subtopic_bubble: this.subtopicBubbleSelected,
                        language: this.languageSelected,
                        requested: true,
                        request_description: {
                            content: this.contentDescription,
                            html: this.contentHtml
                        },
                        description: {
                            content: {
                                ops: [{
                                    insert: ''
                                }]
                            },
                            html: ''
                        },
                        feedback: {
                            content: {
                                ops: [{
                                    insert: ''
                                }]
                            },
                            html: ''
                        },
                        spotlighter_id: this.spotlighterSelected,
                        status: this.spotlighterSelected ? 'Accepted by Spotlighter' : 'Pending'
                    })
    
                    this.busy = !this.busy;
                    // alert(case_response.data.message)
                    this.titleModal = case_response.data.message;
                    this.showSuccessToast = !this.showSuccessToast;
    
                    setTimeout(() => {
                        this.showSuccessToast = !this.showSuccessToast;
                        this.$router.push({ path: '/administratorsPages/requestedCases' })
                    }, 1500);
                }
            } catch (err) {
                this.busy = false;
                console.log(err)

                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },
        discardCaseConfirm() {
            this.textTitle = 'Descartar caso'
            this.textModal = 'Al descartar esete caso, se eliminará toda la información relacionada con él. Esta acción no puede deshacerse. ¿Deseas descartarlo?';
            this.button = 'Descartar caso'
            this.showRejectModal = !this.showRejectModal;
        },
        discardCase() {
            this.rejectBusy = !this.rejectBusy;

            setTimeout(() => {
                this.rejectBusy = !this.rejectBusy;
                this.showRejectModal = !this.showRejectModal;
                this.$router.push({ path: '/administratorsPages/requestedCases'});
            }, 2000);
        },
        closeRejectModal() {
            this.showRejectModal = false;
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
        /* display: flex; */
        margin: 10px 0px;
        width: 30%;
    }

    .topic-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .input {
        width: 100%;
    }

    .input select {
        height: 32px;
        width: 100%;
        border: none;
        border-bottom: 1px solid lightgray;
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

    .input select:focus {
        outline: none;
    }

    .subtopic-container {
        /* display: flex; */
        margin: 10px 0px;
        width: 30%;
    }

    .subtopic-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .language-container {
        width: 30%;
        margin: 10px 0px;
    }

    .language-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .language-container select {
        height: 32px;
        width: 100%;
        border: none;
        border-bottom: 1px solid lightgray;
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

    .language-container select:focus {
        outline: none;
    }

    .name {
        width: 65%;
    }
    .id {
        display: flex;
        flex-direction: column;
        /* margin: 10px 0px; */
        width: 30%;
    }

    .id label {
        color: #1CA4FC;
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .id input {
        margin-top: .5rem;
        background-color:transparent;
        border: 0px solid;
        height:30px;
        width: 100%;
        margin-top: 0px;
        font-family: Montserrat;
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
        font-weight: bold;
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
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 0;
    }

    .quill-editor {
        margin-top: 1%;
        border: 1px solid #000000;
        box-sizing: border-box;
        border-radius: 10px;
        padding: 10px;
        font-family: Montserrat !important;
    }

    .ql-font-montserrat {
        font-family: 'Montserrat', sans-serif;
    }

    .ql-container p {
        font-family: Montserrat !important;
        color: red;
    }

    .ql-bubble {
        font-family: Montserrat;
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