<template>
  <div>
    <div class="profile-container">
      <div class="header-profile">
        <nuxt-link to="/administrators">
          <i class="fas fa-chevron-left"></i>
          Salir de perfil
        </nuxt-link>

        <button v-if="disabled" class="btn" @click="editProfile">
          <i class="fas fa-pencil-alt"></i> Edital perfil
        </button>
      </div>

      <Loading v-if="loading" />
      <div v-else class="body-profile">
        <h1>Configurar perfil</h1>
        <hr />

        <div class="inputs">
          <div class="int-cont">
            <Input
              :dis="disabled"
              type="text"
              placeholder="Ingresa tu(s) nombre(s)"
              v-model="name"
              :val="name"
              title="Nombre(s)"
            />
          </div>
          <div class="int-cont">
            <Input
              :dis="disabled"
              type="text"
              placeholder="Ingresa tus apellidos"
              v-model="last_name"
              :val="last_name"
              title="Apellidos"
            />
          </div>
        </div>

        <div class="inputs">
          <div class="int-cont-email">
            <InputIcon
              :dis="disabled"
              type="text"
              placeholder="example@example.com"
              v-model="email"
              :val="email"
              icon="fas fa-envelope"
              title="Correo electrónico"
            />
          </div>
        </div>

        <div class="inputs">
          <div class="int-cont-pass">
            <div class="password">
              <InputIcon
                :dis="disabled"
                :type="typePassword"
                placeholder="• • • • • • • •"
                v-model="password"
                icon="fas fa-lock"
                title="Contraseña"
              />

              <button
                :class="classPassword"
                @click="changeIconClassPass"
              ></button>
            </div>
          </div>

          <!-- <div class="int-cont">
                        <div class="password">
                            <InputIcon
                                :type="typeConfirm"
                                placeholder="• • • • • • • •"
                                v-model="confirm_password"
                                icon="fas fa-lock"
                                title="Confirmar contraseña" />
                            <button :class="classConfirm" @click="changeIconClassConf"></button>
                        </div>
                    </div> -->
        </div>

        <div class="load-container">
          <div class="lds-dual-ring" v-if="busy"></div>
        </div>

        <div v-if="!disabled" class="button-container">
          <button class="btn cancel" @click="cancel">
            <i class="fas fa-window-close mr-1"></i> Cancelar
          </button>
          <button class="btn save" @click="saveProfile">
            <i class="fas fa-check-circle"></i> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from '@/components/modals/loading.modal.vue';
import Input from '@/components/inputs/input.vue';
import InputIcon from '@/components/inputs/input-icon.vue';

// var bcrypt = require('bcryptjs');

export default {
  components: {
    Loading,
    Input,
    InputIcon,
  },
  data() {
    return {
      loading: false,
      busy: false,

      userInfo: {},
      name: '',
      last_name: '',
      email: '',
      password: '',
      disabled: true,

      universities: [],

      typePassword: 'password',
      classPassword: 'btn fas fa-eye',
    };
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;

      this.universities = JSON.parse(localStorage.getItem('universities'));
    }

    await this.getUserInfo();
  },
  methods: {
    async getUserInfo() {
      try {
        this.loading = !this.loading;

        let userResponse = await this.$axios.get('/getMyInfo');
        this.userInfo = userResponse.data.payload;
        console.log(this.userInfo);

        this.name = this.userInfo.name;
        this.last_name = this.userInfo.last_name;
        this.email = this.userInfo.email;

        this.loading = !this.loading;
      } catch (err) {
        console.log(err);
      }
    },
    changeIconClassPass() {
      if (this.typePassword == 'password') {
        this.typePassword = 'text';
        this.classPassword = 'btn fas fa-eye-slash';
      } else if (this.typePassword == 'text') {
        this.typePassword = 'password';
        this.classPassword = 'btn fas fa-eye';
      }
    },
    editProfile() {
      this.disabled = false;
    },
    cancel() {
      this.disabled = true;
    },
    async saveProfile() {
      try {
        this.busy = !this.busy;

        let updateResponse = await this.$axios.put('/updateUser', {
          user_id: this.userInfo._id,
          name: this.name,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
        });
        console.log(updateResponse);
        alert(updateResponse.data.message);

        this.busy = !this.busy;

        this.$router.push({ path: '/administrators' });
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: Montserrat;
}

.header-profile {
  display: flex;
  justify-content: space-between;
}

.header-profile a {
  color: #000;
  text-decoration: none;
}

.header-profile i {
  margin: 0px 8px;
}

.header-profile button {
  color: #1ca4fc;
}

.body-profile {
  display: flex;
  flex-direction: column;
  width: 85%;
  margin-top: 1%;
  margin-left: auto;
  margin-right: auto;
}

.body-profile h1 {
  font-style: normal;
  font-weight: bold;
  font-size: 32px;
  line-height: 39px;
  color: #000000;
}

hr {
  margin: 0;
  opacity: 1;
  border: 2px solid #000;
}

.inputs-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.inputs {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.int-cont {
  width: 100%;
  margin: 40px 80px;
}

.password {
  display: flex;
  align-items: flex-end;
}

.int-cont-email {
  width: 36%;
  margin: 0px 80px;
}

.int-cont-pass {
  width: 36%;
  margin: 30px 80px;
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

.inputs-pass {
  display: flex;
  align-items: flex-start;
  width: 90%;
}

.inp-cont-pass {
  display: flex;
  align-items: flex-end;
  width: 42%;
  margin: 0px 40px;
}

.disabled {
  border-bottom: 2px bold white;
}

.button-container {
  display: flex;
  justify-content: flex-end;
}

.cancel {
  padding: 12px 20px;
  background: #db1212;
  color: #fff;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;
  margin: 45px 40px;
}

.save {
  padding: 12px 20px;
  background: #20b000;
  color: #fff;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;
  margin: 45px 40px;
}

/* .button-container button {
        padding: 12px 20px;
        background: #20B000;
        color: #FFF;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 45px 40px;
    } */

/* estilos para el loading predeterminado */
.load-container {
  display: flex;
  justify-content: center;
}

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
  /* margin: 8px; */
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
