<template>
  <div>
    <LoginNav />
    <Login />
  </div>
</template>

<script>
import LoginNav from '@/components/navs/login.nav.vue';
import Login from '@/components/login.vue';

export default {
  components: {
    LoginNav,
    Login,
  },
};
</script>

<style scoped></style>
