<template>
    <div>
        <Navigation />
        <div class="add-container">
            <div class="button-container">
                <nuxt-link to="/administratorsPages/administrators">
                    <i class="fas fa-chevron-left"></i>
                    Cancelar y volver
                </nuxt-link>
            </div>

            <Loading v-if="loading" />
            <div v-else class="form-container">
                <p class="title">Crear administrador</p>
                <hr>

                <div class="inputs">
                    <div class="int-cont">
                        <Input
                            type="text"
                            placeholder="Ingresa tu(s) nombre(s)"
                            v-model="name"
                            title="Nombre(s)" />
                    </div>
                    <div class="int-cont">
                        <Input
                            type="text"
                            placeholder="Ingresa tus apellidos"
                            v-model="last_name"
                            title="Apellidos" />
                    </div>
                </div>
                    
                <div class="inputs">
                    <div class="int-cont-email">
                        <InputIcon
                            type="email"
                            placeholder="example@example.com"
                            v-model="email"
                            icon="fas fa-envelope"
                            title="Correo electrónico" />
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

            <div class="load-container">
                <div class="lds-dual-ring" v-if="busy"></div>
            </div>

            <div class="btn-container">
                <SuccessButton
                    :text="'Agregar usuario'"
                    :click="addAdministrator"
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
import SuccessButton from '../../../components/buttons/SuccessButton';
import InputTitle from '../../../components/inputs/InputTitle';
import Input from '../../../components/inputs/Input';
import Loading from '../../../components/modals/Loading';
import InputIcon from '../../../components/inputs/InputIcon';
import SuccessToast from '../../../components/toasts/SuccessToast';
import FailToast from '../../../components/toasts/FailToast';

export default {
    components: {
        Navigation,
        SuccessButton,
        InputTitle,
        Input,
        Loading,
        InputIcon,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            busy: false,
            loading: true,
            showSuccessToast: false,
            showFailToast: false,
            titleToast: '',

            name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: '',
            typePassword: 'password',
            classPassword: 'btn fas fa-eye-slash',

            typeConfirm: 'password',
            classConfirm: 'btn fas fa-eye-slash',
        }
    },
    created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        this.loading = !this.loading
    },
    methods: {
        async addAdministrator() {
            try {
                this.busy = !this.busy;
    
                let add_response = await this.$axios.post('/createUser', {
                    name: this.name,
                    last_name: this.last_name,
                    email: this.email,
                    password: this.password,
                    role: 'Administrador'
                });
    
                this.busy = !this.busy;
    
                // alert(add_response.data.message);
                this.titleToast = add_response.data.message;
                this.showSuccessToast = !this.showSuccessToast;

                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                    this.$router.push({ path: '/administratorsPages/administrators' })
                }, 1500)
            } catch (err) {
                this.busy = !this.busy;
                console.log(err);
                const response = err.response;
                this.titleToast = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
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

    .button-container {
        margin-top: 1.5%;
        margin-left: 3%;
    }

    .button-container a {
        color: #000;
        text-decoration: none;
    }

    .form-container {
        display: flex;
        flex-direction: column;
        width: 85%;
        margin-top: 1%;
        margin-left: auto;
        margin-right: auto;
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

    .inputs {
        display: flex;
        flex-direction: row;
        justify-content:space-between;
        align-items: center;
        width: 100%;
    }

    .int-cont {
        width: 100%;
        margin: 40px 80px;
    }

    .password {
        display: flex;
        align-items: flex-end;
    }

    .int-cont-email {
        width: 36%;
        margin: 0px 80px;
    }

    .input-container {
        margin-left: auto;
        margin-right: auto;
        
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
        margin-top: 3%;
        margin-right: 10%;
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