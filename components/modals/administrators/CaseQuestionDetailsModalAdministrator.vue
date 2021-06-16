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
                                <h3>Dificultad</h3>
                                <select v-model="dificultySelected" name="" id="">
                                    <option value="" selected disabled>Dificultad</option>
                                    <option value="1">Baja</option>
                                    <option value="2">Moderada</option>
                                    <option value="3">Alta</option>
                                </select>
                            </div>

                            <div class="type-container">
                                <h3>Tipo</h3>
                                <select v-model="typeSelected" name="" id="">
                                    <option value="" disabled>Tipo</option>
                                    <option :value="types.display" v-for="types in typ" :key="types._id">{{ types.display }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="editor-container">
                            <p>Pregunta</p>

                            <quill-editor
                                class="editor"
                                :options="editorOption"
                                @change="onEditorChangeQuestion($event)"
                                @ready="onEditorReadyQuestion($event)" />
                        </div>

                        <div class="answers-container">
                            <p>Respuestas</p>
                            <div class="answers">
                                <div class="ans-cont">
                                    <p>A)</p>
                                    <quill-editor
                                        class="text"
                                        :options="editorOptionAnswer"
                                        @change="onEditorChangeAnswer1($event)"
                                        @ready="onEditorReadyAnswer1($event)" />
                                    
                                    <label class="radio-container">
                                        <input type="radio" name="answer" v-model="correctAnswer" value="1">
                                        <span class="checkmark"></span>
                                    </label>
                                </div>

                                <div class="ans-cont">
                                    <p>B)</p>
                                    <quill-editor
                                        class="text"
                                        :options="editorOptionAnswer"
                                        @change="onEditorChangeAnswer2($event)"
                                        @ready="onEditorReadyAnswer2($event)" />
                                        
                                    <label class="radio-container">
                                        <input type="radio" name="answer" v-model="correctAnswer" value="2">
                                        <span class="checkmark"></span>
                                    </label>
                                </div>

                                <div class="ans-cont">
                                    <p>C)</p>
                                    <quill-editor
                                        class="text"
                                        :options="editorOptionAnswer"
                                        @change="onEditorChangeAnswer3($event)"
                                        @ready="onEditorReadyAnswer3($event)" />
                                        
                                    <label class="radio-container">
                                        <input type="radio" name="answer" v-model="correctAnswer" value="3">
                                        <span class="checkmark"></span>
                                    </label>
                                </div>

                                <div class="ans-cont">
                                    <p>D)</p>
                                    <quill-editor
                                        class="text"
                                        :options="editorOptionAnswer"
                                        @change="onEditorChangeAnswer4($event)"
                                        @ready="onEditorReadyAnswer4($event)" />
                                        
                                    <label class="radio-container">
                                        <input type="radio" name="answer" v-model="correctAnswer" value="4">
                                        <span class="checkmark"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="retro">
                            <p>Retroalimentación y referencia</p>

                            <quill-editor
                                class="editor"
                                :options="editorOption"
                                @change="onEditorChangeRetro($event)"
                                @ready="onEditorReadyRetro($event)" />
                        </div>
                    </div>

                    <div class="modal-footer">
                        <!-- Loader -->
                        <div class="load-container">
                            <div class="lds-dual-ring" v-if="isBusy"></div>
                        </div>

                        <button type="button" class="btn accept" data-dismiss="modal" @click="updateQuestion">
                            <i class="fas fa-save"></i>
                            Guardar y regresar al caso
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ['toUpdate', 'typ', 'case'],
    data() {
        return {
            isBusy: false,
            dificultySelected: '',
            typeSelected: '',
            correctAnswer: this.toUpdate.correct_answer,
            answer1: '',
            answer1Html: '',
            answer2: '',
            answer2Html: '',
            answer3: '',
            answer3Html: '',
            answer4: '',
            answer4Html: '',

            questionContent: '',
            questionHtml: '',

            retroContent: '',
            retroHtml: '',
            editorOption: {
                theme: 'snow',
                placeholder: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti veniam, illum esse sunt soluta iste deleniti, ab autem alias magnam sapiente, ipsam officiis eveniet laborum sint? Eum exercitationem alias maiores?',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'], 
                        [{ 'align': [] }, { 'list': 'ordered'}, { 'list': 'bullet' },{ 'indent': '-1'}, { 'indent': '+1' }, { 'script': 'sub'}, { 'script': 'super' }],
                        ['link', 'image']
                    ]
                }
            },
            editorOptionAnswer: {
                theme: 'bubble',
                placeholder: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            }
        }
    },
    methods: {
        onEditorReadyQuestion(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.toUpdate.question.content.ops)))
        },
        onEditorReadyAnswer1(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.toUpdate.answers[0].content.ops)))
        },
        onEditorReadyAnswer2(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.toUpdate.answers[1].content.ops)))
        },
        onEditorReadyAnswer3(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.toUpdate.answers[2].content.ops)))
        },
        onEditorReadyAnswer4(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.toUpdate.answers[3].content.ops)))
        },
        onEditorReadyRetro(quill) {
            quill.setContents(JSON.parse(JSON.stringify(this.toUpdate.retro.content.ops)))
        },
        onEditorChangeQuestion({ quill, html, text }) {
            this.questionContent = quill.getContents();
            this.questionHtml = quill.root.innerHTML;
        },
        onEditorChangeAnswer1({ quill, html, text }) {
            this.answer1 = quill.getContents();
            this.answer1Html = quill.root.innerHTML;
        },
        onEditorChangeAnswer2({ quill, html, text }) {
            this.answer2 = quill.getContents();
            this.answer2Html = quill.root.innerHTML;
        },
        onEditorChangeAnswer3({ quill, html, text }) {
            this.answer3 = quill.getContents();
            this.answer3Html = quill.root.innerHTML;
        },
        onEditorChangeAnswer4({ quill, html, text }) {
            this.answer4 = quill.getContents();
            this.answer4Html = quill.root.innerHTML;
        },
        onEditorChangeRetro({ quill, html, text }) {
            this.retroContent = quill.getContents();
            this.retroHtml = quill.root.innerHTML;
        },
        async updateQuestion() {
            try {
                this.isBusy = !this.isBusy;
                
                let updateQuestionResponse = await this.$axios.put('/updateBankQuestion', {
                    question_id: this.toUpdate._id,
                    index: this.toUpdate.index,
                    importance: this.dificultySelected,
                    type: this.typeSelected,
                    question: {
                        content: this.questionContent,
                        html: this.questionHtml
                    },
                    answers: [
                        {
                            id: this.toUpdate.answers[0].id,
                            content: this.answer1,
                            html: this.answer1Html
                        },
                        {
                            id: this.toUpdate.answers[1].id,
                            content: this.answer2,
                            html: this.answer2Html
                        },
                        {
                            id: this.toUpdate.answers[2].id,
                            content: this.answer3,
                            html: this.answer3Html
                        },
                        {
                            id: this.toUpdate.answers[3].id,
                            content: this.answer4,
                            html: this.answer4Html
                        }
                    ],
                    correct_answer: this.correctAnswer,
                    retro: {
                        content: this.retroContent,
                        html: this.retroHtml
                    }
                })

                this.$emit('update:data', {
                    updated: updateQuestionResponse.data.payload,
                    indexInArray: this.toUpdate.indexInArray
                })
    
                // console.log(updateQuestionResponse)
                alert(updateQuestionResponse.data.message);

                // setTimeout(() => {
                    this.isBusy = !this.isBusy;
                    this.$emit('reload')
                    this.$emit('close');
                // }, 1500);
            } catch (err) {
                console.log(err)
            }
        }
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
        width: 30%;
        margin: 10px 20px;
    }

    .dificulty-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .dificulty-container select {
        width: 100%;
        border: 0px;
        outline: 0px;
        border-bottom: 1px solid lightgray;
    }

    .type-container {
        width: 30%;
        margin: 10px 20px;
    }

    .type-container h3 {
        color: #1CA4FC;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 12px;
    }

    .type-container select {
        width: 100%;
        border: 0px;
        outline: 0px;
        border-bottom: 1px solid lightgray;
    }

    .editor-container {
        display: flex;
        flex-direction: column;
        height: 250px;
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
        background: #20B000;
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

    /* estilos para el loading predeterminado */
    .load-container {
        display: flex;
        justify-content: center;
    }

    .lds-dual-ring {
        display: inline-block;
        width: 50px;
        height: 50px;
        margin: 0px auto;
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