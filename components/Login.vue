<template>
  <div class="cont">
    <div class="frame-container">
      <h2 class="login-title">Iniciar sesión</h2>

      <div class="input-container">
        <InputIcon
          type="text"
          placeholder="example@example.com"
          v-model="email"
          icon="fas fa-user-circle"
          title="Correo electrónico"
        />
      </div>

      <div class="input-container">
        <InputIcon
          type="password"
          placeholder="• • • • • • • •"
          v-model="password"
          icon="fas fa-lock"
          title="Contraseña"
        />
      </div>

      <div class="check-container">
        <input v-model="checked" class="" type="checkbox" />
        <label>Recordarme</label>
      </div>

      <!-- Loader -->
      <div class="lds-dual-ring" v-if="busy"></div>

      <div class="buttons">
        <button type="button" class="btn login-button" @click="login">
          <i class="fas fa-sign-in-alt"></i>
          Iniciar sesión
        </button>
        <button type="button" class="btn forgot-button" @click="forgotPassword">
          Olvidé mi contraseña
        </button>
      </div>
    </div>

    <SuccessToast v-if="showSuccessToast" :textTitle="titleToast" />

    <FailToast v-if="showFailToast" :textTitle="titleToast" />
  </div>
</template>

<script>
import InputIcon from '@/components/inputs/input-icon.vue';
import SuccessToast from '@/components/toasts/success.toast.vue';
import FailToast from '@/components/toasts/fail.toast.vue';

export default {
  components: {
    InputIcon,
    SuccessToast,
    FailToast,
  },
  data() {
    return {
      showSuccessToast: false,
      showFailToast: false,
      titleModal: '',
      titleToast: '',

      userData: {},
      checked: false,
      email: '',
      password: '',
      busy: false,
      isShowModal: false,
      modalTitle: '',
      modalBody: '',
    };
  },
  created() {
    if (process.browser) {
      if (
        localStorage.getItem('remember_me') &&
        localStorage.getItem('user_token')
      ) {
        let userInfo = JSON.parse(localStorage.getItem('user'));

        if (userInfo.role == 'Administrador')
          this.$router.push({ path: '/statistics' });
        else
          this.$router.push({ path: '/spotlightersPages/requestedQuestions' });
      } else {
        if (localStorage.getItem('user')) {
          console.log('login again');
          this.titleToast = 'Token no valido, inicia sesión de nuevo';
          this.showSuccessToast = !this.showSuccessToast;
          setTimeout(() => {
            this.showSuccessToast = !this.showSuccessToast;
          }, 2500);
        }
      }
    }
  },
  methods: {
    async login() {
      try {
        this.busy = !this.busy;

        let loginResponse = await this.$axios.post('/auth/login', {
          email: this.email,
          password: this.password,
        });

        let data = loginResponse.data.payload;
        this.userData = data;

        if (process.browser) {
          // Almacenamos en localStorage el token e información del usuario
          localStorage.setItem('user', JSON.stringify(this.userData));
          localStorage.setItem('user_token', loginResponse.data.token);
          localStorage.setItem('remember_me', this.checked);
          this.$store.commit('setUserInfo', loginResponse.data.payload);
          this.$store.commit('setToken', loginResponse.data.token);
          this.$store.commit('setRememberMe', this.checked);
        }

        this.titleToast = loginResponse.data.message;
        this.showSuccessToast = !this.showSuccessToast;
        this.busy = !this.busy;

        setTimeout(() => {
          if (this.userData.role == 'Administrador') {
            this.$router.push({ path: '/statistics' });
            this.showSuccessToast = !this.showSuccessToast;
          } else {
            this.$router.push({
              path: '/spotlightersPages/requestedQuestions',
            });
            this.showSuccessToast = !this.showSuccessToast;
          }
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
    forgotPassword() {
      this.$router.push({ path: '/forgot-password' });
    },
    closeModal() {
      this.isShowModal = !this.isShowModal;
    },
  },
};
</script>

<style scoped>
.cont {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(#1d2b48, #85a5db);
  height: 93.8vh;
}

.frame-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 35%;
  margin: 40px;
  background: #ffffff;
  box-shadow: 0px 0px 40px rgba(29, 43, 72, 0.5);
  border-radius: 20px;
}

.login-title {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 750;
  font-size: 40px;
  line-height: 58px;
  color: #fe9400;
  margin: 20px 0px;
}

.input-container {
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
  padding: 20px, 0px;
  width: 80%;
}

.check-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 15px;
}

.check-container input {
  position: static;
  width: 18px;
  height: 18px;
  order: 0;
  flex-grow: 0;
  margin: 0px 4px;
}

.check-container label {
  position: static;
  height: 19px;
  margin-bottom: 0;
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
  background: #fe9400;
  color: #fff;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;
}

.forgot-button {
  color: #fe9400;
  margin: 1rem;
  border-radius: 22px;
}

/* estilos para el loading predeterminado */
.lds-dual-ring {
  display: inline-block;
  width: 50px;
  height: 50px;
}

.lds-dual-ring:after {
  content: ' ';
  display: block;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 6px solid #fe9400;
  border-color: #fe9400 transparent #fe9400 transparent;
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
