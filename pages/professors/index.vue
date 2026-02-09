<template>
  <div>
    <div class="professors-container">
      <div class="head-container">
        <p class="title">Profesores</p>
        <button v-if="!loading" class="add-button" @click="openCreateModal">
          <i class="fas fa-user-plus"></i>
          Agregar profesor
        </button>
      </div>

      <Loading v-if="loading" />

      <div v-else>
        <div class="filters-container">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nombre o correo"
            class="search-input"
            @keyup.enter="searchProfessors"
          />

          <select
            v-model="selectedUniversity"
            class="filter-select"
            @change="fetchProfessors"
          >
            <option value="">Todas las universidades</option>
            <option
              v-for="uni in universities"
              :key="uni._id"
              :value="uni._id"
            >
              {{ uni.name }}
            </option>
          </select>

          <select
            v-model="selectedStatus"
            class="filter-select"
            @change="fetchProfessors"
          >
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <div class="table-container">
          <table class="table table-bordered">
            <thead class="thead-professors">
              <tr>
                <th scope="col">Nombre completo</th>
                <th scope="col">Correo electrónico</th>
                <th scope="col">Universidad</th>
                <th scope="col" class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody class="tbody">
              <tr v-if="professors.length === 0">
                <td colspan="4" class="text-center">
                  No se encontraron profesores
                </td>
              </tr>
              <tr v-for="prof in professors" :key="prof._id">
                <td>{{ prof.name }} {{ prof.last_name }}</td>
                <td>{{ prof.email }}</td>
                <td>
                  {{
                    prof.university_id && prof.university_id.name
                      ? prof.university_id.name
                      : 'Sin universidad'
                  }}
                </td>
                <td>
                  <div class="dropleft">
                    <button
                      class="btn fas fa-ellipsis-v"
                      type="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>
                    <div class="dropdown-menu">
                      <div class="configuration">
                        <button
                          v-if="selectedStatus === 'true'"
                          type="button"
                          class="btn"
                          @click="openEditModal(prof)"
                        >
                          <i class="fas fa-pencil-alt mr-2"></i>
                          Editar
                        </button>
                        <button
                          v-if="selectedStatus === 'true'"
                          type="button"
                          class="btn"
                          @click="confirmDeactivate(prof)"
                        >
                          <i class="fas fa-trash mr-2"></i>
                          Desactivar
                        </button>
                        <button
                          v-if="selectedStatus === 'false'"
                          type="button"
                          class="btn"
                          @click="confirmActivate(prof)"
                        >
                          <i class="fas fa-check-circle mr-2"></i>
                          Activar
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="select-container">
            <span>Resultados por página: </span>
            <select v-model="limit" class="pagination-select" @change="onLimitChange">
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>

          <div class="arrows-container">
            <span>
              {{ (currentPage - 1) * limit + 1 }} -
              {{
                currentPage * limit > totalProfessors
                  ? totalProfessors
                  : currentPage * limit
              }}
              de {{ totalProfessors }} profesores
            </span>
            <button
              class="btn fas fa-chevron-left"
              :disabled="currentPage <= 1"
              @click="prevPage"
            ></button>
            <button
              class="btn fas fa-chevron-right"
              :disabled="currentPage * limit >= totalProfessors"
              @click="nextPage"
            ></button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <ProfessorModal
        v-if="showModal"
        :professor="editingProfessor"
        :universities="universities"
        :saving="saving"
        @close="closeModal"
        @save="saveProfessor"
      />

      <!-- Confirm Deactivate Modal -->
      <DeleteUserModal
        v-if="showDeactivateModal"
        :textTitle="'Desactivar profesor'"
        :textBody="'¿Deseas desactivar el siguiente profesor?'"
        :name="deactivateName"
        :action="deactivateProfessor"
        :isBusy="saving"
        @close="showDeactivateModal = false"
      />

      <!-- Confirm Activate Modal -->
      <ActiveUserModal
        v-if="showActivateModal"
        :textTitle="'Activar profesor'"
        :textBody="'¿Deseas activar el siguiente profesor?'"
        :name="activateName"
        :action="activateProfessor"
        :isBusy="saving"
        @close="showActivateModal = false"
      />

      <SuccessToast v-if="showSuccessToast" :textTitle="toastMessage" />
      <FailToast v-if="showFailToast" :textTitle="toastMessage" />
    </div>
  </div>
</template>

<script>
import Loading from '@/components/modals/loading.modal.vue';
import DeleteUserModal from '@/components/modals/delete-user.modal.vue';
import ActiveUserModal from '@/components/modals/active-user.modal.vue';
import SuccessToast from '@/components/toasts/success.toast.vue';
import FailToast from '@/components/toasts/fail.toast.vue';
import ProfessorModal from '@/components/professors/professor-modal.vue';

