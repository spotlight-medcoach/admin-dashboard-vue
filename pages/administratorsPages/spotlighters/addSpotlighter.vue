<template>
    <div>
        <Navigation />
        <div class="add-container">
            <div class="button-container">
                <nuxt-link to="/administratorsPages/spotlighters">
                    <i class="fas fa-chevron-left"></i>
                    Cancelar y volver
                </nuxt-link>
            </div>

            <div class="form-container">
                <p class="title">Crear spotlighter</p>
                <hr>

                <div class="inputs-container">
                    <div class="inputs">
                        <div class="int-cont">
                            <Input
                                type="text"
                                placeholder="Nombre(s)"
                                v-model="name"
                                title="Nombre(s)" />
                        </div>
                        <div class="int-cont">
                            <Input
                                type="text"
                                placeholder="Apellidos"
                                v-model="last_name"
                                title="Apellidos" />
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="input-country">
                            <h3>País</h3>
                            <select v-model="new_country" class="js-example-basic-single" @change="changeCountry()">
                                <option :value="''" disabled selected>País</option>
                                <option :value="country.code" v-for="country in countries" :key="country.code">{{country.name}}</option>
                            </select>
                        </div>
                        <div class="input-country">
                            <h3>Estado</h3>
                            <select v-model="new_state" class="js-example-basic-single" @change="changeState()">
                                <option :value="''" disabled selected>Estado</option>
                                <option :value="state.region" v-for="state in states" :key="state.region">{{state.region}}</option>
                            </select>
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="int-cont">
                            <InputIcon
                                type="email"
                                placeholder="example@example.com"
                                v-model="email"
                                icon="fas fa-user-circle"
                                title="Correo electrónico" />
                        </div>
                        <div class="int-cont">
                            <InputIcon
                                type="text"
                                placeholder="341 111 2233"
                                v-model="phone"
                                icon="fas fa-mobile-alt"
                                title="Teléfono" />
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="int-cont">
                            <div class="input">
                                <h3><i class="fas fa-university"></i> Universidad</h3>
                                <select v-model="university" class="js-example-basic-single">
                                    <option :value="''" disabled selected>Universidad</option>
                                    <option :value="university._id" v-for="university in universities" :key="university._id">{{university.name}}</option>
                                </select>
                            </div>
                        </div>
                        <div class="int-cont">
                            <InputIcon
                                type="text"
                                placeholder="5555 5555 5555 5555"
                                v-model="account_number"
                                icon="fas fa-credit-card"
                                title="Número de cuenta" />
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="int-cont">
                            <div class="password">
                                <InputIcon
                                    :type="typePassword"
                                    placeholder="• • • • • • • •"
                                    v-model="password"
                                    icon="fas fa-lock"
                                    title="Contraseña" />

                                <button :class="classPassword" @click="changeIconClassPass"></button>
                            </div>
                        </div>
                        <div class="int-cont">
                            <div class="password">
                                <InputIcon
                                    :type="typeConfirm"
                                    placeholder="• • • • • • • •"
                                    v-model="confirm_password"
                                    icon="fas fa-lock"
                                    title="Confirmar contraseña" />
                                <button :class="classConfirm" @click="changeIconClassConf"></button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div class="load-container">
                <div class="lds-dual-ring" v-if="busy"></div>
            </div>

            <div class="btn-container">
                <SuccessButton
                    :text="'Agregar usuario'"
                    :click="addSpotlighter"
                    :new_class="'btn'"
                    :i_class="'fas fa-check-circle'"
                />
            </div>
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
import SuccessButton from '../../../components/buttons/SuccessButton';
import SuccessToast from '../../../components/toasts/SuccessToast';
import FailToast from '../../../components/toasts/FailToast';

export default {
    components: {
        Navigation,
        InputIcon,
        Input,
        SuccessButton,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            busy: false,
            loading: false,
            showSuccessToast: false,
            showFailToast: false,
            titleToast: '',

            name: '',
            last_name: '',
            email: '',
            phone: '',
            new_country: '',
            new_state: '',
            university: '',
            account_number: '',
            password: '',
            confirm_password: '',

            universities: [],
            countries: [],
            states: [],
            
            typePassword: 'password',
            classPassword: 'btn fas fa-eye-slash',

            typeConfirm: 'password',
            classConfirm: 'btn fas fa-eye-slash',
        }
    },
    async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            
            this.universities = JSON.parse(localStorage.getItem('universities'));
        }

        await this.getCountries();
        console.log('contries', this.countries)
    },
    methods: {
        async getCountries() {
            try {
                this.loading = !this.loading;
                
                let contriesResponse = await this.$axios.get('https://vsbs6hgmxf.execute-api.us-west-2.amazonaws.com/refinery/api/countries');
                this.countries = contriesResponse.data;

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        async addSpotlighter() {
            try {
                this.busy = !this.busy;
                
                let data = {
                    name: this.name,
                    last_name: this.last_name,
                    email: this.email,
                    password: this.password,
                    role: 'Spotlighter',
                    phone: this.phone,
                    account_number: this.account_number,
                    country: this.new_country,
                    state: this.new_state,
                    university_id: this.university
                }
    
                let add_response = await this.$axios.post('/createUser', data);
                // alert(add_response.data.message)
                this.titleToast = add_response.data.message;
                this.showSuccessToast = !this.showSuccessToast;
                
                setTimeout(() => {
                    this.busy = !this.busy;
                    this.showSuccessToast = !this.showSuccessToast;
                    this.$router.push({ path: '/administratorsPages/spotlighters' });
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
        async changeCountry() {
            console.log('newCountry', this.new_country);
            let statesResponse = await this.$axios.get(`https://vsbs6hgmxf.execute-api.us-west-2.amazonaws.com/refinery/api/countries/cities?country_code=${this.new_country}`)
            this.states = statesResponse.data;
        },
        changeState() {
            console.log('newState', this.new_state);
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
        changeIconClassConf() {
            if (this.typeConfirm == 'password') {
                this.typeConfirm = 'text'
                this.classConfirm = 'btn fas fa-eye'
            } else if (this.typeConfirm == 'text') {
                this.typeConfirm = 'password'
                this.classConfirm = 'btn fas fa-eye-slash'
            }
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

    .form-container {
        display: flex;
        flex-direction: column;
        width: 85%;
        margin-top: 1%;
        margin-left: auto;
        margin-right: auto;
    }

    hr {
        margin: 0;
        opacity: 1;
        border: 2px solid #000;
    }

    .title {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
    }

    .button-container {
        margin-top: 1.5%;
        margin-left: 3%;
    }

    .button-container a {
        color: #000;
        text-decoration: none;
    }

    .inputs {
        display: flex;
        flex-direction: row;
        justify-content:center;
        align-items: center;
        /* width: 90%; */
        width: 960px;
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

    .input-country {
        width: 100%;
        margin: 20px 40px;
    }

    .input-country i {
        font-size: 24px;
        margin-right: 8px;
    }

    .input-country h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .input-country select {
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

    .input-country select:focus {
        outline: none;
    }

    .int-cont {
        width: 100%;
        margin: 10px 40px;
    }

    .password {
        display: flex;
        align-items: flex-end;
        width: 100%;
    }

    .inputs-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* height: 472px; */
    }

    .inputs-email {
        display: flex;
        width: 60%;
        justify-content: center;
        align-items: center;
        margin-top: 2%;
        margin-bottom: 2%;
    }

    .btn-container {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin: 2% 10%;
    }
    
    .load-container {
        display: flex;
        justify-content: center;
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