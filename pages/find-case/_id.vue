<template>
  <div>
    <Navigation />
    <!-- <h1>{{this.$route.params.id}}</h1> -->

    <div class="case-container">
      <nuxt-link to="/findCase">
        <i class="fas fa-chevron-left"></i>
        Volver
      </nuxt-link>

      <Loading v-if="loading" />
      <div v-if="!loading" class="header-container">
        <h1>Detalles del caso</h1>

        <div class="buttons-container">
          <button type="button" class="btn cancel" @click="discardConfirm">
            <i class="fas fa-trash mr-2"></i> Descartar caso
          </button>
        </div>
      </div>

      <!-- Card con los detalles del caso -->
      <CaseBankDetailsCard
        v-if="!loading"
        :caseName="caseDetails.name"
        :id="caseDetails.spotlight_id"
        :language="caseDetails.language"
        :topic="caseDetails.name_topic"
        :subtopic="caseDetails.name_subtopic"
      />

      <div v-if="!loading" class="description-container">
        <h1>Descripción del caso</h1>

        <quill-editor
          :options="editorOption"
          @ready="onEditorReady($event)"
          @change="onEditorChange($event)"
        />
      </div>

      <div v-if="!loading" class="questions-container">
        <h1>Preguntas</h1>

        <div class="each-question">
          <QuestionCardAdministrator
            v-for="(ques, index) in questions"
            :key="ques._id"
            :question="ques.question.content.ops[0].insert"
            :ind="index"
            @update="updateQuestion(questions[index], index)"
            @delete="deleteQuestionConfirm(questions[index])"
          />
        </div>
        <div class="add-question-container">
          <button class="btn" @click="addQuestionModal">
            <i class="fas fa-plus-circle"></i> Agregar pregunta
          </button>
        </div>
      </div>

      <div v-if="!loading" class="save-container">
        <!-- Loader -->
        <div class="lds-dual-ring" v-if="busy"></div>

        <button class="btn send" @click="saveCase">
          <i class="fas fa-paper-plane"></i> Guardar caso
        </button>
      </div>
    </div>

    <!-- Agregar pregunta -->
    <AddCaseQuestion
      v-if="isShowAddQuestionModal"
      :typ="types"
      @close="closeAddQuestionModal"
      :data.sync="questionData"
      @addQues="addQuestion"
    />

    <!-- Detalle de pregunta -->
    <CaseQuestionDetailsModal
      v-if="isShowCaseQuestionDetailsModal"
      @close="closeUpdateQuestionModal"
      @reload="reloadQuestions"
      :toUpdate="questionToUpdate"
      :typ="types"
      :case="caseDetails._id"
      :data.sync="questionUpdated"
    />

    <!-- Eliminar pregunta -->
    <RejectModal
      v-if="isShowDeleteQuestionModal"
      @close="closeRejectDeleteQuestionModal"
      :textTitle="titleModal"
      :textBody="bodyModal"
      :action="deleteQuestion"
      :textButton="button"
      :isBusy="busyDeleteQuestion"
    />

    <!-- Descartar caso -->
    <RejectModal
      v-if="isShowDiscardCaseModal"
      @close="closeDiscardCaseModal"
      :textTitle="titleModal"
      :textBody="bodyModal"
      :action="discardCase"
      :textButton="button"
      :isBusy="busyDiscard"
    />

    <SuccessToast v-if="showSuccessToast" :textTitle="titleToast" />

    <FailToast v-if="showFailToast" :textTitle="titleToast" />
  </div>
</template>

<script>
import Navigation from '@/components/navs/navigation.vue';
import Loading from '@/components/modals/loading.modal.vue';
import CaseBankDetailsCard from '@/components/cards/administrators/case-bank-details.card.vue';
import QuestionCardAdministrator from '@/components/cards/administrators/question-administrator.card.vue';
import AddCaseQuestion from '@/components/modals/administrators/add-case-question.modal.vue';
import CaseQuestionDetailsModal from '@/components/modals/administrators/case-question-details.modal.vue';
import RejectModal from '@/components/modals/reject.modal.vue';
import SuccessToast from '@/components/toasts/success.toast.vue';
import FailToast from '@/components/toasts/fail.toast.vue';

