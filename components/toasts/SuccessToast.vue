<template>
    <transition name="modal">
        <div class="modal-mask" tabindex="-1" role="dialog">
            <div class="modal-wrapper" role="document">
                <div class="modal-container">
                    <div class="modal-header">
                        <span class="modal-title">{{ textTitle }}</span>
                        <!-- <button class="fas fa-times btn close-btn" @click="$emit('close')"></button> -->
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ['textTitle']
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
        display: table;
        transition: opacity .3s ease;
    }

    .modal-wrapper {
        display: flex;
        justify-content: flex-end;
    }

    .modal-container {
        display: flex;
        flex-direction: column;
        width: 25%;
        margin: 40px 40px;
        padding: 24px 24px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
        transition: all .3s ease;
        font-family: Montserrat;
        opacity: .9;
        background: #20B000;
    }

    .modal-header {
        border-bottom: 0;
        padding: 0;
    }

    .modal-enter .modal-container,
    .modal-leave-active .modal-container {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
    }
</style>