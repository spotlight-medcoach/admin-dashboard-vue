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
                        <div class="inp-cont">
                            <Input
                                type="text"
                                placeholder="País"
                                v-model="new_country"
                                :val="new_country"
                                title="País" />
                        </div>
                        <div class="inp-cont">
                            <Input
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
                        <div class="inp-cont">
                            <InputIcon
                                type="text"
                                placeholder="Universidad"
                                v-model="new_university"
                                :val="new_university"
                                icon="fas fa-university"
                                title="Universidad" />
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
                                type="text"
                                placeholder="• • • • • • • •"
                                v-model="new_password"
                                :val="new_password"
                                icon="fas fa-envelope"
                                title="Contraseña" />
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
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import InputIcon from '../../components/inputs/InputIcon';
import Input from '../../components/inputs/Input';
import Loading from '../../components/modals/Loading';
import SuccessButton from '../../components/buttons/SuccessButton';
import DeleteUserModal from '../../components/modals/DeleteUserModal';

export default {
    components: {
        Navigation,
        InputIcon,
        Input,
        Loading,
        SuccessButton,
        DeleteUserModal
    },
    data() {
        return {
            loading: false,
            busy: false,
            isShowModal: false,
            universities: [],
            titleModal: '',
            bodyModal: '',
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
            new_confirm_password: ''
        }
    },
    async created() {
        if (process.browser){
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
            this.universities = JSON.parse(localStorage.getItem('universities'))
        }
        
        await this.getUser();
        
        console.log(this.user_data)
    },
    methods: {
        async getUser() {
            try {
                this.loading = !this.loading;
                
                let user_response = await this.$axios.get(`/getOneAdminUser?user_id=${this.$route.params.id}`);
                let user_data = user_response.data.payload;
                this.user_data = user_data;
                this.setValueInputs();
    
                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        setValueInputs() {
            console.log('data', this.user_data)
            this.new_name = this.user_data.name
            this.new_last_name = this.user_data.last_name
            this.new_country = this.user_data.country
            this.new_state = this.user_data.state
            this.new_email = this.user_data.email
            this.new_phone = this.user_data.phone
            this.new_account_number = this.user_data.account_number
            let myUniversity = this.universities.filter(uni => uni._id == this.user_data.university_id)[0]
            console.log(myUniversity)
            this.new_university = myUniversity.name
        },
        async updateSpotlighter() {
            this.busy = !this.busy;
            var university_id = []
            if (process.browser) {
                let universities = JSON.parse(localStorage.getItem('universities'))
                university_id = universities.filter(uni => uni.name.toLowerCase() == this.new_university.toLowerCase())
            }

            university_id = university_id[0]._id

            let updated_response = await this.$axios.put('/updateUser', {
                user_id: this.user_data.admin_id,
                name: this.new_name,
                last_name: this.new_last_name,
                country: this.new_country,
                state: this.new_state,
                email: this.new_email,
                phone: this.new_phone,
                university_id: university_id,
                account_number: this.new_account_number,
                password: this.new_password
            });

            alert(updated_response.data.message);
            this.busy = !this.busy;

            setTimeout(() => {
                this.$router.push({ path: '/spotlighters' })
            }, 1000);
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
                
                setTimeout(() => {
                    this.$router.push({ path: '/spotlighters' })
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
        margin: 20px 40px;
    }

    .inp-cont-pass {
        display: flex;
        align-items: flex-start;
        width: 42%;
        margin: 0px 40px;
        /* margin-bottom: 40px; */
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