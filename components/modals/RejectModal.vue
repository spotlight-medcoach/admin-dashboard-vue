<template>
    <transition name="modal">
        <div class="modal-mask" tabindex="-1" role="dialog">
            <div class="modal-wrapper" role="document">
                <div class="modal-container">
                    <div class="modal-header">
                        <span class="modal-title">{{ textTitle }}</span>
                        <button class="fas fa-times btn close-btn" @click="$emit('close')"></button>
                    </div>
                    <div class="modal-body">
                        <p>{{ textBody }}</p>
                        <p>{{ name }}</p>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn" data-dismiss="modal" @click="$emit('close')">Cancelar</button>
                        <button type="button" class="btn delete" data-dismiss="modal" @click="action">Rechazar caso</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ['textTitle', 'textBody', 'name', 'action']
}
</script>

<style scoped>
    .modal-mask {
        position: fixed;
        z-index: 9998;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .5);
        display: table;
        transition: opacity .3s ease;
    }

    .modal-wrapper {
        display: table-cell;
        vertical-align: middle;
    }

    .modal-footer {
        justify-content: space-between;
        border-top: 0;
        padding: 0;
    }

    .modal-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 35%;
        height: 318px;
        margin: 0px auto;
        padding: 24px 24px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
        transition: all .3s ease;
        font-family: Montserrat;
    }

    .modal-footer button {
        width: 40%;
        height: 48px;
    }

    .close-btn {
        color: #DB1212;
    }

    .delete {
        background: #DB1212;
        color: #FFF;
    }

    .modal-header {
        border-bottom: 0;
    }

    .modal-title {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
    }

    .modal-body {
        margin: 20px 0;
        font-size: 14px;
    }

    .modal-default-button {
        float: right;
    }

    .modal-enter {
        opacity: 0;
    }

    .modal-leave-active {
        opacity: 0;
    }

    .modal-enter .modal-container,
    .modal-leave-active .modal-container {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
    }
</style>