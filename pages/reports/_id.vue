<template>
  <div>
    <Navigation />

    <div class="back-container">
      <nuxt-link to="/reports">
        <i class="fas fa-chevron-left"></i>
        Volver
      </nuxt-link>
    </div>

    <div class="report-container">
      <div class="title-container">
        <h1>Detalles del caso</h1>
      </div>

      <Loading v-if="loading" />

      <div class="description-card-container">
        <!-- Descrición del caso -->
        <DescriptionCaseCard
          v-if="!loading"
          :caseName="caseDetails.name"
          :id="caseDetails.spotlight_id"
          :language="caseDetails.language"
          :topic="caseDetails.name_topic"
          :subtopic="caseDetails.name_subtopic"
        />
      </div>

      <div v-if="!loading" class="report-description-container">
        <ReportCard
          :typeReport="reportDetails.description"
          :report="reportDetails.type"
        />
      </div>

      <div v-if="!loading" class="case-description">
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
          <QuestionCardSpotlighter
            v-for="(ques, index) in questions"
            :key="ques._id"
            :question="ques"
            :ind="index"
            @updateQuestion="updateQuestion(questions[index], index)"
            @deleteQuestion="deleteQuestionConfirm(questions[index])"
          />
        </div>
      </div>

      <!-- Loader -->
      <div v-if="isBusyUpdateReport" class="load-container">
        <div class="lds-dual-ring"></div>
      </div>

      <div v-if="!loading" class="finish-report">
        <button class="btn" @click="updateCaseConfirm">
          <i class="fas fa-check-circle"></i>Actualizar caso y finalizar reporte
        </button>
      </div>
    </div>

    <!-- Detalle de pregunta -->
    <CaseQuestionDetailsModalAdministrator
      v-if="isShowUpdateQuestionModal"
      @close="closeUpdateQuestionModal"
      @reload="reloadQuestions"
      :toUpdate="questionToUpdate"
      :typ="types"
      :case="caseDetails._id"
      :data.sync="questionUpdated"
    />

    <!-- Cambiar estado de reporte -->
    <AcceptModal
      v-if="isShowUpdateReportModal"
      @close="closeAcceptModal"
      :textTitle="titleModal"
      :textBody="bodyModal"
      :action="updateCase"
      :textButton="button"
      :isBusy="isBusyUpdateReport"
    />

    <!-- Eliminar pregunta -->
    <RejectModal
      v-if="isShowModalDeleteQuestion"
      @close="closeDeleteQuestionModal"
      :textTitle="titleModal"
      :textBody="bodyModal"
      :action="deleteQuestion"
      :textButton="button"
      :isBusy="busyDeleteQuestion"
    />

    <SuccessToast v-if="showSuccessToast" :textTitle="titleToast" />

    <FailToast v-if="showFailToast" :textTitle="titleToast" />
  </div>
</template>

<script>
import Navigation from '@/components/navs/navigation.vue';
import Loading from '@/components/modals/loading.modal.vue';
import DescriptionCaseCard from '@/components/cards/description-case.card.vue';
import ReportCard from '@/components/cards/report.card.vue';
import QuestionCardSpotlighter from '@/components/cards/spotlighters/question-spotlighter.card.vue';
import CaseQuestionDetailsModalAdministrator from '@/components/modals/administrators/case-question-details-administrator.modal.vue';
import AcceptModal from '@/components/modals/accept.modal.vue';
import RejectModal from '@/components/modals/reject.modal.vue';
import SuccessToast from '@/components/toasts/success.toast.vue';
import FailToast from '@/components/toasts/fail.toast.vue';

