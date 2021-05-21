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

                <div class="inputs">
                    <div class="input-container">
                        <InputTitle
                            icon=""
                            title="País"
                        />
                        <select name="" id="">
                            <option value="1">País1</option>
                            <option value="2">País2</option>
                            <option value="3">País3</option>
                        </select>
                    </div>
                    <div class="input-container">
                        <InputTitle
                            icon=""
                            title="Estado"
                        />
                        <select name="" id="">
                            <option value="1">Estado1</option>
                            <option value="2">Estado2</option>
                            <option value="3">Estado3</option>
                        </select>
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
                            v-model="email" />
                    </div>
                    <div class="input-container">
                        <InputTitle 
                            icon="fas fa-mobile-alt"
                            title="Teléfono" />
                        <Input
                            type="text"
                            placeholder="3411228534"
                            v-model="phone" />
                    </div>
                </div>

                <div class="inputs">
                    <div class="input-container">
                        <InputTitle 
                            icon="fas fa-university"
                            title="Universidad" />
                        <Input
                            type="text"
                            placeholder="Universidad"
                            v-model="university" />
                    </div>
                    <div class="input-container">
                        <InputTitle 
                            icon="fas fa-credit-card"
                            title="Número de cuenta" />
                        <Input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            v-model="account_number" />
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
import InputTitle from '../../components/inputs/InputTitle';
import Input from '../../components/inputs/Input';
import SuccessButton from '../../components/buttons/SuccessButton';

export default {
    components: {
        Navigation,
        InputTitle,
        Input,
        SuccessButton
    },
    data() {
        return {
            email: '',
            phone: '',
            university: '',
            account_number: '',
            password: '',
            confirm_password: ''
        }
    },
    created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
    },
    methods: {
        addSpotlighter() {
            if (process.browser) {
                this.$axios
                .post('/createUser', {
                    name: this.name,
                    last_name: this.last_name,
                    email: this.email,
                    password: this.password,
                    role: 'Spotlighter'
                    
                })
                .then(res => {
                    console.log(res);
                    alert('Everithing okay ', res)
                })
                .catch(err => {
                    console.log(err)
                    alert('Error: ', err)
                })
            }
        }
    }
}
</script>

<style>

</style>