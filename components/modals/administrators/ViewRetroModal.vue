<template>
    <transition name="modal">
        <div class="modal-mask" tabindex="-1" role="dialog">
            <div class="modal-wrapper" role="document">
                <div class="modal-container">
                    <div class="modal-header">
                        <span class="modal-title">Retroalimentación</span>
                        <button class="fas fa-times btn close-btn" @click="$emit('close')"></button>
                    </div>
                    <div class="modal-body">
                        <quill-editor
                            :options="editorOptionAnswer"
                            @change="onEditorChange($event)"
                            @ready="onEditorReady($event)" />
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn accept" data-dismiss="modal" @click="$emit('close')"><i class="fas fa-check-circle"></i>Listo</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ['feedback'],
    data() {
        return {
            contentDescription: this.feedback,
            contentHtml: '',
            editorOptionAnswer: {
                theme: 'bubble',
                placeholder: 'Retroalimentación para el caso...',
            }
        }
    },
    methods: {
        onEditorReady(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.feedback.content.ops)))
        },
        onEditorChange({ quill, html, text }) {
            this.contentDescription = quill.getContents();
            this.contentHtml = quill.root.innerHTML;
        },
    }
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

    .modal-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 70%;
        margin: 0px auto;
        padding: 24px 24px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
        transition: all .3s ease;
        font-family: Montserrat;
    }

    .modal-footer {
        border-top: 0;
        padding: 0;
        margin: 0px 0px;
    }

    .modal-footer i {
        margin: 0px 10px;
    }

    .modal-footer button {
        /* width: 30%; */
        height: 48px;
        font-size: 1rem;
        padding-right: 20px;
    }

    .close-btn {
        color: #DB1212;
    }

    .accept {
        background: #1CA4FC;
        color: #FFF;
        border-radius: 10px;
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
        margin: 0px;
        padding: 0px;
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