<template>
    <div>
        <Navigation />
        <div class="add-container">
            <div class="button-container">
                <nuxt-link to="/spotlighters">
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
                        <div class="int-cont">
                            <Input
                                type="text"
                                placeholder="País"
                                v-model="country"
                                title="País" />
                        </div>
                        <div class="int-cont">
                            <Input
                                type="text"
                                placeholder="Estados"
                                v-model="state"
                                title="Estado" />
                        </div>
                    </div>

                    <div class="inputs">
                        <div class="int-cont">
                            <InputIcon
                                type="text"
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
                            <InputIcon
                                type="text"
                                placeholder="Universidad"
                                v-model="university"
                                icon="fas fa-university"
                                title="Universidad" />
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
                            <InputIcon
                                type="password"
                                placeholder="• • • • • • • •"
                                v-model="password"
                                icon="fas fa-envelope"
                                title="Contraseña" />
                        </div>
                        <div class="int-cont">
                            <InputIcon
                                type="password"
                                placeholder="• • • • • • • •"
                                v-model="confirm_password"
                                icon="fas fa-envelope"
                                title="Confirmar contraseña" />
                        </div>
                    </div>

                </div>
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
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import InputIcon from '../../components/inputs/InputIcon';
import Input from '../../components/inputs/Input';
import SuccessButton from '../../components/buttons/SuccessButton';

export default {
    components: {
        Navigation,
        InputIcon,
        Input,
        SuccessButton
    },
    data() {
        return {
            name: '',
            last_name: '',
            email: '',
            phone: '',
            country: '',
            state: '',
            university: '',
            account_number: '',
            password: '',
            confirm_password: ''
        }
    },
    async created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
    },
    methods: {
        async addSpotlighter() {
            if (process.browser) {
                // verificar que la universidad exista en la lista
                let universities = JSON.parse(localStorage.getItem('universities'));
                let university_filtered = universities.filter(uni => uni.name.toLowerCase() == this.university.toLowerCase());
                
                let data = {
                    name: this.name,
                    last_name: this.last_name,
                    email: this.email,
                    password: this.password,
                    role: 'Spotlighter',
                    phone: this.phone,
                    account_number: this.account_number,
                    country: 'this.country',
                    state: 'this.state',
                    university_id: university_filtered[0]._id
                }

                console.log('data: ', data)

                let add_response = await this.$axios.post('/createUser', data);
                console.log('response: ', add_response);
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

    .int-cont {
        width: 100%;
        margin: 10px 40px;
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
</style>