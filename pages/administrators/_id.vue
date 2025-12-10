<template>
  <div>
    <Navigation />
    <div class="add-container">
      <div class="button-container">
        <nuxt-link to="/administrators">
          <i class="fas fa-chevron-left"></i>
          Cancelar y volver
        </nuxt-link>
        <button v-if="!loading" class="btn" @click="openDeleteModal">
          <i class="fas fa-trash"></i> Eliminar usuario
        </button>
      </div>

      <Loading v-if="loading" />
      <div v-else class="form-container">
        <p class="title">Editar administrador</p>
        <hr />

        <div class="inputs">
          <div class="int-cont">
            <InputComponent
              type="text"
              placeholder="Nombre"
              v-model="form.name"
              :val="form.name"
              title="Nombre(s)"
            />
          </div>
          <div class="int-cont">
            <InputComponent
              type="text"
              placeholder="Apellidos"
              v-model="form.last_name"
              :val="form.last_name"
              title="Apellidos"
            />
          </div>
        </div>

        <div class="inputs">
          <div class="int-cont-email">
            <InputIcon
              type="email"
              placeholder="example@example.com"
              v-model="form.email"
              :val="form.email"
              icon="fas fa-user-circle"
              title="Correo electrónico"
            />
          </div>
        </div>

        <div class="inputs">
          <div class="int-cont-email">
            <div class="password">
              <InputIcon
                :type="showPassword ? 'text' : 'password'"
                placeholder="• • • • • • • •"
                v-model="form.password"
                icon="fas fa-lock"
                title="Contraseña"
              />
              <button
                :class="[
                  'btn',
                  'fas',
                  showPassword ? 'fa-eye' : 'fa-eye-slash',
                ]"
                @click="showPassword = !showPassword"
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
          text="Guardar cambios"
          :click="updateAdministrator"
          new_class="btn"
          i_class="fas fa-save"
        />
      </div>

      <DeleteUserModal
        v-if="isShowModal"
        @close="isShowModal = false"
        textTitle="Eliminar usuario"
        :textBody="deleteModalBody"
        :action="deleteUser"
        :isBusy="busy"
      />

      <SuccessToast v-if="showSuccessToast" :textTitle="toastMessage" />
      <FailToast v-if="showFailToast" :textTitle="toastMessage" />
    </div>
  </div>
</template>

<script>
import Navigation from '@/components/navs/navigation.vue';
import Loading from '@/components/modals/loading.modal.vue';
import InputIcon from '@/components/inputs/input-icon.vue';
import InputComponent from '@/components/inputs/input.vue';
import SuccessButton from '@/components/buttons/success.button.vue';
import DeleteUserModal from '@/components/modals/delete-user.modal.vue';
import SuccessToast from '@/components/toasts/success.toast.vue';
import FailToast from '@/components/toasts/fail.toast.vue';

export default {
  components: {
    Navigation,
    Loading,
    InputIcon,
    InputComponent,
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
      toastMessage: '',
      showPassword: false,
      form: {
        name: '',
        last_name: '',
        email: '',
        password: '',
      },
    };
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;
    }
    this.$store.dispatch(
      'administrators/getAdministrator',
      this.$route.params.id
    );
  },
  computed: {
    user_data() {
      return this.$store.getters['administrators/getAdministrator'];
    },
    deleteModalBody() {
      if (!this.user_data) return '';
      return `¿Deseas eliminar el siguiente usuario?\n${this.user_data.name} ${this.user_data.last_name}`;
    },
  },
  watch: {
    user_data: {
      handler(userData) {
        if (userData) {
          this.form.name = userData.name;
          this.form.last_name = userData.last_name;
          this.form.email = userData.email;
        }
      },
      immediate: true,
    },
  },
  methods: {
    showToast(message, isSuccess = true) {
      this.toastMessage = message;
      if (isSuccess) {
        this.showSuccessToast = true;
      } else {
        this.showFailToast = true;
      }
      setTimeout(() => {
        this.showSuccessToast = false;
        this.showFailToast = false;
      }, 1500);
    },
    async updateAdministrator() {
      try {
        this.busy = true;
        await this.$store.dispatch('administrators/updateAdministrator', {
          user_id: this.$route.params.id,
          ...this.form,
        });
        this.showToast('Administrador actualizado!');
        setTimeout(() => {
          this.busy = false;
          this.$router.push('/administrators');
        }, 1500);
      } catch (err) {
        this.busy = false;
        this.showToast(
          err.response?.data?.message || 'Error al actualizar',
          false
        );
      }
    },
    openDeleteModal() {
      this.isShowModal = true;
    },
    async deleteUser() {
      try {
        const response = await this.$axios.put('/setInactiveUser', {
          user_id: this.$route.params.id,
        });
        this.showToast(response.data.message);
        setTimeout(() => {
          this.isShowModal = false;
          this.$router.push('/administrators');
        }, 1500);
      } catch (err) {
        this.busy = false;
        this.showToast(
          err.response?.data?.message || 'Error al eliminar',
          false
        );
      }
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
