<template>
    <div class="modal-container-options">
        <div class="modal-body-options">
            <div class="notifications">
                <button type="button" class="btn" @click="notf">
                    <i class="fas fa-bell"></i>
                    Notificaciones
                </button>
            </div>
            <div class="configuration">
                <button type="button" class="btn" @click="conf">
                    <i class="fas fa-cog"></i>
                    Configuración
                </button>
            </div>
            <div class="logout">
                <button type="button" class="btn" @click="logout">
                    <i class="fas fa-sign-in-alt"></i>
                    Cerrar sesión
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {

        }
    },
    methods: {
        notf() {
            alert('Notificaciones');
        },
        conf() {
            alert('Configuración');
        },
        logout() {
            this.isShowModal = !this.isShowModal;
            this.textModal = 'Cerrando sesión...'

            setTimeout(() => {
                this.$router.push({ path: '/' });

                this.$store.dispatch('killSession')
                localStorage.clear();
                this.isShowModal = !this.isShowModal
            }, 1000)
        }
    }
}
</script>

<style>
    .modal-container-options {
        display: flex;
        flex-direction: column;
        position: absolute;
        right: 7%;
        top: 15%;
        padding: 12px;
        box-shadow: 0px 0px 20px #D4D5D7;
        border-radius: 10px;
    }

    .modal-body-options {
        font-family: Montserrat;
    }
</style>