export default {
  components: {
    Loading,
    DeleteUserModal,
    ActiveUserModal,
    SuccessToast,
    FailToast,
    ProfessorModal,
  },
  data() {
    return {
      loading: false,
      saving: false,
      showModal: false,
      showDeactivateModal: false,
      showActivateModal: false,
      showSuccessToast: false,
      showFailToast: false,
      toastMessage: '',

      professors: [],
      totalProfessors: 0,
      universities: [],

      search: '',
      selectedUniversity: '',
      selectedStatus: 'true',
      currentPage: 1,
      limit: 20,

      editingProfessor: null,
      deactivateId: '',
      deactivateName: '',
      activateId: '',
      activateName: '',
    };
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;
    }

    await this.loadUniversities();
    await this.fetchProfessors();
  },
  methods: {
    async loadUniversities() {
      try {
        const response = await this.$axios.get('/universities');
        this.universities =
          response.data.payload || response.data.data || response.data || [];
      } catch (err) {
        console.error('Error loading universities:', err);
      }
    },

    async fetchProfessors() {
      try {
        this.loading = true;
        await this.$store.dispatch('professors/fetchProfessors', {
          page: this.currentPage,
          limit: this.limit,
          university_id: this.selectedUniversity || undefined,
          search: this.search || undefined,
          status: this.selectedStatus,
        });

        this.professors = this.$store.getters['professors/getProfessors'];
        this.totalProfessors =
          this.$store.getters['professors/getTotalProfessors'];
      } catch (err) {
        console.error('Error fetching professors:', err);
      } finally {
        this.loading = false;
      }
    },

    searchProfessors() {
      this.currentPage = 1;
      this.fetchProfessors();
    },

    openCreateModal() {
      this.editingProfessor = null;
      this.showModal = true;
    },

    openEditModal(professor) {
      this.editingProfessor = professor;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.editingProfessor = null;
    },

    async saveProfessor(formData) {
      try {
        this.saving = true;

        if (this.editingProfessor) {
          // Update
          await this.$store.dispatch('professors/updateProfessor', {
            id: this.editingProfessor._id,
            data: {
              name: formData.name,
              last_name: formData.last_name,
              email: formData.email,
              university_id: formData.university_id,
              ...(formData.password ? { password: formData.password } : {}),
            },
          });
          this.showToast('Profesor actualizado exitosamente', true);
        } else {
          // Create
          await this.$store.dispatch('professors/createProfessor', formData);
          this.showToast('Profesor creado exitosamente', true);
        }

        this.closeModal();
        await this.fetchProfessors();
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Error al guardar profesor';
        this.showToast(errorMessage, false);
      } finally {
        this.saving = false;
      }
    },

    confirmDeactivate(professor) {
      this.deactivateId = professor._id;
      this.deactivateName = `${professor.name} ${professor.last_name}`;
      this.showDeactivateModal = true;
    },

    async deactivateProfessor() {
      try {
        this.saving = true;
        await this.$store.dispatch(
          'professors/deactivateProfessor',
          this.deactivateId
        );
        this.showToast('Profesor desactivado exitosamente', true);
        this.showDeactivateModal = false;
        await this.fetchProfessors();
      } catch (err) {
        this.showToast('Error al desactivar profesor', false);
      } finally {
        this.saving = false;
      }
    },

    confirmActivate(professor) {
      this.activateId = professor._id;
      this.activateName = `${professor.name} ${professor.last_name}`;
      this.showActivateModal = true;
    },

    async activateProfessor() {
      try {
        this.saving = true;
        await this.$store.dispatch(
          'professors/activateProfessor',
          this.activateId
        );
        this.showToast('Profesor activado exitosamente', true);
        this.showActivateModal = false;
        await this.fetchProfessors();
      } catch (err) {
        this.showToast('Error al activar profesor', false);
      } finally {
        this.saving = false;
      }
    },

    showToast(message, isSuccess) {
      this.toastMessage = message;
      if (isSuccess) {
        this.showSuccessToast = true;
        setTimeout(() => {
          this.showSuccessToast = false;
        }, 2500);
      } else {
        this.showFailToast = true;
        setTimeout(() => {
          this.showFailToast = false;
        }, 2500);
      }
    },

    onLimitChange() {
      this.currentPage = 1;
      this.fetchProfessors();
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchProfessors();
      }
    },

    nextPage() {
      if (this.currentPage * this.limit < this.totalProfessors) {
        this.currentPage++;
        this.fetchProfessors();
      }
    },
  },
};
</script>

<style scoped>
.professors-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: Montserrat, sans-serif;
}

.title {
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 39px;
  margin-bottom: 0;
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
  border: none;
  cursor: pointer;
}

.add-button i {
  position: static;
  font-size: 24px;
  margin-right: 12px;
}

.filters-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 12px;
  height: 48px;
  background: #ffffff;
  border: 1px solid #d4d5d7;
  box-sizing: border-box;
  border-radius: 10px;
  outline: none;
  font-family: Montserrat, sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: #fe9400;
}

.filter-select {
  height: 48px;
  min-width: 200px;
  padding: 0 12px;
  border: 1px solid #d4d5d7;
  border-radius: 10px;
  background-color: #fff;
  font-family: Montserrat, sans-serif;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill=''><polygon points='0,0 100,0 50,50'/></svg>");
  background-size: 12px;
  background-position: calc(100% - 14px) center;
  background-repeat: no-repeat;
}

.filter-select:focus {
  border-color: #fe9400;
}

.table-container {
  overflow-x: auto;
}

.thead-professors {
  background: #212529;
  color: #fff;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.thead-professors th:last-child {
  border-radius: 0px 15px 0px 0px;
  border: 1px solid white;
}

.thead-professors th:first-child {
  border-radius: 15px 0px 0px 0px;
  border: 1px solid white;
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

.text-center {
  text-align: center;
}

.actions-col {
  width: 5%;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  height: 56px;
  margin-top: 16px;
}

.select-container {
  display: flex;
  align-items: center;
  margin: 0px 40px;
}

.select-container span {
  font-size: 12px;
  color: #212529;
  margin-right: 8px;
}

.pagination-select {
  border: none;
  border-bottom: 1px solid #000;
  background-color: transparent;
  outline: none;
}

.arrows-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.arrows-container span {
  font-size: 12px;
  color: #212529;
}

.arrows-container button {
  color: #fe9400;
}

.dropdown-menu {
  background: #ffffff;
  box-shadow: 0px 0px 20px #d4d5d7;
  border-radius: 10px;
  width: 200px;
  padding-left: 8px;
}
</style>
