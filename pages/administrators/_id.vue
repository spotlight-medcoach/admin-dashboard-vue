<template>
    <div>
        <Navigation />
        <h1>Editar administrador</h1>
        <h3>{{ user_data }}</h3>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';

export default {
    components: {
        Navigation
    },
    data() {
        return {
            user_data: {}
        }
    },
    created() {
        this.getUser();
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
    },
    methods: {
        getUser() {
            // if (process.browser) {
                this.$axios
                .get(`/getOneAdminUser?user_id=${this.$route.params.id}`/* , {
                    user_id: $route.params.id
                } */)
                .then(res => {
                    this.user_data = res;
                    console.log('response: ', res);
                })
                .catch(err => {
                    console.log('Error: ', err);
                    alert('Error: ', err);
                });
            // }
        }
    }
}
</script>

<style scoped>

</style>