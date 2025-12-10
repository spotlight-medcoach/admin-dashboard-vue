<template>
    <div>
        <LoginNav />
        <div class="forgot-container">
            <div class="frame-container">
                <h2>Recuperar contraseña</h2>
                <span>Le enviaremos un email con un link para recuperar su contraseña</span>
                <div class="inp-container">
                    <i class="fas fa-envelope mr-2"></i>
                    <input v-model="email" type="email" placeholder="Correo">
                </div>

                <!-- Loader -->
                <div class="lds-dual-ring" v-if="busy"></div>

                <button class="btn login-button" @click="sendLink"><i class="fas fa-envelope mr-2"></i> Enviar</button>
                <button class="btn" @click="gotToLogin">Regresar al login</button>
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
import SuccessToast from '../components/toasts/success.toast.vue';
import FailToast from '../components/toasts/fail.toast.vue';

export default {
    components: {
        LoginNav,
        SuccessToast,
        FailToast
    },
    data() {
        return {
            email: '',
            busy: false,
            showSuccessToast: false,
            showFailToast: false,
            titleToast: ''
        }
    },
    methods: {
        async sendLink() {
            try {
                this.busy = !this.busy;

                let forgotResponse = await this.$axios.post(`/forgotPassword?email=${this.email}`);

                this.titleToast = forgotResponse.data.message;
                this.showSuccessToast = !this.showSuccessToast;

                setTimeout(() => {
                    this.showSuccessToast = !this.showSuccessToast;
                    this.busy = !this.busy;
                    // this.$router.push({ path: '/reset_password' });
                }, 2000);
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
        gotToLogin() {
            this.$router.push({ path: '/' });
        }
    }
}
</script>

<style scoped>
    .forgot-container {
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

    .frame-container span {
        margin: 20px 20px;
        text-align: center;
    }

    .frame-container input {
        border: none;
        outline: none;
    }

    .inp-container {
        margin-top: .5rem;
        background-color:transparent;
        border: 0px solid;
        height: 30px;
        width: 80%;
        border-bottom: 2px solid lightgray;
        font-family: Montserrat;
        margin-bottom: 30px;
    }

    .inp-container i {
        color: #9D9D9D;
    }

    input:focus {
        outline: none;
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