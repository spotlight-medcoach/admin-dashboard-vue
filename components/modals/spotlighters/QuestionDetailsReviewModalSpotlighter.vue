<template>
    <transition name="modal">
        <div class="modal-mask" tabindex="-1" role="dialog">
            <div class="modal-wrapper" role="document">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Detalles de pregunta</h3>
                        <button class="fas fa-times btn close-btn" @click="$emit('close')"></button>
                    </div>

                    <div class="modal-body">
                        <div class="dificulty-type">
                            <div class="dificulty-container">
                                <h3>Dificultad: </h3>
                                {{ question.importance == 1 ? 'Baja' : question.importance == 2 ? 'Moderada' : 'Alta' }}
                            </div>

                            <div class="type-container">
                                <h3>Tipo: </h3>
                                {{question.type}}
                            </div>
                        </div>

                        <div class="editor-container">
                            <p>Pregunta</p>

                            <quill-editor
                                disabled
                                v-model="contentQuestion"
                                :options="editorOption"
                                @ready="onEditorReadyQuestion($event)" />
                        </div>

                        <div class="answers-container">
                            <p>Respuestas</p>

                            <div class="answers">
                                <div class="ans-cont" value="1">
                                    <p>A)</p>
                                    <quill-editor
                                        disabled
                                        class="text"
                                        v-model="contentQuestion"
                                        :options="editorOption"
                                        @ready="onEditorReadyAnswer1($event)" />

                                    <label class="radio-container">
                                        <input disabled type="radio" name="answer" v-model="correctAnswer" value="1">
                                        <span class="checkmark"></span>
                                    </label>
                                </div>

                                <div class="ans-cont" value="2">
                                    <p>B)</p>
                                    <quill-editor
                                        disabled
                                        class="text"
                                        v-model="contentQuestion"
                                        :options="editorOption"
                                        @ready="onEditorReadyAnswer2($event)" />
                                        
                                    <label class="radio-container">
                                        <input disabled type="radio" name="answer" v-model="correctAnswer" value="2">
                                        <span class="checkmark"></span>
                                    </label>
                                </div>

                                <div class="ans-cont" value="3">
                                    <p>C)</p>
                                    <quill-editor
                                        disabled
                                        class="text"
                                        v-model="contentQuestion"
                                        :options="editorOption"
                                        @ready="onEditorReadyAnswer3($event)" />
                                    
                                    <label class="radio-container">
                                        <input disabled type="radio" name="answer" v-model="correctAnswer" value="3">
                                        <span class="checkmark"></span>
                                    </label>
                                </div>

                                <div class="ans-cont" value="4">
                                    <p>D)</p>
                                    <quill-editor
                                        disabled
                                        class="text"
                                        v-model="contentQuestion"
                                        :options="editorOption"
                                        @ready="onEditorReadyAnswer4($event)" />
                                        
                                    <label class="radio-container">
                                        <input disabled type="radio" name="answer" v-model="correctAnswer" value="4">
                                        <span class="checkmark"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="retro">
                            <p>Retroalimentación y referencia</p>

                            <quill-editor
                                disabled
                                v-model="contentQuestion"
                                :options="editorOption"
                                @ready="onEditorReadyRetro($event)" />
                        </div>
                    </div>

                    <div class="modal-footer">
                        <!-- Loader -->
                        <!-- <div class="load-container">
                            <div class="lds-dual-ring" v-if="isBusy"></div>
                        </div> -->

                        <button type="button" class="btn accept" data-dismiss="modal" @click="$emit('close')">Regresar al caso</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ['question'],
    data() {
        return {
            contentQuestion: '',
            answer1: '',
            answer2: '',
            answer3: '',
            answer4: '',
            retro: '',
            correctAnswer: this.question.correct_answer,
            editorOption: {
                theme: 'bubble',
                placeholder: 'Respuesta...',
            }
        }
    },
    methods: {
        onEditorReadyQuestion(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.question.question.content.ops)))
        },
        onEditorReadyAnswer1(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.question.answers[0].content.ops)))
        },
        onEditorReadyAnswer2(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.question.answers[1].content.ops)))
        },
        onEditorReadyAnswer3(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.question.answers[2].content.ops)))
        },
        onEditorReadyAnswer4(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.question.answers[3].content.ops)))
        },
        onEditorReadyRetro(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.question.retro.content.ops)))
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
        overflow-y: initial !important;
    }

    .modal-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 90%;
        margin: 0px auto;
        padding: 12px 12px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
        transition: all .3s ease;
        font-family: Montserrat;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        border-bottom: 0;
    }

    .modal-header h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 20px;
        line-height: 24px;
        display: flex;
        color: #212529;
    }

    .modal-body {
        font-size: 14px;
        padding: 0px;
        height: 75vh;
        overflow-y: auto;
    }

    .dificulty-type {
        display: flex;
        flex-direction: row;
    }

    .dificulty-container {
        display: flex;
        flex-direction: row;
        margin: 10px 20px;
    }

    .dificulty-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
        margin-right: 8px;
    }

    .type-container {
        display: flex;
        flex-direction: row;
        margin: 10px 20px;
    }

    .type-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
        margin-right: 8px;
    }

    .editor-container {
        display: flex;
        flex-direction: column;
        /* height: 250px; */
    }

    .editor-container p {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #000000;
        padding: 0px 20px;
        margin: 20px 0px;
    }

    .editor {
        margin: 0px 20px;
    }

    .quill-editor {
        height: 60%;
    }

    .answers-container {
        display: flex;
        flex-direction: column;
        margin: 20px 0px;
    }

    .answers-container p {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #000000;
        margin: 0px 20px;
        padding: 0;
    }

    .ans-cont {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 10px 20px;
        margin: 0px 20px;
        border-bottom: 1px solid gray;
    }

    .ans-cont p {
        margin: 0;
    }








    .radio-container {
        display: block;
        position: relative;
        cursor: pointer;
        font-size: 22px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        width: 0;
        margin: 0px 25px;
        margin-bottom: 20px;
    }

    /* Hide the browser's default radio button */
    .radio-container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }

    /* Create a custom radio button */
    .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 25px;
        width: 25px;
        background-color: #eee;
        border-radius: 50%;
    }

    /* On mouse-over, add a grey background color */
    .radio-container:hover input ~ .checkmark {
        background-color: #ccc;
    }

    /* When the radio button is checked, add a blue background */
    .radio-container input:checked ~ .checkmark {
        background-color: #20B000;
    }

    /* Create the indicator (the dot/circle - hidden when not checked) */
    .checkmark:after {
        content: "";
        position: absolute;
        display: none;
    }

    /* Show the indicator (dot/circle) when checked */
    .radio-container input:checked ~ .checkmark:after {
        display: block;
    }

    /* Style the indicator (dot/circle) */
    .radio-container .checkmark:after {
        top: 9px;
        left: 9px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: white;
    }










    .text {
        width: 97%;
        outline: none;
        border: 0;
    }

    .ans-cont input:focus {
        outline: none;
    }

    .retro {
        display: flex;
        flex-direction: column;
        margin: 20px 0px;
        height: 250px;
    }

    .retro p {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #000000;
        margin: 20px 20px;
    }

    .modal-footer {
        justify-content: flex-end;
        border-top: 0;
        padding: 0;
    }

    .modal-footer button {
        color: #FFF;
        background: #1CA4FC;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        padding: 12px 20px;
        margin: 0px 24px;
    }

    .close-btn {
        color: #DB1212;
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