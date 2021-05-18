<template>
    <div class="container d-flex justify-content-center form">
        <form class="fo my-5 p-5" v-on:submit.prevent>
            <div class="form-group">
                <label for="exampleInputEmail1">Email address</label>
                <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" v-model="email">
            </div>
            <div class="form-group">
                <label for="exampleInputPassword1">Password</label>
                <input type="password" class="form-control" id="exampleInputPassword1 ex3" placeholder="Password" v-model="password">
            </div>
            
            <button class="btn btn-primary mb-2" @click="login">Submit</button>

            <div
                class="lds-dual-ring mt-2"
                v-if="busy" >
            </div>

            <ModalConfirm v-if="isShowModal" @close="closeModal" :text="textModal" />
        </form>
    </div>
</template>

<script>
import ModalConfirm from './ModalConfirm';

export default {
    components: {
        ModalConfirm
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
            
            // if (this.email == '') {
            //     alert('Ingresa correo');
            //     this.busy = false
            //     return
            // } else if (this.password == '') {
            //     alert('Ingresa contraseña');
            //     this.busy = false
            //     return
            // } else if (this.email == '' || this.password == '') {
            //     alert('Ingresa correo y contraseña');
            //     this.busy = false
            //     return
            // }

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

<style>
    .fo{
        background: whitesmoke;
    }

    .lds-dual-ring {
        display: inline-block;
        width: 80px;
        height: 80px;
    }

    .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 64px;
        height: 64px;
        margin: 8px;
        border-radius: 50%;
        border: 6px solid #fff;
        border-color: #fff transparent #fff transparent;
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