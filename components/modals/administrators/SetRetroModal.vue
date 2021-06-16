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

                        <quill-editor
                            :options="editorOptionAnswer"
                            @change="onEditorChange($event)"
                            @ready="onEditorReady($event)" />
                    </div>

                    <div class="modal-footer">
                        <!-- Loader -->
                        <div class="load-container">
                            <div class="lds-dual-ring" v-if="busy"></div>
                        </div>

                        <button type="button" class="btn accept" data-dismiss="modal" @click="setRetro"><i class="fas fa-check-circle"></i>{{textButton}}</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ['textTitle', 'textBody', 'textButton', 'isBusy', 'case_id', 'feedback'],
    data() {
        return {
            busy: false,

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
        async setRetro() {
            this.busy = !this.busy;

            console.log('retro', this.retro)
            console.log('contentDescription', this.contentDescription)
            let retroResponse = await this.$axios.put('/setFeedback', {
                case_id: this.case_id,
                feedback: {
                    content: this.contentDescription,
                    html: this.contentHtml
                }
            })

            alert(retroResponse.data.message);

            this.busy = !this.busy;
            this.$emit('update:data', {
                content: this.contentDescription,
                html: this.contentHtml
            })
            this.$emit('feed')
            this.$emit('close');
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

    .quill-editor {
        margin-top: 1%;
        border: 1px solid #000000;
        box-sizing: border-box;
        border-radius: 10px;
        height: 150px;
    }

    .modal-footer {
        border-top: 0;
        padding: 0;
        margin: 15px 0px;
    }

    .modal-footer i {
        margin: 0px 10px;
    }

    .modal-footer button {
        width: 30%;
        height: 48px;
        font-size: 1rem;
    }

    .close-btn {
        color: #DB1212;
    }

    .accept {
        background: #20B000;
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

    /* estilos para el loading predeterminado */
    .load-container {
        display: flex;
        justify-content: center;
        margin: 0px 40px;
    }

    .lds-dual-ring {
        display: inline-block;
        width: 50px;
        height: 50px;
    }

    .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 44px;
        height: 44px;
        /* margin: 8px; */
        border-radius: 50%;
        border: 6px solid #FE9400;
        border-color: #FE9400 transparent #FE9400 transparent;
        animation: lds-dual-ring 1.2s linear infinite;
    }

    @keyframes lds-dual-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>