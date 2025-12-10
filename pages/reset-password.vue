<template>
    <div>
        <LoginNav />
        <div class="restar-container">
            <div class="frame-container">
                <h2>Restablecer contraseña</h2>
                <span>Ingresa tu nueva contraseña</span>

                <div class="input-container">
                    <InputIcon
                        :type="typePassword"
                        placeholder="• • • • • • • •"
                        v-model="password"
                        icon="fas fa-lock"
                        title="Contraseña" />

                    <button :class="classPassword" @click="changeIconClassPass"></button>
                </div>

                <div class="input-container">
                    <InputIcon
                        :type="typeConfirm"
                        placeholder="• • • • • • • •"
                        v-model="confirm_password"
                        icon="fas fa-lock"
                        title="Confirmar contraseña" />

                    <button :class="classConfirm" @click="changeIconClassConf"></button>
                </div>

                <!-- Loader -->
                <div class="lds-dual-ring" v-if="busy"></div>

                <button class="btn login-button" @click="resetPassword">Cambiar contraseña</button>
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
import LoginNav from '../components/navs/login.nav.vue';
import InputIcon from '../components/inputs/input-icon.vue';
import SuccessToast from '../components/toasts/success.toast.vue';
import FailToast from '../components/toasts/fail.toast.vue';

export default {
    components: {
        LoginNav,
        InputIcon,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            busy: false,
            showSuccessToast: false,
            showFailToast: false,
            titleToast: '',

            password: '',
            confirm_password: '',

            typePassword: 'password',
            classPassword: 'btn fas fa-eye-slash',

            typeConfirm: 'password',
            classConfirm: 'btn fas fa-eye-slash',
        }
    },
    methods: {
        async resetPassword() {
            try {
                if (this.validatePasswords()) {
                    this.busy = !this.busy;

                    const body = {
                        token: this.$route.query.token,
                        password: this.password,
                    }

                    let passwordResponse = await this.$axios.put('/resetPassword', body);
                    
                    this.titleToast = passwordResponse.data.message;
                    this.showSuccessToast =! this.showSuccessToast;

                    setTimeout(() => {
                        this.showSuccessToast =! this.showSuccessToast;
                        this.busy = !this.busy;
                        this.$router.push({ path: '/' });
                    }, 2000)
                }
            } catch (err) {
                this.busy = !this.busy;

                const response = err.response;
                this.titleToast = response.data.message;
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
            }
        },
        validatePasswords () {
            const password = this.password.trim()
            const confirmPassword = this.confirm_password.trim()

            if (password === '') {
                this.titleToast = 'Debe ingresar su nueva contraseña';
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
                
                return false
            }
            if (confirmPassword === '') {
                this.titleToast = 'Debe confirmar su nueva contraseña'
                this.showFailToast = !this.showFailToast;

                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
                
                return false
            }
            if (password !== confirmPassword) {
                this.titleToast = 'Las contraseñas no coinciden'
                this.showFailToast = !this.showFailToast;
                
                setTimeout(() => {
                    this.showFailToast = !this.showFailToast;
                }, 1);
                return false
            }

            return true
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
    .restar-container {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(#1D2B48, #85A5DB);
        height: 93.8vh;
        font-family: Montserrat;
    }

    .frame-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 35%;
        margin: 40px;
        padding: 40px;
        background: #FFFFFF;
        box-shadow: 0px 0px 40px rgba(29, 43, 72, 0.5);
        border-radius: 20px;
    }

    .frame-container h2 {
        font-weight: bold;
    }

    .input-container {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        margin: 20px 0px;
        padding: 20px, 0px;
        width: 80%;
    }

    .login-button {
        margin: 1rem;
        width: 80%;
        background: #FE9400;
        color: #FFF;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
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