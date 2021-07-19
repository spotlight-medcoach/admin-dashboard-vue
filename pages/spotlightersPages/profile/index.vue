<template>
    <div>
        <SpotlighterNavigation />
        <div class="profile-container">
            <div class="header-profile">
                <nuxt-link to="/myCases">
                    <i class="fas fa-chevron-left"></i>
                    Salir de perfil
                </nuxt-link>

                <button v-if="disabled && !loading" class="btn" @click="editProfile"><i class="fas fa-pencil-alt"></i> Edital perfil</button>
            </div>
            
            <Loading v-if="loading" />
            <div v-else class="body-profile">
                <h1>Configurar perfil</h1>
                <hr>

                <div class="inputs-container">
                    <div class="inputs">
                        <div class="inp-cont">
                            <Input
                                :dis="disabled"
                                type="text"
                                placeholder="Nombre"
                                v-model="new_name"
                                :val="new_name"
                                title="Nombre(s)" />
                        </div>
                        <div class="inp-cont">
                            <Input
                                :dis="disabled"
                                type="text"
                                placeholder="Apellidos"
                                v-model="new_last_name"
                                :val="new_last_name"
                                title="Apellidos" />
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="inp-cont">
                            <Input
                                :dis="disabled"
                                type="text"
                                placeholder="País"
                                v-model="new_country"
                                :val="new_country"
                                title="País"
                                class="disabled" />
                        </div>
                        <div class="inp-cont">
                            <Input
                                :dis="disabled"
                                type="text"
                                placeholder="Estado"
                                v-model="new_state"
                                :val="new_state"
                                title="Estado" />
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="inp-cont">
                            <InputIcon
                                :dis="disabled"
                                type="text"
                                placeholder="example@example.com"
                                v-model="new_email"
                                :val="new_email"
                                icon="fas fa-user-circle"
                                title="Correo electrónico" />
                        </div>
                        <div class="inp-cont">
                            <InputIcon
                                :dis="disabled"
                                type="text"
                                placeholder="341 111 2233"
                                v-model="new_phone"
                                :val="new_phone"
                                icon="fas fa-mobile-alt"
                                title="Teléfono" />
                        </div>
                    </div>

                    <div class="inputs">
                        <div v-if="disabled" class="inp-cont">
                            <InputIcon
                                :dis="disabled"
                                type="text"
                                placeholder="Universidad"
                                v-model="new_university"
                                :val="new_university"
                                icon="fas fa-university"
                                title="Universidad" />
                        </div>

                        <div v-else class="input">
                            <h3><i class="fas fa-university"></i> Universidad</h3>
                            <select v-model="new_university" class="js-example-basic-single">
                                <option :value="''" disabled selected>Universidad</option>
                                <option :value="university._id" v-for="university in universities" :key="university._id">{{university.name}}</option>
                            </select>
                        </div>


                        <div class="inp-cont">
                            <InputIcon
                                :dis="disabled"
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
                                :dis="disabled"
                                :type="typePassword"
                                placeholder="• • • • • • • •"
                                v-model="password"
                                icon="fas fa-lock"
                                title="Contraseña" />

                            <button :class="classPassword" @click="changeIconClassPass"></button>
                        </div>
                    </div>
                </div>

                <div class="load-container">
                    <div class="lds-dual-ring" v-if="busy"></div>
                </div>

                <div v-if="!disabled" class="button-container">
                    <button class="btn cancel" @click="cancel"><i class="fas fa-window-close mr-1"></i> Cancelar</button>
                    <button class="btn save" @click="saveProfile"><i class="fas fa-check-circle mr-1"></i> Guardar cambios</button>
                </div>
            </div>
        </div>

        <SuccessToast
            v-if="showSuccessToast"
            :textTitle="titleModal" />

        <FailToast 
            v-if="showFailToast"
            :textTitle="titleModal" />
    </div>
</template>

<script>
import SpotlighterNavigation from '../../../components/navs/SpotlighterNavigation'
import Loading from '../../../components/modals/Loading';
import Input from '../../../components/inputs/Input';
import InputIcon from '../../../components/inputs/InputIcon';
import SuccessToast from '../../../components/toasts/SuccessToast';
import FailToast from '../../../components/toasts/FailToast';

// var bcrypt = require('bcryptjs');

