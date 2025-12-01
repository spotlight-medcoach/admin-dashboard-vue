<template>
    <div>
        <Navigation />
        <div class="add-container">
            <div class="button-container">
                <nuxt-link to="/administratorsPages/spotlighters">
                    <i class="fas fa-chevron-left"></i>
                    Cancelar y volver
                </nuxt-link>
                <button v-if="!loading" class="btn" @click="confirmModal"><i class="fas fa-trash"></i> Eliminar usuario</button>
            </div>

            <Loading v-if="loading" />
            <div v-else class="form-container">
                <p class="title">Editar spotlighter</p>
                <hr>

                <div class="inputs-container">
                    <div class="inputs">
                        <div class="inp-cont">
                            <Input
                                type="text"
                                placeholder="Nombre"
                                v-model="new_name"
                                :val="new_name"
                                title="Nombre(s)" />
                        </div>
                        <div class="inp-cont">
                            <Input
                                type="text"
                                placeholder="Apellidos"
                                v-model="new_last_name"
                                :val="new_last_name"
                                title="Apellidos" />
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="input">
                            <h3>País</h3>
                            <select v-model="new_country" class="js-example-basic-single" @change="changeCountry()">
                                <option :value="''" disabled selected>País</option>
                                <option :value="country.code" v-for="country in countries" :key="country.code">{{country.name}}</option>
                            </select>
                        </div>
                        <div class="input">
                            <h3>Estado</h3>
                            <select v-model="new_state" class="js-example-basic-single" @change="changeState()">
                                <option :value="''" disabled selected>Estado</option>
                                <option :value="state.region" v-for="state in states" :key="state.region">{{state.region}}</option>
                            </select>
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="inp-cont">
                            <InputIcon
                                type="text"
                                placeholder="example@example.com"
                                v-model="new_email"
                                :val="new_email"
                                icon="fas fa-user-circle"
                                title="Correo electrónico" />
                        </div>
                        <div class="inp-cont">
                            <InputIcon
                                type="text"
                                placeholder="341 111 2233"
                                v-model="new_phone"
                                :val="new_phone"
                                icon="fas fa-mobile-alt"
                                title="Teléfono" />
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="input">
                            <h3><i class="fas fa-university"></i> Universidad</h3>
                            <select v-model="new_university" class="js-example-basic-single">
                                <option :value="''" disabled selected>Universidad</option>
                                <option :value="university._id" v-for="university in universities" :key="university._id">{{university.name}}</option>
                            </select>
                        </div>
                        <div class="inp-cont">
                            <InputIcon
                                type="text"
                                placeholder="5555 5555 5555 5555"
                                v-model="new_account_number"
                                :val="new_account_number"
                                icon="fas fa-credit-card"
                                title="Número de cuenta" />
                        </div>
                    </div>

                    <div class="inputs-pass">
                        <div class="inp-cont-pass">
                            <InputIcon
                                :type="typePassword"
                                placeholder="• • • • • • • •"
                                v-model="new_password"
                                :val="new_password"
                                icon="fas fa-envelope"
                                title="Contraseña" />

                                <button :class="classPassword" @click="changeIconClassPass"></button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="load-container">
                <div class="lds-dual-ring" v-if="busy"></div>
            </div>

            <div class="btn-container">
                <SuccessButton
                    v-if="!loading"
                    :text="'Guardar cambios'"
                    :click="updateSpotlighter"
                    :new_class="'btn'"
                    :i_class="'fas fa-save'"
                />
            </div>

            <DeleteUserModal 
                v-if="isShowModal"
                @close="closeModal"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :name="nameUser"
                :action="deleteUser"
                :isBusy="busy" />
            
        </div>

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
import InputIcon from '../../../components/inputs/InputIcon';
import Input from '../../../components/inputs/Input';
import Loading from '../../../components/modals/Loading';
import SuccessButton from '../../../components/buttons/SuccessButton';
import DeleteUserModal from '../../../components/modals/DeleteUserModal';
import SuccessToast from '../../../components/toasts/SuccessToast';
import FailToast from '../../../components/toasts/FailToast';

