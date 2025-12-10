<template>
  <NuxtLink :to="to" class="link-container-link">
    <div class="link-container" :class="{ 'is-collapsed': isCollapsed }">
      <div :class="`${new_class} icon-container`"><i :class="icon"></i></div>
      <p class="link-title" v-if="!isCollapsed">{{ title }}</p>
    </div>
  </NuxtLink>
</template>

<script>
export default {
  props: {
    to: String,
    new_class: String,
    icon: String,
    title: String,
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.link-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 4px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  /* Usar variable CSS para la velocidad */
  transition: padding var(--sidebar-transition-duration, 0.5s)
    var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  --sidebar-transition-duration: 0.5s;
  --sidebar-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}

a.link-container-link {
  text-decoration: none;
}

.link-container.is-collapsed {
  justify-content: center;
  padding: 10px;
}

.link-container:hover {
  background-color: rgba(233, 246, 255, 0.6);
}

.link-title {
  margin: 0;
  margin-left: 12px;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: #212529;
  text-align: left;
  flex: 1;
  /* Usar variable CSS para la velocidad - ocultar texto detrás del contenedor */
  transition: opacity var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    width var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    margin var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  --sidebar-transition-duration: 0.5s;
  --sidebar-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}

.link-container.is-collapsed .link-title {
  width: 0;
  opacity: 0;
  margin: 0;
  overflow: hidden;
}

.link-container:hover .icon-container {
  color: #fff;
  background-color: #ff9300;
  border-color: #ff9300;
}

.link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #ffffff;
  background: #5f5f5f;
  border-radius: 50%;
  border: 1px solid #5f5f5f;
  text-decoration: none;
  transition: all 0.2s ease;
}

.link-container .link {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.nuxt-link-exact-active .link-container {
  background-color: rgba(233, 246, 255, 0.6);
}

.nuxt-link-exact-active .icon-container {
  color: #fff;
  background-color: #ff9300;
  border-color: #ff9300;
}

.link-container .nuxt-link-exact-active + .link-title {
  color: #ff9300;
  font-weight: 600;
}
</style>