export default {
    components: {
        SpotlighterNavigation,
        Loading,
        Input,
        InputIcon,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            loading: false,
            busy: false,
            showSuccessToast: false,
            showFailToast: false,
            titleModal: '',

            userInfo: {},
            new_name: '',
            new_last_name: '',
            new_country: '',
            new_state: '',
            new_email: '',
            new_phone: '',
            new_university: '',
            new_account_number: '',
            password: '',
            disabled: true,

            universities: [],

            typePassword: 'password',
            classPassword: 'btn fas fa-eye-slash',
        }
    },
    async created() {
        if (process.browser){
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            
            this.universities = JSON.parse(localStorage.getItem('universities'))
        }

        await this.getUserInfo();
    }, 
    methods: {
        async getUserInfo() {
            try {
                this.loading = !this.loading;

                let userResponse = await this.$axios.get('/getMyInfo')
                this.userInfo = userResponse.data.payload;
                console.log(this.userInfo)
                
                this.new_name = this.userInfo.name
                this.new_last_name = this.userInfo.last_name
                this.new_country = this.userInfo.spotlighter_id.country
                this.new_state = this.userInfo.spotlighter_id.state
                this.new_email = this.userInfo.email
                this.new_phone = this.userInfo.spotlighter_id.phone
                this.new_account_number = this.userInfo.spotlighter_id.account_number
                this.new_university = this.universities.filter(uni => uni._id == this.userInfo.spotlighter_id.university_id)[0].name

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
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
        editProfile() {
            this.disabled = false;
            this.new_university = this.userInfo.spotlighter_id.university_id;
        },
        cancel() {
            this.disabled = true;
            // console.log(this.universities.filter(uni => uni._id == this.new_university)[0].name)
            this.new_university = this.universities.filter(uni => uni._id == this.new_university)[0].name
        },
        async saveProfile() {
            try {
                this.busy = !this.busy;

                let updateResponse = await this.$axios.put('/updateUser', {
                    user_id: this.userInfo._id,
                    name: this.new_name,
                    last_name: this.new_last_name,
                    country: this.new_country,
                    state: this.new_state,
                    email: this.new_email,
                    phone: this.new_phone,
                    university_id: this.new_university,
                    account_number: this.new_account_number,
                    password: this.new_password
                })
                console.log(updateResponse)
                alert(updateResponse.data.message);
                this.titleModal = updateResponse.data.message;
                this.showSuccessToast = !this.showSuccessToast;

                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                    this.busy = !this.busy;
                });

                this.$router.push({ path: '/myCases' })
            } catch (err) {
                console.log(err);
                this.busy = !this.busy;

                const response = err.response;
                this.titleModal = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        }
    }
}
</script>

<style scoped>
    .profile-container {
        display: flex;
        flex-direction: column;
        margin: 20px 40px;
        font-family: Montserrat;
    }

    .header-profile {
        display: flex;
        justify-content: space-between;
    }

    .header-profile a {
        color: #000;
        text-decoration: none;
    }

    .header-profile i {
        margin: 0px 8px;
    }

    .header-profile button {
        color: #1CA4FC;
    }

    .body-profile {
        display: flex;
        flex-direction: column;
        margin: 10px 80px;

    }

    .body-profile h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 32px;
        line-height: 39px;
        color: #000000;
    }

    hr {
        margin: 0;
        opacity: 1;
        border: 2px solid #000;
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
    
    .inp-cont {
        width: 100%;
        margin: 20px 40px;
    }

    .input {
        width: 100%;
        margin: 20px 40px;
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
        width: 100%;
        border: 0px;
        outline: 0px;
        border-bottom: 2px solid lightgray;
    }

    .inputs-pass {
        display: flex;
        align-items: flex-start;
        width: 90%;
    }

    .inp-cont-pass {
        display: flex;
        align-items: flex-end;
        width: 42%;
        margin: 0px 40px;
    }

    .disabled {
        border-bottom: 2px bold white;
    }

    .button-container {
        display: flex;
        justify-content: flex-end;
    }

    .cancel {
        padding: 12px 20px;
        background: #DB1212;
        color: #FFF;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 45px 40px;
    }

    .save {
        padding: 12px 20px;
        background: #20B000;
        color: #FFF;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 45px 40px;
    }

    /* estilos para el loading predeterminado */
    .load-container {
        display: flex;
        justify-content: center;
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