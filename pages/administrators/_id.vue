<template>
  <div>
    <Navigation />
    <div class="add-container">
      <div class="button-container">
        <nuxt-link to="/administrators">
          <i class="fas fa-chevron-left"></i>
          Cancelar y volver
        </nuxt-link>
        <button v-if="!loading" class="btn" @click="confirmModal">
          <i class="fas fa-trash"></i> Eliminar usuario
        </button>
      </div>

      <Loading v-if="loading" />
      <div v-else class="form-container">
        <p class="title">Editar administrador</p>
        <hr />

        <div class="inputs">
          <div class="int-cont">
            <Input
              type="text"
              placeholder="Nombre"
              v-model="new_name"
              :val="new_name"
              title="Nombre(s)"
            />
          </div>
          <div class="int-cont">
            <Input
              type="text"
              placeholder="Apellidos"
              v-model="new_last_name"
              :val="new_last_name"
              title="Apellidos"
            />
          </div>
        </div>

        <div class="inputs">
          <div class="int-cont-email">
            <InputIcon
              type="email"
              placeholder="example@example.com"
              v-model="new_email"
              :val="new_email"
              icon="fas fa-user-circle"
              title="Correo electrónico"
            />
          </div>
        </div>

        <div class="inputs">
          <div class="int-cont-email">
            <div class="password">
              <InputIcon
                :type="typePassword"
                placeholder="• • • • • • • •"
                v-model="new_password"
                icon="fas fa-lock"
                title="Contraseña"
              />

              <button
                :class="classPassword"
                @click="changeIconClassPass"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <div class="load-container">
        <div class="lds-dual-ring" v-if="busy"></div>
      </div>
      <div v-if="!loading" class="btn-container">
        <SuccessButton
          :text="'Guardar cambios'"
          :click="updateAdministrator"
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
        :isBusy="busy"
      />

      <SuccessToast v-if="showSuccessToast" :textTitle="titleToast" />

      <FailToast v-if="showFailToast" :textTitle="titleToast" />
    </div>
  </div>
</template>

<script>
import Navigation from '@/components/navs/navigation.vue';
import Loading from '@/components/modals/loading.modal.vue';
import InputIcon from '@/components/inputs/input-icon.vue';
import Input from '@/components/inputs/input.vue';
import SuccessButton from '@/components/buttons/success.button.vue';
import DeleteUserModal from '@/components/modals/delete-user.modal.vue';
import SuccessToast from '@/components/toasts/success.toast.vue';
import FailToast from '@/components/toasts/fail.toast.vue';

export default {
  components: {
    Navigation,
    Loading,
    InputIcon,
    Input,
    SuccessButton,
    DeleteUserModal,
    SuccessToast,
    FailToast,
  },
  data() {
    return {
      loading: false,
      busy: false,
      isShowModal: false,
      showSuccessToast: false,
      showFailToast: false,
      titleToast: '',

      // userData: this.user_data,
      new_name: '',
      new_last_name: '',
      new_email: '',
      new_password: '',
      titleModal: '',
      bodyModal: '',
      nameUser: '',
      typePassword: 'password',
      classPassword: 'btn fas fa-eye-slash',
    };
  },
  async created() {
    if (process.browser)
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;

    // await this.getUser();
    console.log('created _id');
    this.loading = !this.loading;
    // Traer al store el admin
    this.$store.dispatch(
      'administrators/getAdministrator',
      this.$route.params.id
    );

    this.loading = !this.loading;

    this.user_data;
  },
  computed: {
    user_data() {
      let userData = this.$store.getters['administrators/getAdministrator'];
      this.new_name = userData.name;
      this.new_last_name = userData.last_name;
      this.new_email = userData.email;
    },
  },
  methods: {
    async getUser() {
      try {
        this.loading = !this.loading;

        let user_response = await this.$axios.get(
          `/getOneAdminUser?user_id=${this.$route.params.id}`
        );
        let user_data = user_response.data.payload;
        this.user_data = user_data;
        this.setValueInput();

        this.loading = !this.loading;
        console.log('user: ', this.user_data);
      } catch (err) {
        console.log(err);
      }
    },
    setValueInput() {
      this.new_name = this.userData.name;
      this.new_last_name = this.userData.last_name;
      this.new_email = this.userData.email;
    },
    async updateAdministrator() {
      try {
        this.busy = !this.busy;

        let userUpdated = this.$store.dispatch(
          'administrators/updateAdministrator',
          {
            user_id: this.$route.params.id,
            name: this.new_name,
            last_name: this.new_last_name,
            email: this.new_email,
            password: this.new_password,
          }
        );

        this.titleToast = 'Administrador actualizado!';
        this.showSuccessToast = !this.showSuccessToast;

        setTimeout(() => {
          this.busy = !this.busy;
          this.showSuccessToast = !this.showSuccessToast;
          this.$router.push({ path: '/administrators' });
        }, 1500);
      } catch (err) {
        this.busy = !this.busy;
        console.log(err);
        const response = err.response;
        this.titleToast = response.data.message;
        this.showFailToast = !this.showFailToast;

        setTimeout(() => {
          this.showFailToast = !this.showFailToast;
        }, 1);
      }
    },
    confirmModal() {
      this.bodyModal = 'Eliminar usuario.';
      this.bodyModal =
        '¿Deseas eliminar el siguiente usuario?\n' +
        this.user_data.name +
        ' ' +
        this.user_data.last_name;
      this.isShowModal = !this.isShowModal;
    },
    async deleteUser() {
      try {
        let inactive_response = await this.$axios.put('/setInactiveUser', {
          user_id: this.$route.params.id,
        });
        console.log(inactive_response);

        this.titleToast = inactive_response.data.message;
        this.showSuccessToast = !this.showSuccessToast;

        setTimeout(() => {
          this.isShowModal = !this.isShowModal;

          this.showSuccessToast = !this.showSuccessToast;
          this.$router.push({ path: '/administrators' });
        }, 1500);
      } catch (err) {
        this.busy = !this.busy;
        console.log(err);
        const response = err.response;
        this.titleToast = response.data.message;
        this.showFailToast = !this.showFailToast;

        setTimeout(() => {
          this.showFailToast = !this.showFailToast;
        }, 1);
      }
    },
    changeIconClassPass() {
      if (this.typePassword == 'password') {
        this.typePassword = 'text';
        this.classPassword = 'btn fas fa-eye';
      } else if (this.typePassword == 'text') {
        this.typePassword = 'password';
        this.classPassword = 'btn fas fa-eye-slash';
      }
    },
    closeModal() {
      this.isShowModal = !this.isShowModal;
    },
  },
};
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
  color: #db1212;
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
  width: 80%;
  margin-top: 1%;
  margin-left: auto;
  margin-right: auto;
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
}

.int-cont-email {
  width: 36%;
  margin-bottom: 40px;
}

.password {
  display: flex;
  align-items: flex-end;
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
