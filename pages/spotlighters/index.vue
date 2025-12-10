<template>
  <div>
    <Navigation />
    <div class="spotlighter-container">
      <div class="head-container">
        <h1>Spotlighters</h1>
        <nuxt-link
          v-if="!loading"
          to="/spotlighters/add-spotlighter"
          class="add-button"
        >
          <i class="fas fa-user-plus mr-2"></i>
          Agregar spotlighter
        </nuxt-link>
      </div>

      <Loading v-if="loading" />
      <div v-else class="filter-container">
        <div class="search">
          <input
            v-model="search"
            type="searchText"
            placeholder="Buscar"
            @keyup.enter="searchSpotlighters"
          />
        </div>

        <div class="filter-drop">
          <select v-model="selected" class="options" @change="selectedChange">
            <option value="true" selected>Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <div v-if="!loading" class="table-container">
        <table class="table table-bordered">
          <thead class="thead-spotlighter">
            <tr>
              <th scope="col">Nombre completo</th>
              <th scope="col">Número de cuenta</th>
              <th scope="col">Telefono</th>
              <th scope="col">Email</th>
              <th scope="col">Preguntas</th>
              <th scope="col">Saldo</th>
              <th scope="col" class="actions">Acciones</th>
            </tr>
          </thead>
          <tbody class="tbody">
            <tr
              v-for="(spotlighter, index) in spotlighters"
              :key="spotlighter.admin_id"
            >
              <td>{{ spotlighter.name }} {{ spotlighter.last_name }}</td>
              <td>{{ spotlighter.account_number }}</td>
              <td>{{ spotlighter.phone }}</td>
              <td>{{ spotlighter.email }}</td>
              <td>{{ spotlighter.questions_created.length }}</td>
              <td>Falta hacer este calculo</td>
              <td class="td-style">
                <button
                  :disabled="!spotlighter.request_payment"
                  :class="
                    spotlighter.request_payment
                      ? 'fas fa-dollar-sign btn dollar'
                      : 'fas fa-dollar-sign btn dollar-payed'
                  "
                  @click="makePaymentConfirm(spotlighter)"
                ></button>
                <div class="dropleft">
                  <button
                    class="btn fas fa-ellipsis-v"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  ></button>
                  <div
                    class="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <div class="configuration">
                      <button
                        v-if="selected == 'true'"
                        type="button"
                        class="btn"
                        @click="update(spotlighters[index])"
                      >
                        <i class="fas fa-pencil-alt mr-2"></i>
                        Editar usuario
                      </button>
                      <button
                        v-else-if="selected == 'false'"
                        type="button"
                        class="btn"
                        @click="confirmModalActive(spotlighters[index])"
                      >
                        <i class="fas fa-check-circle mr-2"></i>
                        Habilitar usuario
                      </button>
                    </div>
                    <div v-if="selected == 'true'" class="notifications">
                      <button
                        type="button"
                        class="btn"
                        @click="confirmModalInactive(spotlighters[index])"
                      >
                        <i class="fas fa-trash mr-2"></i>
                        Eliminar usuario
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading" class="pagination-container">
        <div class="select-container">
          <span>Resultados por página: </span>
          <select
            v-model="pageResults"
            class="js-example-basic-single"
            @change="rowsChange"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </select>
        </div>

        <div class="arrows-container">
          <span
            >{{ (page - 1) * pageResults + 1 }} -
            {{
              pageResults > totalSpotlighters
                ? totalSpotlighters
                : page * pageResults > totalSpotlighters
                ? totalSpotlighters
                : page * pageResults
            }}
            de {{ totalSpotlighters }} spotlighters</span
          >
          <button
            class="btn fas fa-chevron-left"
            @click="before"
            :disabled="disbaledBefore == 1"
          ></button>
          <button
            class="btn fas fa-chevron-right"
            @click="after"
            :disabled="disabledAfter == 1"
          ></button>
        </div>
      </div>

      <!-- Pagar a spotlighter -->
      <MakePayment
        v-if="isShowPaymentModal"
        @close="closePaymentModal"
        @pay="makePayment"
        :textTitle="titleModal"
        :textBody="bodyModal"
        :name="nameUser"
        :money="total"
        :textButton="button"
        :isBusy="busyPayment"
      />

      <!-- Eliminar spotlighter -->
      <DeleteUserModal
        v-if="isShowModalInactive"
        @close="closeModalInactive"
        :textTitle="titleModal"
        :textBody="bodyModal"
        :name="nameUser"
        :action="inactivateUser"
        :isBusy="busy"
      />

      <!-- Activar spotlighter -->
      <ActiveUserModal
        v-if="isShowModalActive"
        @close="closeModalActive"
        :textTitle="titleModal"
        :textBody="bodyModal"
        :name="nameUser"
        :action="activateUser"
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
import MakePayment from '@/components/modals/administrators/make-payment.modal.vue';
import DeleteUserModal from '@/components/modals/delete-user.modal.vue';
import ActiveUserModal from '@/components/modals/active-user.modal.vue';
import SuccessToast from '@/components/toasts/success.toast.vue';
import FailToast from '@/components/toasts/fail.toast.vue';

