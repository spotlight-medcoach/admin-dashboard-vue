<template>
  <div class="layout-wrapper" :class="sidebarClasses">
    <Navigation />
    <div v-if="hasHeader" class="page-header-navbar">
      <div
        class="page-header-container"
        :class="{ 'has-back-button': buttonConfig && buttonConfig.isBack }"
      >
        <component
          v-if="buttonConfig && buttonConfig.isBack"
          :is="buttonConfig.type === 'link' ? 'nuxt-link' : 'button'"
          :to="buttonConfig.type === 'link' ? buttonConfig.to : undefined"
          class="page-header-back-button"
          @click="buttonConfig.type === 'button' ? handleButtonClick() : null"
        >
          <i :class="buttonConfig.icon || 'fas fa-chevron-left'"></i>
        </component>
        <h1 class="page-title">{{ title }}</h1>
        <component
          v-if="buttonConfig && !buttonConfig.isBack"
          :is="buttonConfig.type === 'link' ? 'nuxt-link' : 'button'"
          :to="buttonConfig.type === 'link' ? buttonConfig.to : undefined"
          :class="[
            'page-header-button',
            buttonConfig.type === 'link' ? 'is-link' : 'is-button',
          ]"
          @click="buttonConfig.type === 'button' ? handleButtonClick() : null"
        >
          <i v-if="buttonConfig.icon" :class="buttonConfig.icon"></i>
          {{ buttonConfig.text }}
        </component>
      </div>
    </div>
    <div class="content-container is-administrator-page">
      <template>
        <!-------------------------------------------------------------------- Page Content -->
        <div class="page-content-wrapper" :class="{ 'no-header': !hasHeader }">
          <Nuxt />
        </div>
      </template>
    </div>
    <!-- Contenedor de toasts de BootstrapVue -->
    <b-toaster name="b-toaster-top-right" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Navigation from '@/components/navs/navigation.vue';

export default {
  components: {
    Navigation,
  },
  data() {
    return {
      sidebarPinned: false,
      sidebarCollapsed: true,
      sidebarExpanded: false,
      showNavigation: false, // Flag para forzar renderizado después de hidratación
    };
  },
  computed: {
    ...mapGetters('pageHeader', ['title', 'buttonConfig', 'hasHeader']),
    sidebarClasses() {
      return {
        'has-sidebar-pinned': this.sidebarPinned && !this.sidebarCollapsed,
        'has-sidebar-collapsed': this.sidebarCollapsed && !this.sidebarPinned,
      };
    },
  },
  mounted() {
    if (process.browser) {
      // Escuchar cambios en localStorage
      window.addEventListener('storage', this.handleStorageChange);
      // Escuchar evento personalizado para cambios en el mismo tab
      window.addEventListener('navigation-changed', this.updateSidebarState);
      // Escuchar evento de cambio de estado del sidebar
      window.addEventListener(
        'sidebar-state-changed',
        this.handleSidebarStateChange
      );
      // Polling como fallback (reducido a 500ms para mejor rendimiento)
      this.intervalId = setInterval(this.updateSidebarState, 500);
    }
  },
  beforeDestroy() {
    if (process.browser) {
      window.removeEventListener('storage', this.handleStorageChange);
      window.removeEventListener('navigation-changed', this.updateSidebarState);
      window.removeEventListener(
        'sidebar-state-changed',
        this.handleSidebarStateChange
      );
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    }
  },
  methods: {
    updateSidebarState() {
      if (!process.browser) return;
      try {
        const sidebarPinned = localStorage.getItem('sidebar_pinned');
        const sidebarCollapsed = localStorage.getItem('sidebar_collapsed');
        // Si hay valores guardados, usarlos; si no, mantener valores por defecto
        if (sidebarPinned !== null) {
          this.sidebarPinned = sidebarPinned === 'true';
        }
        if (sidebarCollapsed !== null) {
          this.sidebarCollapsed = sidebarCollapsed === 'true';
        }
        this.sidebarExpanded = !this.sidebarCollapsed;
      } catch (error) {
        console.error('Error al leer estado del sidebar:', error);
      }
    },
    handleSidebarStateChange(event) {
      if (!process.browser) return;
      if (event.detail) {
        this.sidebarPinned = event.detail.isPinned;
        this.sidebarCollapsed = event.detail.isCollapsed;
        this.sidebarExpanded = !event.detail.isCollapsed;
      }
    },
    handleStorageChange(e) {
      if (
        e.key === 'sidebar_pinned' ||
        e.key === 'sidebar_visible' ||
        e.key === 'sidebar_collapsed'
      ) {
        this.updateSidebarState();
      }
    },
    handleButtonClick() {
      if (this.buttonConfig && this.buttonConfig.action) {
        // Emitir evento para que la página lo maneje
        this.$nuxt.$emit('page-header-button-click', this.buttonConfig.action);
      }
    },
  },
  watch: {
    $route(to) {
      // Actualizar showNavigation cuando cambia la ruta
      if (process.browser) {
        this.showNavigation = to.path.startsWith('/administratorsPages');
      }
      // Limpiar header al cambiar de ruta
      this.$store.dispatch('pageHeader/clearHeader');
    },
  },
};
</script>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