export default {
    components: {
        Navigation,
        InputIcon,
        Input,
        Loading,
        SuccessButton,
        DeleteUserModal,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            loading: false,
            busy: false,
            isShowModal: false,
            showSuccessToast: false,
            showFailToast: false,

            universities: [],
            countries: [],
            states: [],
            titleModal: '',
            bodyModal: '',
            titleToast: '',
            
            nameUser: '',
            user_data: {},
            new_name: '',
            new_last_name: '',
            new_country: '',
            new_state: '',
            new_email: '',
            new_phone: '',
            new_university: '',
            new_account_number: '',
            new_password: '',
            new_confirm_password: '',

            typePassword: 'password',
            classPassword: 'btn fas fa-eye-slash',
        }
    },
    async created() {
        if (process.browser){
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.universities = JSON.parse(localStorage.getItem('universities'))
        }
        
        // await this.getUser();
        this.loading = !this.loading;

        await this.$store.dispatch('spotlighters/getSpotlighter', this.$route.params.id);
        this.user_data = this.$store.getters['spotlighters/getSpotlighter'];
        console.log('user_data', this.user_data)
        this.setValueInputs();
        await this.getCountries()
        
        this.loading = !this.loading;
    },
    methods: {
        async getUser() {
            try {
                this.loading = !this.loading;
                
                let user_response = await this.$axios.get('/getOneAdminUser', { params: { user_id: this.$route.params.id } });
                let user_data = user_response.data.payload;
                this.user_data = user_data;
                this.setValueInputs();
    
                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        async getCountries() {
            try {
                this.loading = !this.loading;
                
                let contriesResponse = await this.$axios.get('https://vsbs6hgmxf.execute-api.us-west-2.amazonaws.com/refinery/api/countries');
                this.countries = contriesResponse.data;

                let statesResponse = await this.$axios.get(`https://vsbs6hgmxf.execute-api.us-west-2.amazonaws.com/refinery/api/countries/cities?country_code=${this.new_country}`)
                this.states = statesResponse.data;

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        async changeCountry() {
            console.log('newCountry', this.new_country);
            let statesResponse = await this.$axios.get(`https://vsbs6hgmxf.execute-api.us-west-2.amazonaws.com/refinery/api/countries/cities?country_code=${this.new_country}`)
            this.states = statesResponse.data;
        },
        changeState() {
            console.log('newState', this.new_state);
        },
        setValueInputs() {
            this.new_name = this.user_data.name
            this.new_last_name = this.user_data.last_name
            this.new_country = this.user_data.country
            this.new_state = this.user_data.state
            this.new_email = this.user_data.email
            this.new_phone = this.user_data.phone
            this.new_account_number = this.user_data.account_number
            console.log(this.universities.filter(uni => uni._id == this.user_data.university_id))
            let myUniversity = this.universities.filter(uni => uni._id == this.user_data.university_id)[0]
            this.new_university = myUniversity._id
        },
        changeIconClassPass() {
            if (this.typePassword == 'password') {
                this.typePassword = 'text'
                this.classPassword = 'btn fas fa-eye'
            } else if (this.typePassword == 'text') {
                this.typePassword = 'password'
                this.classPassword = 'btn fas fa-eye-slash'
            }
        },
        async updateSpotlighter() {
            try {
                this.busy = !this.busy;
    
                let updated_response = await this.$axios.put('/updateUser', {
                    user_id: this.$route.params.id,
                    name: this.new_name,
                    last_name: this.new_last_name,
                    country: this.new_country,
                    state: this.new_state,
                    email: this.new_email,
                    phone: this.new_phone,
                    university_id: this.new_university,
                    account_number: this.new_account_number,
                    password: this.new_password
                });
    
                // alert(updated_response.data.message);
                this.titleToast = updated_response.data.message;
                this.showSuccessToast = !this.showSuccessToast;
    
                this.busy = !this.busy;
    
                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                    this.$router.push({ path: '/administratorsPages/spotlighters' })
                }, 1500);
            } catch (err) {
                this.busy = !this.busy;
                console.log(err);

                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },
        confirmModal() {
            this.titleModal = 'Eliminar spotlighter';
            this.bodyModal = '¿Deseas eliminar el siguiente usuario?'
            this. nameUser = this.user_data.name + " " + this.user_data.last_name
            this.isShowModal = !this.isShowModal;
        },
        async deleteUser() {
            try {
                let inactive_response = await this.$axios.put('/setInactiveUser', { user_id: this.$route.params.id });

                this.titleToast = inactive_response.data.message;
                this.showSuccessToast = !this.showSuccessToast
                
                setTimeout(() => {
                    this.isShowModal = !this.isShowModal;
                    this.showSuccessToast = !this.showSuccessToast
                    this.$router.push({ path: '/administratorsPages/spotlighters' })
                }, 1500);
            } catch (err) {
                console.log(err);
                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },
        closeModal() {
            this.isShowModal = !this.isShowModal;
        }
    }
}
</script>

<style scoped>
    .add-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
    }

    .button-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-top: 10px;
        margin-left: 40px;
    }

    .button-container button {
        color: #DB1212;
        margin-right: 5%;
    }

    .title {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
    }

    hr {
        margin: 0;
        opacity: 1;
        border: 2px solid #000;
    }

    .button-container a {
        color: #000;
        text-decoration: none;
    }

    .form-container {
        display: flex;
        flex-direction: column;
        /* align-items: center; */
        width: 90%;
        margin-top: 10px;
        margin-left: auto;
        margin-right: auto;
    }

    .inputs-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .inputs {
        display: flex;
        flex-direction: row;
        justify-content:center;
        align-items: center;
        width: 90%;
    }

    .inputs-pass {
        display: flex;
        align-items: flex-start;
        width: 90%;
    }

    .inp-cont {
        width: 100%;
    }

    .inp-cont-pass {
        display: flex;
        align-items: flex-end;
        width: 42%;
        margin: 0px 40px;
    }

    .btn-container {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-top: 3%;
        margin-right: 10%;
        margin-bottom: 3%;
    }

    .load-container {
        display: flex;
        justify-content: center;
    }

    .input {
        width: 100%;
    }

    .input i {
        font-size: 24px;
        margin-right: 8px;
    }

    .input h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .input select {
        height: 32px;
        width: 100%;
        border: none;
        border-bottom: 2px solid lightgray;
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