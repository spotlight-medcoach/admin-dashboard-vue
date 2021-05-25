<template>
    <div>
        <Navigation />
        <div class="add-container">
            <div class="button-container">
                <nuxt-link to="/administrators">
                    <i class="fas fa-chevron-left"></i>
                    Cancelar y volver
                </nuxt-link>
            </div>

            <div class="form-container">
                <h1>Crear administrador</h1>

                <div class="inputs">
                    <div class="input-container">
                        <InputTitle 
                            icon=""
                            title="Nombre(s)" />
                        <Input
                            type="text"
                            placeholder="Ingresa tu(s) nombre(s)"
                            v-model="name" />
                    </div>
                    <div class="input-container">
                        <InputTitle 
                            icon=""
                            title="Apellidos" />
                        <Input
                            type="text"
                            placeholder="Ingresa tus apellidos"
                            v-model="last_name" />
                    </div>
                </div>

                <div class="inputs-email">
                    <div class="input-container-email">
                        <InputTitle 
                            icon="fas fa-user-circle"
                            title="Correo electrónico" />
                        <Input
                            type="text"
                            placeholder="example@hotmail.com"
                            v-model="email" />
                    </div>
                </div>

                <div class="inputs">
                    <div class="input-container">
                        <InputTitle 
                            icon="fas fa-envelope"
                            title="Contraseña" />
                        
                        <div>
                            <Input
                                type="password"
                                placeholder="• • • • • • • •"
                                v-model="password" />
                            <i class="fas fa-eye"></i>
                        </div>
                    </div>

                    <div class="input-container">
                        <InputTitle 
                            icon="fas fa-user-circle"
                            title="Confirmar contraseña" />
                        <div>
                            <Input
                                type="password"
                                placeholder="• • • • • • • •"
                                v-model="confirm_password" />
                            <i class="fas fa-eye"></i>
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

            <ModalConfirm v-if="isShowModal" @close="closeModal" :textBody="textModal" :textTitle="textTile" />
        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import SuccessButton from '../../components/buttons/SuccessButton';
import InputTitle from '../../components/inputs/InputTitle';
import Input from '../../components/inputs/Input';
import ModalConfirm from '../../components/modals/ModalConfirm';

export default {
    components: {
        Navigation,
        SuccessButton,
        InputTitle,
        Input,
        ModalConfirm
    },
    data() {
        return {
            busy: false,
            isShowModal: false,
            textModal: '',
            textTitle: '',
            name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: ''
        }
    },
    created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
    },
    methods: {
        async addAdministrator() {
            this.busy = !this.busy;

            let add_response = await this.$axios.post('/createUser', {
                name: this.name,
                last_name: this.last_name,
                email: this.email,
                password: this.password,
                role: 'Administrador'
            });

            this.busy = !this.busy;
            this.isShowModal = !this.isShowModal;
            this.textTitle = 'Administradores'
            this.textModal = add_response.data.message
            setTimeout(() => {
                this.$router.push({ path: '/administrators' })
                this.isShowModal = !this.isShowModal;
            }, 1500);
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
        width: 80%;
        margin-top: 1%;
        margin-left: auto;
        margin-right: auto;
    }

    .inputs {
        display: flex;
        flex-direction: row;
        justify-content:center;
        align-items: center;
        width: 80%;
        margin-left: auto;
        margin-right: auto;
        margin-top: 2%;
        margin-bottom: 2%;
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

    /* .add-admi {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        background: #FFFFFF;
        box-shadow: 0px 0px 40px rgba(29, 43, 72, 0.5);
        border-radius: 20px;
    }

    .add-admi-title {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        height: 41px;
        background: red;
    }

    .inputs-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }

    .input-container {
        display: flex;
        flex-direction: column;
        margin: 20px 0px;
        padding: 20px, 0px;
    } */

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