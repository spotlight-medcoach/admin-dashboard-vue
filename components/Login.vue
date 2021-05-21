<template>
    <div class="cont">
        <div class="frame-container">
            <h2 class="login-title">Iniciar sesión</h2>

            <div class="input-container">
                <InputTitle 
                    icon="fas fa-user-circle"
                    title="Correo electrónico" />
                <Input
                    type="text"
                    placeholder="example@hotmail.com"
                    v-model="email" />
            </div>

            <div class="input-container">
                <InputTitle 
                    icon="fas fa-lock"
                    title="Contraseña" />
                <Input
                    type="password"
                    placeholder="• • • • • • • •"
                    v-model="password" />
            </div>

            <div class="check">
                <input class="" type="checkbox">
                <label>Recordarme</label>
            </div>
            
            <div class="lds-dual-ring" v-if="busy"></div>

            <div class="buttons">
                <button type="button" class="btn login-button" @click="login">
                    <i class="fas fa-sign-in-alt"></i>
                    Iniciar sesión
                </button>
                <button type="button" class="btn forgot-button">Olvidé mi contraseña</button>
            </div>
            
            <ModalConfirm v-if="isShowModal" @close="closeModal" :text="textModal" />
        </div>
    </div>
</template>

<script>
import ModalConfirm from './modals/ModalConfirm';
import InputTitle from './inputs/InputTitle';
import Input from './inputs/Input';

export default {
    components: {
        ModalConfirm,
        InputTitle,
        Input
    },
    data() {
        return {
            email: '',
            password: '',
            busy: false,
            isShowModal: false,
            textModal: ''
        }
    },
    methods: {
        login() {
            this.busy = true

            this.$axios
            .post('/userLogin', {
                email: this.email,
                password: this.password
            })
            .then(res => {
                // console.log(res);
                let userData = res.data.payload;
                this.isShowModal = !this.isShowModal;
                this.textModal = res.data.message

                if (process.client) {
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('user_token', res.data.token);
                    this.$store.commit('setUserInfo', res.data.payload);
                    this.$store.commit('setToken', res.data.token);
                    // console.log(res);
                    this.busy = false;

                    setTimeout(() => {
                        this.$router.push({ path: '/statistics' })
                        this.isShowModal = !this.isShowModal;
                    }, 1000);
                }
            })
            .catch(err => {
                this.isShowModal = !this.isShowModal;
                this.textModal = err.response.data.message;
                const response = err.response;
                console.log('Error: ', response.data.message);
                // alert(response.data.message);
                this.busy = false;
            });
        },
        closeModal() {
            this.isShowModal = !this.isShowModal;
        }
    }
}
</script>

<style scoped>
    .cont {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(#1D2B48, #85A5DB);
        height: 100%;
        /* padding-bottom: 3%; */
    }

    .frame-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 35%;
        height: 100%;
        margin: 40px;

        background: #FFFFFF;
        box-shadow: 0px 0px 40px rgba(29, 43, 72, 0.5);
        border-radius: 20px;
    }

    .login-title {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 750;
        font-size: 40px;
        line-height: 58px;
        color: #FE9400;
        margin: 20px 0px;
    }

    .input-container {
        display: flex;
        flex-direction: column;
        margin: 20px 0px;
        padding: 20px, 0px;
    }

    /* .input-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #1CA4FC;
    }

    .input-title i {
        font-size: 24px;
        margin: 0px 8px;
    }

    .input-title h3 {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 550;
        font-size: 20px;
        margin-bottom: 0;
    }

    input {
        margin-left: 2.5rem;
        margin-top: .5rem;
        background-color:transparent;
        border: 0px solid;
        height:30px;
        width:260px;
        border-bottom: 2px solid lightgray;
        font-family: Montserrat;
    }

    input:focus {
        outline: none;
    } */

    .check {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 15px;
    }

    .check input {
        position: static;
        width: 18px;
        height: 18px;
        order: 0;
        flex-grow: 0;
        margin: 0px 4px;
    }

    .check label {
        position: static;
        width: 88px;
        height: 19px;
        font-family: Montserrat;
        font-size: 16px;
        display: flex;
        align-items: center;
        color: #212529;
    }

    .buttons {
        display: flex;
        flex-direction: column;
        width: 70%;
        font-family: Montserrat;
    }

    .login-button {
        margin: 1rem;
        background: #FE9400;
        color: #FFF;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
    }

    .forgot-button {
        color: #FE9400;
        margin: 1rem;
        border-radius: 22px;
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