export default {
  components: {
    Navigation,
    Loading,
    DescriptionCaseCard,
    ReportCard,
    QuestionCardSpotlighter,
    CaseQuestionDetailsModalAdministrator,
    AcceptModal,
    RejectModal,
    SuccessToast,
    FailToast,
  },
  data() {
    return {
      loading: false,
      isShowUpdateQuestionModal: false,
      isShowUpdateReportModal: false,
      isBusyUpdateReport: false,
      isShowModalDeleteQuestion: false,
      busyDeleteQuestion: false,
      showSuccessToast: false,
      showFailToast: false,

      topics: [],
      types: [],
      index: 1,

      titleModal: '',
      bodyModal: '',
      button: '',
      titleToast: '',

      reportDetails: {},
      caseDetails: {},
      questions: [],
      questionToUpdate: {},
      questionUpdated: {},
      questionToDelete: '',
      studentDetails: {},

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

    await this.getReportDetails();
    // console.log('report: ', this.reportDetails);
    console.log('case: ', this.caseDetails);
    // console.log('questions: ', this.questions);
    // console.log('student:', this.studentDetails);
  },
  methods: {
    onEditorReady(quill) {
      quill.setContents(
        JSON.parse(JSON.stringify(this.caseDetails.content.quill.ops))
      );
    },
    onEditorChange({ quill, html, text }) {
      this.contentDescription = quill.getContents();
      // this.contentHtml = quill.root.innerHTML;
      this.contentHtml = html;
    },
    async getReportDetails() {
      try {
        this.loading = !this.loading;

        let reportResponse = await this.$axios.get('/getOneReport', {
          params: { report_id: this.$route.params.id },
        });

        this.reportDetails = reportResponse.data.payload;
        this.caseDetails = reportResponse.data.payload.case_id;
        this.contentDescription =
          reportResponse.data.payload.case_id.content.quill;
        this.questions = reportResponse.data.payload.case_id.questions;
        this.index = this.questions.length;
        this.studentDetails = reportResponse.data.payload.student_id;

        this.caseDetails.name_topic = this.filterTopicName(
          this.caseDetails.topic
        );
        this.caseDetails.name_subtopic = this.filterSubtopicName(
          this.caseDetails.topic,
          this.caseDetails.subtopic
        );
        // console.log(this.caseDetails);

        this.loading = !this.loading;
      } catch (err) {
        console.log(err);
      }
    },
    filterTopicName(topic_bubble) {
      let topic = '';
      topic = this.topics.filter((top) => top.bubble_id == topic_bubble)[0]
        .name;
      return topic;
    },
    filterSubtopicName(topic_bubble, subtopic_bubble) {
      var topic;
      var subtopic;
      topic = this.topics.filter((top) => top.bubble_id == topic_bubble)[0];
      subtopic = topic.subtopics.filter(
        (sub) => sub.subtopic == subtopic_bubble
      );

      return subtopic[0].name;
    },
    updateQuestion(question, index) {
      this.questionToUpdate = question;
      this.questionToUpdate.indexInArray = index;
      this.isShowUpdateQuestionModal = !this.isShowUpdateQuestionModal;

      // console.log('update the question', question)
      // alert('Actualizar pregunta')
    },
    deleteQuestionConfirm(question) {
      this.questionToDelete = question._id;
      this.titleModal = 'Eliminar pregunta';
      this.bodyModal =
        '¿Deseas eliminar esta pregunta? Esta acción eliminará la pregunta junto con las respuestas y puede deshacerse.';
      this.button = 'Eliminar';
      this.isShowModalDeleteQuestion = !this.isShowModalDeleteQuestion;
    },
    async deleteQuestion() {
      try {
        this.busyDeleteQuestion = !this.busyDeleteQuestion;

        let deleteQuestionResponse = await this.$axios.delete(
          '/deleteBankQuestion',
          {
            params: {
              case_id: this.caseDetails._id,
              question_id: this.questionToDelete,
            },
          }
        );

        alert(deleteQuestionResponse.data.message);
        this.questions = this.questions.filter(
          (ques) => ques._id != this.questionToDelete
        );

        this.busyDeleteQuestion = !this.busyDeleteQuestion;
        this.isShowModalDeleteQuestion = !this.isShowModalDeleteQuestion;
      } catch (err) {
        console.log(err);
      }
    },
    reloadQuestions() {
      this.questions[this.questionUpdated.indexInArray] =
        this.questionUpdated.updated;
      console.log('actualizadas: ', this.questions);
    },
    updateCaseConfirm() {
      this.isShowUpdateReportModal = !this.isShowUpdateReportModal;
      this.titleModal = 'Actualizar caso y finalizar reporte';
      this.bodyModal =
        'Al realizar esta acción indicas que el caso se ha corregido de acuerdo al reporte hecho por el usuario y se actualizará en la base de datos. El reporte cambiará de estado a corregido y se eliminará de la lista. ¿Deseas continuar?';
      this.button = 'Finalizar reporte';
    },
    async updateCase() {
      try {
        this.isBusyUpdateReport = !this.isBusyUpdateReport;

        // Actualizamos los datos del caso del reporte
        let caseUpdateResponse = await this.$axios.put('/updateBankCase', {
          case_id: this.caseDetails._id,
          questions: this.questions,
          content: {
            quill: this.contentDescription,
            html: this.contentHtml,
          },
        });

        // actualizamos el estado del reporte
        let reportResponse = await this.$axios.put('/putReportResolved', {
          report_id: this.$route.params.id,
        });

        this.titleToast = reportResponse.data.message;
        this.showSuccessToast = !this.showSuccessToast;
        this.isBusyUpdateReport = !this.isBusyUpdateReport;

        setTimeout(() => {
          this.isShowUpdateReportModal = !this.isShowUpdateReportModal;
          this.$router.push({ path: `/reports` });
          this.showSuccessToast = !this.showSuccessToast;
        }, 1500);
      } catch (err) {
        console.log(err);
      }
    },
    // closeModal() {
    //     this.isShowRejectModal = false;
    // },
    closeUpdateQuestionModal() {
      this.isShowUpdateQuestionModal = false;
    },
    closeAcceptModal() {
      this.isShowUpdateReportModal = !this.isShowUpdateReportModal;
    },
    closeDeleteQuestionModal() {
      this.isShowModalDeleteQuestion = false;
    },
  },
};
</script>

<style scoped>
.back-container {
  margin: 10px 40px;
  font-family: Montserrat;
}

.back-container a {
  color: #000;
  text-decoration: none;
}

.report-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: Montserrat;
}

.title-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
}

.title-container h1 {
  font-style: normal;
  font-weight: bold;
  font-size: 32px;
  line-height: 39px;
  color: #000000;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 40%;
}

.retro-btn {
  padding: 12px 20px;
  background: #1ca4fc;
  color: #fff;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;
}

.retro-btn i {
  margin: 0px 10px;
}

.cancel {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #db1212;
  margin: 0px 40px;
}

.description-card-container {
  margin: 10px 0px;
}

.report-description-container {
  margin: 10px 0px;
}

.case-description {
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
}

.case-description h1 {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 39px;
  color: #000000;
}

.questions-container {
  display: flex;
  flex-direction: column;
}

.questions-container h1 {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 39px;
  color: #000000;
}

.each-question {
  display: flex;
  flex-direction: column;
}

.finish-report {
  display: flex;
  justify-content: flex-end;
}

.finish-report button {
  padding: 12px 20px;
  color: #fff;
  background: #20b000;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;
  margin: 20px 0px;
}

.finish-report i {
  margin: 0px 8px;
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
