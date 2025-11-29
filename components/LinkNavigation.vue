<template>
  <div class="link-container" :class="{ 'is-collapsed': isCollapsed }">
    <NuxtLink :to="to" :class="new_class"> <i :class="icon"></i></NuxtLink>
    <p class="link-title" v-if="!isCollapsed">{{ title }}</p>
  </div>
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
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1), all 0.2s ease;
}

.link-container.is-collapsed {
  justify-content: center;
  padding: 10px;
}

.link-container:hover {
  background-color: #e9f6ff;
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
  transition: opacity 0.2s ease, width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  white-space: nowrap;
}

.link-container.is-collapsed .link-title {
  width: 0;
  opacity: 0;
  margin: 0;
}

a:hover {
  color: #fff;
  background-color: #ff9300;
  border-color: #afc7dd;
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

.nuxt-link-exact-active {
  color: #fff;
  background-color: #ff9300;
  border-color: #ff9300;
}

.link-container .nuxt-link-exact-active + .link-title {
  color: #ff9300;
  font-weight: 600;
}
</style>