export default {
  components: {
    Navigation,
    Loading,
    CaseBankDetailsCard,
    QuestionCardAdministrator,
    AddCaseQuestion,
    CaseQuestionDetailsModal,
    RejectModal,
    SuccessToast,
    FailToast,
  },
  data() {
    return {
      loading: false,
      busy: false,
      isShowDiscardCaseModal: false,
      busyDiscard: false,
      isShowAddQuestionModal: false,
      isShowCaseQuestionDetailsModal: false,
      isShowDeleteQuestionModal: false,
      busyDeleteQuestion: false,

      topics: [],
      types: [],
      caseDetails: {},
      questions: [],
      questionData: {},
      questionToUpdate: {},
      questionUpdated: {},
      questionToDelete: '',
      indexQuestion: 0,

      titleModal: '',
      bodyModal: '',
      button: '',
      titleToast: '',
      showSuccessToast: false,
      showFailToast: false,

      contentDescription: '',
      contentHtml: '',
      editorOption: {
        theme: 'snow',
        placeholder: 'Descripción del caso...',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [
              { align: [] },
              { list: 'ordered' },
              { list: 'bullet' },
              { indent: '-1' },
              { indent: '+1' },
              { script: 'sub' },
              { script: 'super' },
            ],
            ['link', 'image'],
          ],
        },
      },
    };
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;
      this.topics = JSON.parse(localStorage.getItem('topics'));
      this.types = JSON.parse(localStorage.getItem('types'));
    }

    await this.getCaseDetails();
    console.log(this.caseDetails.content);
  },
  methods: {
    onEditorReady(quill) {
      quill.setContents(
        JSON.parse(JSON.stringify(this.caseDetails.content.quill.ops))
      );
    },
    onEditorChange({ quill }) {
      this.contentDescription = quill.getContents();
      this.contentHtml = quill.root.innerHTML;
    },
    async getCaseDetails() {
      try {
        this.loading = !this.loading;

        let caseDetailsResponse = await this.$axios.get('/getCaseFromBank', {
          params: { case_id: this.$route.params.id },
        });
        this.caseDetails = caseDetailsResponse.data.payload;
        this.questions = caseDetailsResponse.data.payload.questions;

        this.caseDetails.name_topic = this.filterTopicName(
          this.caseDetails.topic
        );
        this.caseDetails.name_subtopic = this.filterSubtopicName(
          this.caseDetails.topic,
          this.caseDetails.subtopic
        );

        this.loading = !this.loading;
      } catch (err) {
        console.log(err);
      }
    },
    filterTopicName(topic_bubble) {
      let topic = this.topics.filter((top) => top.bubble_id == topic_bubble)[0]
        .name;
      return topic;
    },
    filterSubtopicName(topic_bubble, subtopic_bubble) {
      let topic = this.topics.filter((top) => top.bubble_id == topic_bubble)[0];
      let subtopic = topic.subtopics.filter(
        (sub) => sub.subtopic == subtopic_bubble
      );

      return subtopic[0].name;
    },
    discardConfirm() {
      this.titleModal = 'Descartar caso';
      this.bodyModal =
        'Al descartar este caso, se eliminará toda la información relacionada con él. Esta \n acción no se puede deshacerse. ¿Deseas descartarlo?';
      this.button = 'Descartar caso';
      this.isShowDiscardCaseModal = !this.isShowDiscardCaseModal;
    },
    async discardCase() {
      try {
        this.busyDiscard = !this.busyDiscard;

        let deleteResponse = await this.$axios.delete('/deleteCaseBank', {
          params: { case_id: this.$route.params.id },
        });

        this.titleToast = deleteResponse.data.message;
        this.showSuccessToast = !this.showSuccessToast;

        setTimeout(() => {
          this.showSuccessToast = !this.showSuccessToast;
          this.isShowDiscardCaseModal = !this.isShowDiscardCaseModal;
          this.busyDiscard = !this.busyDiscard;
          this.$router.push({ path: '/findCase' });
        }, 1500);
      } catch (err) {
        this.busyDiscard = !this.busyDiscard;

        const response = err.response;
        this.titleToast = response.data.message;
        this.showFailToast = !this.showFailToast;

        setTimeout(() => {
          this.showFailToast = !this.showFailToast;
        }, 1);
      }
    },
    async saveCase() {
      try {
        this.busy = !this.busy;

        let caseUpdated = await this.$axios.put('/updateBankCase', {
          case_id: this.$route.params.id,
          content: {
            quill: this.contentDescription,
            html: this.contentHtml,
          },
        });

        this.titleToast = caseUpdated.data.message;
        this.showSuccessToast = !this.showSuccessToast;

        setTimeout(() => {
          this.busy = !this.busy;
          this.showSuccessToast = !this.showSuccessToast;
          this.$router.push({ path: '/findCase' });
        }, 1500);
      } catch (err) {
        this.busy = !this.busy;

        const response = err.response;
        this.titleToast = response.data.message;
        this.showFailToast = !this.showFailToast;

        setTimeout(() => {
          this.showFailToast = !this.showFailToast;
        }, 1);
      }
    },
    addQuestionModal() {
      this.isShowAddQuestionModal = !this.isShowAddQuestionModal;
    },
    async addQuestion() {
      try {
        this.indexQuestion += 1;

        let addQuestionResponse = await this.$axios.post('/addBankQuestion', {
          case_id: this.$route.params.id,
          index: this.indexQuestion,
          importance: this.questionData.dificulty,
          type: this.questionData.type,
          question: {
            content: this.questionData.question.content,
            html: this.questionData.question.html,
          },
          answers: this.questionData.answers,
          correct_answer: this.questionData.correct_answer,
          retro: {
            content: this.questionData.retro.content,
            html: this.questionData.retro.html,
          },
        });

        this.titleToast = addQuestionResponse.data.message;
        this.showSuccessToast = !this.showSuccessToast;

        setTimeout(() => {
          this.showSuccessToast = !this.showSuccessToast;
          this.questions.push(addQuestionResponse.data.payload);
        }, 1500);
      } catch (err) {
        const response = err.response;
        this.titleToast = response.data.message;
        this.showFailToast = !this.showFailToast;
        console.log(response.data.message);

        setTimeout(() => {
          this.showFailToast = !this.showFailToast;
        }, 1);
      }
    },
    updateQuestion(question, index) {
      this.questionToUpdate = question;
      this.questionToUpdate.indexInArray = index;
      this.isShowCaseQuestionDetailsModal =
        !this.isShowCaseQuestionDetailsModal;
      console.log('questionToUpdate', this.questionToUpdate);
      console.log('findCase questions', this.questions);
    },
    reloadQuestions() {
      this.titleToast = 'Question updated!';
      this.showSuccessToast = !this.showSuccessToast;

      setTimeout(() => {
        this.showSuccessToast = !this.showSuccessToast;
        this.questions[this.questionUpdated.indexInArray] =
          this.questionUpdated.updated;
      }, 1500);
    },
    deleteQuestionConfirm(question) {
      this.questionToDelete = question._id;
      this.titleModal = 'Eliminar pregunta';
      this.bodyModal =
        '¿Deseas eliminar esta pregunta? Esta acción eliminará la pregunta junto con las respuestas y no puede deshacerse.';
      this.button = 'Eliminar';
      this.isShowDeleteQuestionModal = !this.isShowDeleteQuestionModal;
    },
    async deleteQuestion() {
      try {
        this.busyDeleteQuestion = !this.busyDeleteQuestion;

        let deleteQuestionResponse = await this.$axios.delete(
          '/deleteBankQuestion',
          {
            params: {
              case_id: this.$route.params.id,
              question_id: this.questionToDelete,
            },
          }
        );

        this.titleToast = deleteQuestionResponse.data.message;
        this.showSuccessToast = !this.showSuccessToast;

        setTimeout(() => {
          this.showSuccessToast = !this.showSuccessToast;
          this.questions = this.questions.filter(
            (ques) => ques._id != this.questionToDelete
          );
          this.busyDeleteQuestion = !this.busyDeleteQuestion;
          this.isShowDeleteQuestionModal = !this.isShowDeleteQuestionModal;
        }, 1500);
      } catch (err) {
        const response = err.response;
        this.titleToast = response.data.message;
        this.showFailToast = !this.showFailToast;
        console.log(response.data.message);

        setTimeout(() => {
          this.showFailToast = !this.showFailToast;
        }, 1);
      }
    },
    closeDiscardCaseModal() {
      this.isShowDiscardCaseModal = false;
    },
    closeAddQuestionModal() {
      this.isShowAddQuestionModal = false;
    },
    closeUpdateQuestionModal() {
      this.isShowCaseQuestionDetailsModal = false;
    },
    closeRejectDeleteQuestionModal() {
      this.isShowDeleteQuestionModal = false;
    },
  },
};
</script>

