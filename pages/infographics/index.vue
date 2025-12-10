<template>
  <div id="infographics" class="infographics-wrapper">
    <!-- MAIN CONTENT (RIGHT) -->
    <section class="infographics-container">
      <article class="full m-2 mb-3 p-5">
        <template v-if="loadingState">
          <loading-state message="Estamos cargando las infografías" />
        </template>
        <template v-else>
          <!-------------------------------------------------------------------- Infographics Content -->
          <manage-infographics-grid
            :infographicCardSize="infographicCardSize"
            :overlayIcon="'trash-fill'"
            @onSelectedInfographic="selectInfographic"
          />
        </template>
      </article>
    </section>
    <!--------------------------------------------------------------------------- Infographic Modal -->
    <infographic-create-modal />
    <infographic-delete-modal
      :selectedInfographicIdx="selectedInfographicIdx"
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import LoadingState from '@/components/loading-state.vue';
import InfographicsAdminHeader from './infographics-admin.header.vue';
import ManageInfographicsGrid from './manage-infographics.grid.vue';
import InfographicCreateModal from './infographic-create.modal.vue';
import InfographicDeleteModal from './infographic-delete.modal.vue';
export default {
  components: {
    LoadingState,
    InfographicsAdminHeader,
    ManageInfographicsGrid,
    InfographicCreateModal,
    InfographicDeleteModal,
  },
  data() {
    return {
      selectedTopicIdx: 0,
      selectedSubtopicIdx: 0,
      selectedInfographicIdx: 0,
      infographicCardSize: 300,
    };
  },
  computed: {
    ...mapGetters({
      loadingState: 'infographics/loadingState',
      infographics: 'infographics/allInfographics',
    }),
  },
  methods: {
    createInfographic() {
      this.$bvModal.show('infographic-create-modal');
    },
    selectInfographic(selectedInfographicIdx) {
      this.selectedInfographicIdx = selectedInfographicIdx;
      this.$bvModal.show('infographic-delete-modal');
    },
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;
    }
  },
  mounted() {
    this.$store.dispatch('pageHeader/setHeader', {
      title: 'Infografías',
      buttonConfig: {
        type: 'button',
        isBack: false,
        text: 'Agregar infografía',
        icon: 'fas fa-plus',
        action: 'createInfographic',
      },
    });
    this.$nuxt.$on('page-header-button-click', this.createInfographic);
    if (this.infographics === undefined) {
      this.$store.dispatch('infographics/fetchInfographics');
    }
  },
  beforeDestroy() {
    this.$nuxt.$off('page-header-button-click', this.handleHeaderButtonClick);
  },
};
</script>
<style lang="scss" scoped>
.infographics-wrapper {
  width: 100%;
  height: 100%;

  .shadow-sm {
    background-color: #ffffff;
    overflow-y: auto;
  }
}
</style>