/* Contenedor de contenido principal */
.content-container {
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-top: 16px;
  padding-bottom: 16px;
}

/* Cuando es página de administrador, agregar padding según estado del sidebar */
.content-container.is-administrator-page {
  padding-left: 104px; /* 90px sidebar comprimido + 24px padding */
  padding-right: 44px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Sidebar expandido y pinneado - empuja el contenido */
.layout-wrapper.has-sidebar-pinned .content-container.is-administrator-page {
  padding-left: 324px; /* 300px sidebar expandido + 24px padding */
}

/* Sidebar comprimido (no pinneado) - solo ocupa 70px */
.layout-wrapper.has-sidebar-collapsed .content-container.is-administrator-page {
  padding-left: 94px; /* 70px sidebar comprimido + 24px padding */
}

@media (max-width: 768px) {
  .content-container.is-administrator-page {
    padding-left: 24px;
  }

  .layout-wrapper.has-sidebar-pinned .content-container.is-administrator-page {
    padding-left: 24px;
  }

  .layout-wrapper.has-sidebar-collapsed
    .content-container.is-administrator-page {
    padding-left: 24px;
  }
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}

/* Page Header Navbar */
.page-header-navbar {
  background-color: #ffffff;
  padding: 16px 44px;
  padding-left: 104px; /* 90px sidebar comprimido + 24px padding */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sidebar expandido y pinneado - aumenta padding del navbar */
.layout-wrapper.has-sidebar-pinned .page-header-navbar {
  padding-left: 324px; /* 300px sidebar expandido + 24px padding */
}

/* Sidebar comprimido (no pinneado) - reduce padding del navbar */
.layout-wrapper.has-sidebar-collapsed .page-header-navbar {
  padding-left: 94px; /* 70px sidebar comprimido + 24px padding */
}

@media (max-width: 768px) {
  .page-header-navbar {
    padding-left: 24px;
  }

  .layout-wrapper.has-sidebar-pinned .page-header-navbar {
    padding-left: 24px;
  }

  .layout-wrapper.has-sidebar-collapsed .page-header-navbar {
    padding-left: 24px;
  }
}

/* Page Content Wrapper */
.page-content-wrapper {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  flex: 1;
}

.page-content-wrapper.no-header {
  padding: 0;
  background-color: transparent;
  box-shadow: none;
  border-radius: 0;
}

/* Page Header Styles */
.page-header-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 0;
}

.page-header-container.has-back-button {
  justify-content: flex-start;
  gap: 16px;
}

.page-title {
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  margin: 0;
  color: #000000;
}

/* Back Button Styles */
.page-header-back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid #d4d5d7;
  color: #212529;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  flex-shrink: 0;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.page-header-back-button:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.page-header-back-button i {
  font-size: 16px;
  margin: 0;
}

.page-header-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  background: #20b000;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;
  border: none;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.4px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.page-header-button.is-link {
  text-decoration: none;
}