export default {
  components: {
    Navigation,
    Loading,
    MakePayment,
    DeleteUserModal,
    ActiveUserModal,
    SuccessToast,
    FailToast,
  },
  data() {
    return {
      busy: false,
      loading: false,
      isShowModalInactive: false,
      isShowModalActive: false,
      isShowPaymentModal: false,
      busyPayment: false,
      showSuccessToast: false,
      showFailToast: false,

      selected: 'true',
      search: '',
      titleToast: '',
      titleModal: '',
      bodyModal: '',
      nameUser: '',
      total: '',
      button: '',

      spotlighters: [],
      spotlighterIdToPay: '',
      totalSpotlighters: 0,
      userIdToDelete: '',
      userIdToActive: '',

      disbaledBefore: 0,
      disabledAfter: 0,
      totalCases: 0,
      pageResults: 10,
      page: 1,
    };
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;
    }

    this.loading = !this.loading;
    await this.$store.dispatch('spotlighters/getSpotlighters', {
      selected: this.selected,
      page: this.page,
      pageResults: this.pageResults,
      search: this.search,
    });
    this.spotlighters = this.$store.getters['spotlighters/getSpotlighters'];
    this.totalSpotlighters =
      this.$store.getters['spotlighters/getTotalSpotlighters'];
    this.loading = !this.loading;
    this.before();
  },
  methods: {
    async getSpotlighters() {
      try {
        this.loading = !this.loading;

        let spotlighter_response = await this.$axios.get(
          '/getAllSpotlighters',
          {
            params: {
              status: this.selected,
              page: this.page,
              pageResults: this.pageResults,
              name: this.search,
            },
          }
        );

        this.spotlighters = spotlighter_response.data.payload.spotlighters;
        this.totalSpotlighters = spotlighter_response.data.payload.length;

        this.loading = !this.loading;
      } catch (err) {
        console.log(err);
      }
    },
    selectedChange() {
      this.getSpotlighters();
    },
    searchSpotlighters() {
      try {
        this.getSpotlighters();
      } catch (err) {
        console.log(err);
      }
    },
    async update(user) {
      this.$router.push({ path: `/spotlighters/${user.admin_id}` });
    },
    confirmModalActive(admin_data) {
      this.titleModal = 'Habilitar usuario';
      this.bodyModal = '¿Deseas habilitar el siguiente usuario?';
      this.nameUser = admin_data.name + ' ' + admin_data.last_name;
      this.userIdToActive = admin_data.admin_id;

      this.isShowModalActive = !this.isShowModalActive;
    },
    async activateUser() {
      try {
        this.busy = !this.busy;

        let activeResponse = await this.$axios.put('/setActiveUser', {
          user_id: this.userIdToActive,
        });
        this.titleToast = activeResponse.data.message;
        this.showSuccessToast = !this.showSuccessToast;

        this.getSpotlighters();
        setTimeout(() => {
          this.busy = !this.busy;
          this.isShowModalActive = !this.isShowModalActive;
          this.showSuccessToast = !this.showSuccessToast;
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
    confirmModalInactive(admin_data) {
      this.titleModal = 'Eliminar usuario';
      this.bodyModal = '¿Deseas eliminar el siguiente usuario?';
      this.nameUser = '' + admin_data.name + ' ' + admin_data.last_name;
      this.userIdToDelete = admin_data.admin_id;

      this.isShowModalInactive = !this.isShowModalInactive;
    },
    async inactivateUser() {
      try {
        this.busy = !this.busy;

        let inactive_response = await this.$axios.put('/setInactiveUser', {
          user_id: this.userIdToDelete,
        });

        this.titleToast = inactive_response.data.message;
        this.showSuccessToast = !this.showSuccessToast;

        this.getSpotlighters();

        setTimeout(() => {
          this.busy = !this.busy;
          this.isShowModalInactive = !this.isShowModalInactive;
          this.showSuccessToast = !this.showSuccessToast;
        }, 1500);
      } catch (err) {
        this.busy = !this.busy;
        console.error(err);
        const response = err.response;
        this.titleToast = response.data.message;
        this.showFailToast = !this.showFailToast;

        setTimeout(() => {
          this.showFailToast = !this.showFailToast;
        }, 1);
      }
    },
    makePaymentConfirm(user) {
      this.spotlighterIdToPay = user.spotlighter_id;
      this.titleModal = 'Pagar y saldar cuenta';
      this.bodyModal =
        'Al indicar que se realizó este pago a este usuario, su saldo quedará en ceros y se reiniciará el conteo de preguntas.';
      this.nameUser = user.name + ' ' + user.last_name;
      this.total = '$1234.00';
      this.button = 'Pago realizado';

      this.isShowPaymentModal = !this.isShowPaymentModal;
    },
    async makePayment() {
      try {
        this.busyPayment = !this.busyPayment;

        let paymentResponse = await this.$axios.put('/cleanQuestions', {
          spotlighter_id: this.spotlighterIdToPay,
        });
        console.log('pay', paymentResponse.data.payload);

        let updated = this.spotlighters.filter(
          (spot) => spot.spotlighter_id == paymentResponse.data.payload
        );
        let newInfoSpotlighter = updated[0];
        newInfoSpotlighter.request_payment = false;
        newInfoSpotlighter.payed = true;

        // console.log('upd', newInfoSpotlighter)

        this.busyPayment = !this.busyPayment;
        alert(paymentResponse.data.message);
        this.isShowPaymentModal = !this.isShowPaymentModal;
      } catch (err) {
        console.log(err);
      }
    },
    rowsChange() {
      this.page = 1;

      if (
        this.pageResults > this.totalSpotlighters ||
        this.totalSpotlighters == 0
      ) {
        this.disabledAfter = 1;
        this.disbaledBefore = 1;
      } else {
        this.disbaledBefore = 1;
        this.disabledAfter = 0;
      }

      this.getSpotlighters();
    },
    before() {
      if (this.page == 1) {
        this.disbaledBefore = 1;
        if (this.totalSpotlighters == 0) this.disabledAfter = 1;
        else {
          if (this.totalSpotlighters > this.pageResults) this.disabledAfter = 0;
          else this.disabledAfter = 1;
        }
      } else if (this.page > 1) {
        this.page -= 1;
        this.disabledAfter = 0;

        if (this.page == 1) this.disbaledBefore = 1;

        this.getSpotlighters();
      }
    },
    after() {
      this.page += 1;
      if (this.page * this.pageResults > this.totalSpotlighters) {
        this.disabledAfter = 1;
        this.disbaledBefore = 0;
      } else {
        if (this.page > 1) this.disbaledBefore = 0;
      }

      this.getSpotlighters();
    },
    closeModalInactive() {
      this.isShowModalInactive = !this.isShowModalInactive;
      this.userIdToDelete = '';
    },
    closeModalActive() {
      this.isShowModalActive = !this.isShowModalActive;
      this.userIdToActive = '';
    },
    closePaymentModal() {
      this.isShowPaymentModal = false;
    },
  },
};
</script>

<style scoped>
.spotlighter-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: Montserrat;
}

.head-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.add-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;

  background: #20b000;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.4px;
  color: #ffffff;
  text-decoration: none;
}

.filter-container {
  display: flex;
  flex-direction: row;
  /* justify-content: space-between; */
  align-items: flex-end;
  height: 48px;
  margin: 20px 0px;
}

.search {
  display: flex;
  align-items: center;
  width: 50%;
  height: 100%;
}

.search input {
  width: 800px;
  height: 48px;
  background: #ffffff;
  border: 1px solid #d4d5d7;
  box-sizing: border-box;
  border-radius: 10px;
  padding: 0px 15px;
}

.filter-drop {
  display: flex;
  align-items: center;
  width: 15%;
  margin: 0px 100px;
}

.filter-drop select {
  height: 32px;
  width: 100%;
  border: none;
  border-bottom: 1px solid #000;
  background-color: transparent;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill=''><polygon points='0,0 100,0 50,50'/></svg>")
    no-repeat;
  background-size: 12px;
  background-position: calc(100% - 10px) center;
  background-repeat: no-repeat;
  -webkit-appearance: none;
  appearance: none;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}

.filter-drop select:focus {
  outline: none;
}

.pay-button {
  width: 20%;
}

.thead-spotlighter {
  background: #212529;
  color: #fff;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.thead-spotlighter th:last-child {
  border-radius: 0px 15px 0px 0px;
  border: 1px solid white;
  -moz-border-radius: 0px 15px 0px 0px;
  -webkit-border-radius: 0px 15px 0px 0px;
}

.thead-spotlighter th:first-child {
  border-radius: 15px 0px 0px 0px;
  border: 1px solid white;
  -moz-border-radius: 15px 0px 0px 0px;
  -webkit-border-radius: 15px 0px 0px 0px;
}

.tbody {
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 18px;
  color: #212529;
}

td {
  vertical-align: middle;
}

.check-style {
  border: 1px solid #fe9400;
  box-sizing: border-box;
}

.td-style {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.dollar {
  color: #fff;
  background: #fe9400;
  border-radius: 100%;
  margin: 0 0.5rem;
}

.dollar:hover {
  color: #fff;
  background: #000;
  border-radius: 100%;
  margin: 0 0.5rem;
}

.dollar-request {
  color: #fff;
  background: #db1212;
  border-radius: 100%;
  margin: 0 0.5rem;
}

.dollar-request:hover {
  color: #fff;
  background: #000;
  border-radius: 100%;
  margin: 0 0.5rem;
}

.dollar-payed {
  color: #fff;
  background: #8f8f8f;
  border-radius: 100%;
  margin: 0 0.5rem;
}
.pay-button button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /* padding: 12px 20px; */

  position: static;
  width: 100%;
  height: 48px;
  color: #fe9400;
  border: 1px solid #fe9400;
  box-sizing: border-box;
  border-radius: 10px;
  /* margin: 0px 24px; */
}

.pay-button i {
  color: #fff;
  background: #fe9400;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  padding-top: 2%;
  margin-right: 5%;
}

.dropdown-menu {
  background: #ffffff;
  box-shadow: 0px 0px 20px #d4d5d7;
  border-radius: 10px;
  width: 200px;
  padding-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  height: 56px;
}

.select-container {
  display: flex;
  align-items: center;
  margin: 0px 40px;
}

.select-container span {
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  margin: 0px 10px;
  color: #212529;
}

.arrows-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0px 40px;
}

.arrows-container span {
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: #212529;
}

.arrows-container button {
  color: #fe9400;
}
</style>
