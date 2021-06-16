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
                    </div>

                    <div class="modal-footer">
                        <button class="btn" @click="$emit('close')">{{textButton}}</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ['textTitle', 'textBody', 'textButton']
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
        margin: 15px 0px;
    }

    .modal-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 35%;
        /* height: 318px; */
        margin: 0px auto;
        padding: 24px 24px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
        transition: all .3s ease;
        font-family: Montserrat;
    }

    .modal-footer button {
        width: 100%;
        color: #FFF;
        padding: 14px 20px;
        background: #1CA4FC;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 0px 24px;
    }

    .close-btn {
        color: #DB1212;
    }

    .modal-header {
        border-bottom: 0;
    }

    .modal-title {
        margin: 0;
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
    }

    .modal-body {
        font-size: 14px;
    }

    .modal-body p {
        margin: 0;
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