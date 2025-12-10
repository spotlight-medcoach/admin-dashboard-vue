<template>
  <transition name="modal">
    <div class="modal-mask" @click="close" v-show="show">
      <div class="modal-container" @click.stop>
        <div class="modal-body">
          <div class="profile">
            <button type="button" class="btn" @click="profile">
              <i class="fas fa-user-alt"></i>
              Perfil
            </button>
          </div>
          <div class="logout">
            <button type="button" class="btn" @click="logout">
              <i class="fas fa-sign-in-alt"></i>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: ['show'],
  data() {
    return {
      userData: {},
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    profile() {
      if (process.browser) {
        // this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        this.userData = JSON.parse(localStorage.getItem('user'));
      }
      console.log(this.userData.role);
      if (this.userData.role == 'Administrador') {
        this.$router.push({ path: '/profile' });
      } else {
        this.$router.push({ path: '/spotlightersPages/profile' });
      }
    },
    logout() {
      setTimeout(() => {
        this.$router.push({ path: '/' });

        this.$store.dispatch('killSession');
        localStorage.clear();
      }, 1000);
    },
  },
};
</script>

<style scoped>
.modal-mask {
  display: flex;
  position: fixed;
  justify-content: flex-end;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-family: Montserrat;
}

.modal-container {
  display: flex;
  position: absolute;
  margin: 5%;
  justify-content: space-evenly;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  box-shadow: 0px 0px 20px #d4d5d7;
  border-radius: 10px;
}

.modal-container i {
  margin-right: 0.5rem;
}

button:hover {
  color: #fe9400;
}

/* .modal-enter {
        opacity: 0;
    }

    .modal-leave-active {
        opacity: 0;
    }

    .modal-enter .modal-container,
    .modal-leave-active .modal-container {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
    } */
</style>
