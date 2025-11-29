<template>
  <div
    class="navigation-group"
    :class="{
      expanded: isExpanded,
      'mode-horizontal': mode === 'horizontal',
      'mode-lateral': mode === 'lateral',
      hovered: isHovered,
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="group-header"
      @click="toggleExpand"
      :class="{ 'has-active': hasActiveChild }"
    >
      <i :class="groupIcon" class="group-icon"></i>
      <span class="group-title">{{ groupName }}</span>
      <i
        class="fas fa-chevron-down expand-icon"
        :class="{ rotated: isExpanded }"
        v-if="mode === 'lateral'"
      ></i>
    </div>

    <!-- Dropdown para modo horizontal -->
    <transition name="dropdown" v-if="mode === 'horizontal'">
      <div v-show="isHovered" class="dropdown-menu-horizontal">
        <LinkNavigation
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :new_class="'link nuxt-link-active'"
          :icon="item.icon"
          :title="item.title"
          :mode="mode"
        />
      </div>
    </transition>

    <!-- Submenú para modo lateral -->
    <transition name="submenu" v-if="mode === 'lateral'">
      <div v-show="isExpanded" class="submenu-items lateral">
        <LinkNavigation
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :new_class="'link nuxt-link-active'"
          :icon="item.icon"
          :title="item.title"
          :mode="mode"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import LinkNavigation from "../LinkNavigation";

export default {
  components: {
    LinkNavigation,
  },
  props: {
    groupName: {
      type: String,
      required: true,
    },
    groupIcon: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    mode: {
      type: String,
      default: "horizontal",
      validator: (value) => ["horizontal", "lateral"].includes(value),
    },
    defaultExpanded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isExpanded: this.defaultExpanded || this.mode === "horizontal",
      isHovered: false,
    };
  },
  computed: {
    hasActiveChild() {
      if (!process.browser) return false;
      const currentPath = this.$route.path;
      return this.items.some((item) => {
        if (item.to === currentPath) return true;
        // También verificar si la ruta actual empieza con la ruta del item
        return (
          currentPath.startsWith(item.to) && item.to !== "/administratorsPages"
        );
      });
    },
  },
  watch: {
    mode(newMode) {
      // En modo horizontal, siempre expandido
      if (newMode === "horizontal") {
        this.isExpanded = true;
      } else if (newMode === "lateral" && !this.defaultExpanded) {
        // En modo lateral, colapsar si no está marcado como expandido por defecto
        this.isExpanded = false;
      }
    },
  },
  mounted() {
    // Asegurar que en modo horizontal siempre esté expandido
    if (this.mode === "horizontal") {
      this.isExpanded = true;
    }
  },
  methods: {
    toggleExpand() {
      if (this.mode === "lateral") {
        this.isExpanded = !this.isExpanded;
      }
    },
    handleMouseEnter() {
      if (this.mode === "horizontal") {
        this.isHovered = true;
      }
    },
    handleMouseLeave() {
      if (this.mode === "horizontal") {
        this.isHovered = false;
      }
    },
  },
};
</script>

<style scoped>
.navigation-group {
  position: relative;
}

.group-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  user-select: none;
}

.group-header:hover {
  background-color: #e9f6ff;
}

.group-header.has-active {
  background-color: #e9f6ff;
  color: #1ca4fc;
}

/* Modo horizontal - solo mostrar nombre de categoría */
.mode-horizontal .group-header {
  justify-content: center;
  padding: 8px 16px;
  white-space: nowrap;
}

.mode-horizontal .group-header:hover {
  background-color: #e9f6ff;
}

/* Modo lateral - ocupar todo el ancho */
.mode-lateral .group-header {
  justify-content: flex-start;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 4px;
  box-sizing: border-box;
}

.mode-lateral {
  width: 100%;
}

.mode-lateral.navigation-group {
  width: 100%;
}

.navigation-group.mode-lateral {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.group-icon {
  font-size: 20px;
  color: #5f5f5f;
  transition: color 0.3s ease;
}

.mode-horizontal .group-icon {
  display: none; /* Ocultar icono en modo horizontal */
}

.mode-lateral .group-icon {
  font-size: 18px;
  margin-right: 12px;
}

.group-header.has-active .group-icon {
  color: #1ca4fc;
}

.group-title {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  color: #212529;
  transition: color 0.3s ease;
}

.mode-horizontal .group-title {
  font-size: 15px;
  margin-left: 0;
}

.mode-lateral .group-title {
  flex: 1;
  margin-left: 0;
}

.group-header.has-active .group-title {
  color: #1ca4fc;
}

.expand-icon {
  font-size: 12px;
  color: #5f5f5f;
  transition: transform 0.3s ease, color 0.3s ease;
  margin-left: auto;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.group-header.has-active .expand-icon {
  color: #1ca4fc;
}

/* Dropdown para modo horizontal */
.dropdown-menu-horizontal {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 200px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 4px;
  white-space: nowrap;
}

/* Ajustar posición si está cerca del borde derecho */
.navigation-group:last-child .dropdown-menu-horizontal {
  left: auto;
  right: 0;
  transform: translateX(0);
}

.navigation-group:first-child .dropdown-menu-horizontal {
  left: 0;
  transform: translateX(0);
}

/* Submenú para modo lateral - ocupar todo el ancho */
.submenu-items.lateral {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  margin-top: 4px;
  padding-left: 0;
}

.submenu-items.lateral .link-container {
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}

/* Animaciones para dropdown horizontal */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Ajustar animación para dropdowns en los bordes */
.navigation-group:last-child .dropdown-enter,
.navigation-group:last-child .dropdown-leave-to {
  transform: translateX(0) translateY(-10px);
}

.navigation-group:last-child .dropdown-enter-to,
.navigation-group:last-child .dropdown-leave {
  transform: translateX(0) translateY(0);
}

.navigation-group:first-child .dropdown-enter,
.navigation-group:first-child .dropdown-leave-to {
  transform: translateX(0) translateY(-10px);
}

.navigation-group:first-child .dropdown-enter-to,
.navigation-group:first-child .dropdown-leave {
  transform: translateX(0) translateY(0);
}

/* Animaciones para submenú lateral */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-enter,
.submenu-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.submenu-enter-to,
.submenu-leave {
  transform: translateY(0);
  opacity: 1;
}
</style>