.page-header-button.is-link:hover {
  color: #ffffff;
}

.page-header-button i {
  margin-right: 12px;
  font-size: 18px;
}

.page-header-button:hover {
  background: #1a9000;
  transform: translateY(-1px);
  box-shadow: 2px 4px 6px rgba(49, 51, 100, 0.3);
}

/* Estilos mejorados para toasts de BootstrapVue */
.b-toaster {
  z-index: 1055;
}

.toast {
  min-width: 300px;
  max-width: 400px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
}

/* Ocultar o mejorar el header del toast */
.toast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: none;
  background: transparent;
  font-weight: 600;
  font-size: 14px;
  color: #212529;
}

/* Estilos para el título del toast */
.toast-header strong {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.2px;
}

/* Botón de cerrar mejorado */
.toast-header .close {
  margin-left: auto;
  padding: 0;
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
  color: rgba(0, 0, 0, 0.5);
  opacity: 0.6;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.toast-header .close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.8);
}

.toast-header .close:focus {
  outline: none;
  box-shadow: none;
}

/* Cuerpo del toast mejorado */
.toast-body {
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #212529;
}

/* Variantes de color mejoradas */
.toast.bg-success {
  background: linear-gradient(135deg, #20b000 0%, #1a9000 100%) !important;
  color: #ffffff;
}

.toast.bg-success .toast-header {
  background: linear-gradient(135deg, #20b000 0%, #1a9000 100%) !important;
  color: #ffffff;
}

.toast.bg-success .toast-body {
  background: linear-gradient(135deg, #20b000 0%, #1a9000 100%) !important;
  color: #ffffff;
}

.toast.bg-success .toast-header strong {
  color: #ffffff;
}

.toast.bg-success .toast-header .close {
  color: rgba(255, 255, 255, 0.8);
}

.toast.bg-success .toast-header .close:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.15);
}

.toast.bg-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
  color: #ffffff;
}

.toast.bg-danger .toast-header {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
  color: #ffffff;
}

.toast.bg-danger .toast-body {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
  color: #ffffff;
}

.toast.bg-danger .toast-header strong {
  color: #ffffff;
}

.toast.bg-danger .toast-header .close {
  color: rgba(255, 255, 255, 0.8);
}

.toast.bg-danger .toast-header .close:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.15);
}

.toast.bg-warning {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%) !important;
  color: #212529;
}

.toast.bg-warning .toast-header {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%) !important;
  color: #212529;
}

.toast.bg-warning .toast-body {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%) !important;
  color: #212529;
}

.toast.bg-info {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%) !important;
  color: #ffffff;
}

.toast.bg-info .toast-header {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%) !important;
  color: #ffffff;
}

.toast.bg-info .toast-body {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%) !important;
  color: #ffffff;
}

.toast.bg-info .toast-header strong {
  color: #ffffff;
}

/* Toast sólido (solid) - header mejorado */
.toast.solid .toast-header {
  padding: 12px 16px 8px 16px;
  min-height: auto;
  border: none;
}

/* Ocultar header si está vacío o si el strong está vacío */
.toast.solid .toast-header:empty {
  display: none;
}

.toast.solid .toast-header strong:empty {
  display: none;
}

/* Si el header solo tiene el botón de cerrar (sin título), ocultarlo */
.toast.solid .toast-header:only-child {
  display: none;
}

.toast.solid .toast-body {
  padding: 16px 20px;
  font-weight: 500;
  font-size: 15px;
  line-height: 1.6;
}

/* Si el header está oculto (sin título), aumentar padding del body */
.toast.solid .toast-header:empty ~ .toast-body {
  padding: 18px 20px;
}

/* Workaround para toasts con Bootstrap 5 - forzar que se muestren */
.toast:not(.show) {
  display: block !important;
  opacity: 1 !important;
}

.toast.showing {
  opacity: 1 !important;
}

/* Animación de entrada suave */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast.show {
  animation: slideInRight 0.3s ease-out;
}
</style>
