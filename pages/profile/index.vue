<template>
    <div>
        <Navigation />
        <h1>Profile</h1>

        <!-- <ModalConfirm v-if="isShowModal" @close="closeModal" :text="textModal" /> -->
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
// import ModalConfirm from '../../components/ModalConfirm';

export default {
    components: {
        Navigation,
        // ModalConfirm
    },
    data() {
        return {
            isShowModal: false,
            textModal: ''
        }
    },
    methods: {
        logout() {
            this.isShowModal = !this.isShowModal;
            this.textModal = 'Cerrando sesión...'

            setTimeout(() => {
                this.$router.push({ path: '/' });

                this.$store.dispatch('killSession')
                localStorage.clear();
                this.isShowModal = !this.isShowModal
            }, 1000)
        },
        closeModal() {
            this.isShowModal = !this.isShowModal;
        }
    }
}
</script>

<style scoped>

</style>