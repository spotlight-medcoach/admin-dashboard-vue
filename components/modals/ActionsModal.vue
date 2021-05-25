<template>
    <transition name="modal">
        <div class="modal-mask" @click="close" v-show="show">
            <div class="modal-container" @click.stop>
                <div class="modal-body">
                    <div class="notifications">
                        <button type="button" class="btn" @click="update">
                            <i class="fas fa-pencil-alt"></i>
                            Editar usuario
                        </button>
                    </div>
                    <div class="configuration">
                        <button type="button" class="btn" @click="setInactive">
                            <i class="fas fa-trash"></i>
                            Eliminar usuario
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ['show', 'user'],
    data() {
        return {

        }
    },
    methods: {
        close() {
            this.$emit('close');
        },
        async update() {
            console.log(this.user);
        },
        async setInactive() {
            console.log(this.user)
        }
    }
}
</script>

<style scoped>
    .modal-mask {
        display: flex;
        position: fixed;
        justify-content: flex-end;
        z-index: 9998;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        font-family: Montserrat;
    }

    .modal-container {
        display: flex;
        position: relative;
        /* width: 16%; */
        height: 16%;
        margin: 5%;
        top: auto;
        justify-content: space-evenly;
        background-color: #fff;
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
        transition: all .3s ease;
        box-shadow: 0px 0px 20px #D4D5D7;
        border-radius: 10px;
    }

    /* .modal-container i {
        margin-right: .5rem;
    } */
</style>