<style scoped>
.case-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: Montserrat;
}

.case-container a {
  color: #000;
  text-decoration: none;
}

.header-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 10px 0px;
}

.header-container h1 {
  font-weight: bold;
  font-size: 32px;
  line-height: 39px;
  color: #000000;
}

.cancel {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #db1212;
}

.description-container {
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
}

.description-container h1 {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #000000;
}

.questions-container {
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
}

.questions-container h1 {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #000000;
}

.each-question {
  display: flex;
  flex-direction: column;
}

.add-question-container i {
  color: #fff;
  font-size: 20px;
  margin: 0px 6px;
}

.add-question-container button {
  padding: 12px 20px;
  color: #fff;
  background: #fe9400;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;
  margin: 20px 0px;
}

.save-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.save-container button {
  padding: 12px 20px;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;
  margin: 0px 20px;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  align-items: center;
}

.save-container i {
  margin: 0px 8px;
}

.send {
  background: #20b000;
  color: #fff;
}

/* estilos para el loading predeterminado */
.lds-dual-ring {
  display: inline-block;
  width: 50px;
  height: 50px;
  margin: 0px auto;
}

.lds-dual-ring:after {
  content: ' ';
  display: block;
  width: 44px;
  height: 44px;
  /* margin: 8px; */
  border-radius: 50%;
  border: 6px solid #fe9400;
  border-color: #fe9400 transparent #fe9400 transparent;
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
