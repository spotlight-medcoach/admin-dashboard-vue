<template>
    <div>
        <Navigation />
        <div class="add-container">
            <div class="button-container">
                <nuxt-link to="/spotlighters">
                    <i class="fas fa-chevron-left"></i>
                    Cancelar y volver
                </nuxt-link>
                <button class="btn" @click="confirmModal"><i class="fas fa-trash"></i> Eliminar usuario</button>
            </div>

            <Loading v-if="loading" />
            <div v-else class="form-container">
                <h1>Editar administrador</h1>
                <hr>

                <div class="inputs">
                    <div class="input-container">
                        <InputTitle 
                            icon=""
                            title="Nombre(s)" />
                        <Input
                            type="text"
                            placeholder="Ingresa tu(s) nombre(s)"
                            v-model="new_name" />
                            <!-- :newValue="user_data.name" -->
                    </div>
                    <div class="input-container">
                        <InputTitle 
                            icon=""
                            title="Apellidos" />
                        <Input
                            type="text"
                            placeholder="Ingresa tus apellidos"
                            v-model="new_last_name" />
                            <!-- :newValue="user_data.last_name" -->
                    </div>
                </div>

                <div class="inputs">
                    <div class="input-container">
                        <InputTitle 
                            icon="fas fa-user-circle"
                            title="Correo electrónico" />
                        <Input
                            type="text"
                            placeholder="example@hotmail.com"
                            v-model="new_email" />
                            <!-- :newValue="user_data.email" -->
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
                                v-model="new_password" />
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
                    :text="'Guardar cambios'"
                    :click="updateAdministrator"
                    :new_class="'btn'"
                    :i_class="'fas fa-save'"
                />
            </div>

            <ModalConfirm 
                v-if="isShowModal"
                @close="closeModal"
                :textTitle="titleModal"
                :textBody="bodyModal"
                :deleteUser="deleteUser" />
        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';
import InputTitle from '../../components/inputs/InputTitle';
import Input from '../../components/inputs/Input';
import SuccessButton from '../../components/buttons/SuccessButton';
import ModalConfirm from '../../components/modals/ModalConfirm';

export default {
    components: {
        Navigation,
        Loading,
        InputTitle,
        Input,
        SuccessButton,
        ModalConfirm
    },
    data() {
        return {
            loading: true,
            busy: false,
            isShowModal: false,
            user_data: {},
            new_name: '',
            new_last_name: '',
            new_email: '',
            new_password: '',
            titleModal: '',
            bodyModal: ''
        }
    },
    async created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        
        await this.getUser();
        this.setValueInput()
        this.loading = !this.loading;
    },
    methods: {
        async getUser() {
            try {
                let user_response = await this.$axios.get(`/getOneAdminUser?user_id=${this.$route.params.id}`);
                let user_data = user_response.data.payload;
                this.user_data = user_data;
                console.log(user_data)
            } catch (err) {
                console.log(err);
            }
        },
        setValueInput() {
            this.new_name = this.user_data.name
            this.new_last_name = this.user_data.last_name
            this.new_email = this.user_data.email
        },
        async updateAdministrator() {
            try {
                this.busy = !this.busy
                let updated_response = await this.$axios.put('/updateUser', {
                    user_id: this.user_data.admin_id,
                    name: this.new_name,
                    last_name: this.new_last_name,
                    email: this.new_email
                });

                this.busy = !this.busy
                this.bodyModal = updated_response.data.message;
                setTimeout(() => {
                    this.$router.push({ path: '/administrators' })
                    // this.isShowModal = !this.isShowModal;
                }, 1000);
                // console.log(updated_response)
            } catch (err) {
                console.log(err)
            }
        },
        confirmModal() {
            this.bodyModal = 'Eliminar usuario.';
            this.bodyModal = "¿Deseas eliminar el siguiente usuario?\n" + this.user_data.name + " " + this.user_data.last_name
            this.isShowModal = !this.isShowModal;
        },
        async deleteUser() {
            try {
                let inactive_response = await this.$axios.put('/setInactiveUser', { user_id: this.$route.params.id });
                console.log(inactive_response);
                
                // this.bodyModal = 'Eliminado'
                // this.isShowModal = !this.isShowModal;
                setTimeout(() => {
                    this.$router.push({ path: '/administrators' })
                    this.isShowModal = !this.isShowModal;
                }, 1500);
            } catch (err) {
                console.log(err);
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
        margin-top: 1.5%;
        margin-left: 3%;
    }

    .button-container button {
        color: #DB1212;
        margin-right: 5%;
    }

    h1 {
        margin-bottom: 0;
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