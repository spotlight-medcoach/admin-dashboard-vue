<template>
    <div>
        <Navigation />
        <h1>Profile</h1>
        <CancelButton :text="'Cerrar sesión'" :click="logout" />

        <ModalConfirm v-if="isShowModal" @close="closeModal" :text="textModal" />
    </div>
</template>

<script>
import Navigation from '../../components/Navigation';
import CancelButton from '../../components/CancelButton';
import ModalConfirm from '../../components/ModalConfirm';

export default {
    data() {
        return {
            isShowModal: false,
            textModal: ''
        }
    },
    components: {
        Navigation,
        CancelButton,
        ModalConfirm
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
            }, 2000)
        },
        closeModal() {
            this.isShowModal = !this.isShowModal;
        }
    }
}
</script>

<style>

</style>