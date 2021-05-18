<template>
    <div>
        <p class="title">Inicio de sesión</p>
        <div class="input-icon">
            <img src="/icons/email.png" alt="email">
            <input type="text" placeholder="Correo" v-model="user">
        </div>
        <div class="input-icon">
            <img src="/icons/password.png" alt="password">
            <input type="password" placeholder="Contraseña" v-model="password">
        </div>
        <div class="btn-login">
            <b-overlay
            :show="busy"
            rounded
            opacity="0.6"
            spinner-small
            spinner-variant="primary"
            class="d-inline-block" >
            <button @click="login">
                <span>Ingresar</span>
                <img src="/icons/white_hand.png" style="height: 28px;">
            </button>
            </b-overlay>
        </div>
        <div class="text-center link pointer" @click="goToRecoverPassword">Olvidé mi contraseña</div>
    </div>
</template>

<script>
    export default {
        name: 'new-login',
        data () {
            return {
                user: '',
                password: '',
                busy: false
            }
        },
        methods: {
            login () {
                this.busy = true
                this.$axios
                    .post('/students/login', {
                        email: this.user,
                        password: this.password // "12345678"
                    })
                    .then((res) => {
                        const userData = res.data.payload
                        if (userData.validated) {
                            if (process.client) {
                                localStorage.setItem('usertoken', res.data.token)
                                this.$store.commit('setToken', res.data.token)
                            }
                            if (res.data.payload.finished_diagnostic_test)
                                this.$router.push({ path: '/dashboard' })
                            else
                                this.$router.push({ path: '/diagnostic_test' })
                        } else {
                            this.$router.push({ name: 'welcome', query: { token: res.data.token } })
                            this.busy = false
                        }
                    })
                    .catch((err) => {
                        const response = err.response
                        this.$toastr.error(response.data.message, 'Error')
                        this.busy = false
                    })
            },
            goToRecoverPassword () {
                this.$store.commit('setLanding', 'recover_password')
            }
        }
    }
</script>