<template>
  <div>
    <Loading v-if="loading" />

    <!-- Vista cuando entras a ver los detalles del simulador -->
    <div v-else class="sim-container">
      <nuxt-link to="/simulators" v-if="subtopicIdSelected == ''">
        <i class="fas fa-chevron-left"></i>
        Volver a simuladores
      </nuxt-link>

      <div v-if="subtopicIdSelected == ''" class="header-container">
        <h1>{{ simulatorData.name }}</h1>

        <div class="questions-info">
          <p>Casos totales:</p>
          <span>{{ simulatorData.questions.length }}</span>
        </div>

        <div>
          <label :class="simulatorStatus ? 'inactive' : 'active'">{{
            simulatorStatus ? 'Desactivar' : 'Desactivado'
          }}</label>
          <label class="switch">
            <input
              type="checkbox"
              v-model="simulatorStatus"
              @change="changeStatusSimulator(simulatorData)"
            />
            <span class="slider round"></span>
          </label>
          <label :class="simulatorStatus ? 'active' : 'inactive'">{{
            simulatorStatus ? 'Activo' : 'Activar'
          }}</label>
        </div>

        <button class="btn" @click="addQuestionsConfirm">
          <i class="fas fa-upload mr-2"></i> Enviar preguntas al banco
        </button>
      </div>

      <div v-if="subtopicIdSelected == ''" class="body-container">
        <div class="content-container">
          <h4>Contenido</h4>
          <hr />

          <div class="topics-container">
            <div class="topics">
              <button
                class="btn"
                v-for="topic in topics"
                :key="topic.topic_id"
                @click="changeSubtopics(topic)"
              >
                {{
                  topic.topic_name == 'Gine&Obstetricia'
                    ? 'Ginecología y obstetricia'
                    : topic.topic_name
                }}
                <br />
                <span>{{ topic.total_questions }}/450</span>
              </button>
            </div>

            <div class="subtopics">
              <h3>{{ topicSelected }}</h3>

              <button
                class="btn ml-4"
                v-for="subtopic in subtopics"
                :key="subtopic.subtopic_id"
                @click="subtopicSelected(subtopic)"
              >
                <i class="fas fa-circle"></i>
                {{ subtopic.subtopic_name }}
                <span
                  >{{ subtopic.total_questions }}/{{
                    topicTotalQuestions
                  }}</span
                >
              </button>
            </div>
          </div>
        </div>

        <div class="config-container">
          <h4>Configuración de Simulador</h4>
          <hr />
          <div class="d-flex align-items-center my-4">
            <div class="align-middle w-25">
              <b>No. de bloques</b>
            </div>
            <div class="mx-2 w-75">
              <b-form-input
                class="rounded-lg text-center"
                v-model="simulatorsBlocksNumber"
              ></b-form-input>
            </div>
            <b-button
              variant="primary"
              class="rounded-lg"
              @click="calculeSimulatorBlocks()"
            >
              <b-icon icon="check2" aria-label="Help"></b-icon>
            </b-button>
          </div>
        </div>
        <div class="blocks-container" v-if="simulatorsBlocks">
          <h4>Bloques</h4>
          <hr />
          <div class="px-3 py-3">
            <div
              v-for="(block, index) in simulatorsBlocks"
              :key="index"
              :set="(blockKey = Math.ceil((index + 1) / 2))"
              :class="{ shadowed: block.type === 'block' }"
              class="block d-flex align-items-center justify-content-between px-3 py-2 my-2 bg-white rounded-lg"
            >
              <h3>
                {{
                  block.type === 'block'
                    ? `Bloque ${blockKey}`
                    : `Descanso ${blockKey}`
                }}
              </h3>
              <div class="d-flex align-items-center">
                <template v-if="block.type === 'block'">
                  <div class="text-secondary">Preguntas:</div>
                  <b-form-input
                    class="mx-1 text-center"
                    type="number"
                    v-model.number="block.questions"
                  ></b-form-input>
                </template>
              </div>
              <div class="d-flex align-items-center">
                <div class="text-secondary">Tiempo:</div>
                <b-form-input
                  class="mx-1 text-center"
                  type="number"
                  v-model.number="block.time"
                ></b-form-input>
                <small><strong>MINS</strong></small>
              </div>
              <span class="text-danger">
                <b-icon
                  class="trash-icon"
                  v-if="block.type === 'block'"
                  icon="trash-fill"
                  aria-label="Help"
                  role="button"
                  @click="removeSimulatorBlock(index)"
                />
              </span>
            </div>
          </div>
          <div
            class="block d-flex align-items-center justify-content-between py-2 my-2 bg-white line-up"
          >
            <h3>Total</h3>
            <div class="d-flex align-items-center">
              <div class="text-secondary">PREGUNTAS:</div>
              <b class="mx-2">{{ blocksSimulatorTotals.questions }}</b>
              / {{ simulatorData.questions.length }}
            </div>
            <div class="d-flex align-items-center">
              <div class="text-secondary">TIEMPO:</div>
              <b class="mx-2">{{ blocksSimulatorTotals.time }}</b>
              <small><strong>MINS</strong></small>
            </div>
            <b-button
              variant="primary"
              class="rounded-lg"
              @click="saveSimulatorBlock()"
            >
              <b-icon icon="upload" aria-label="Help"></b-icon>
            </b-button>
          </div>
        </div>

        <div class="analitics-container">
          <h4>Análisis del simulador</h4>
          <hr />

          <span>Preguntas por dificultad</span>
          <Chart :height="180" :chartData="chartDataDificulty" />

          <span>Preguntas por tipo</span>
          <Chart :height="180" :chartData="chartDataType" />
        </div>
      </div>

      <!-- Vista cuando seleccionas un subtema -->
      <div
        v-if="subtopicIdSelected != '' && !('_id' in caseToView)"
        class="filter-container"
      >
        <div class="back">
          <button class="btn" @click="goBack">
            <i class="fas fa-chevron-left mr-2"></i>Volver a
            {{ simulatorData.name }}
          </button>
        </div>

        <div class="head-container">
          <h3>
            {{ simulatorData.name }} <i class="fas fa-circle"></i>
            {{ topicSelected }} <i class="fas fa-circle"></i
            ><span class="sub">{{ subtopicName }}</span>
          </h3>
          <p class="title">
            Preguntas totales:
            <span class="num">{{ totalQuestionsBySubtopic }}/450</span>
          </p>
        </div>

        <div class="subtopic-analitics">
          <div class="cases-subtopic">
            <h3>Casos de subtema</h3>
            <hr />

            <div class="table-container">
              <table class="table table-bordered">
                <thead class="thead-admin">
                  <tr>
                    <th scope="col" class="th-case">ID</th>
                    <th scope="col">Caso</th>
                    <th scope="col">Idioma</th>
                    <th scope="col" class="act">Acciones</th>
                  </tr>
                </thead>
                <tbody class="tbody">
                  <tr v-for="theCase in casesFiltered" :key="theCase._id">
                    <td>{{ theCase.spotlight_id }}</td>
                    <td>{{ theCase.name }}</td>
                    <td>{{ theCase.language }}</td>
                    <td class="act">
                      <button class="btn edit" @click="viewCase(theCase)">
                        <i class="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        class="btn delete"
                        @click="deleteCaseConfirm(theCase)"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                      <!-- <div v-if="theCase.status == 'Accepted by Spotlighter' || theCase.status == 'Pending' || theCase.status == 'In edit'" class="appro">
                                                <button class="btn accep" @click="acceptedCaseModal(theCase.status)"><i class="fas fa-exclamation-circle"></i> Info</button>
                                            </div>
                                            <div v-else class="op">
                                                <button class="btn op" @click="caseDetails(theCase._id)"><i class="fas fa-list-alt"></i> Ver caso</button>
                                            </div> -->
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="graphics">
            <h3>Análisis subtema</h3>

            <span>Preguntas por dificultad</span>
            <Chart :height="180" :chartData="chartSubtopicDificulty" />

            <span>Preguntas por tipo</span>
            <Chart :height="180" :chartData="chartSubtopicType" />
          </div>
        </div>
      </div>

      <!-- Vista cuando seleccionas un caso de un subtema -->
      <div v-if="'_id' in caseToView" class="case-details-container">
        <div class="back">
          <button class="btn" @click="goToSubtopics">
            <i class="fas fa-chevron-left mr-2"></i>Volver a casos por subtema
          </button>
        </div>

        <div class="cancel-container">
          <h1>Detalles del caso</h1>
          <button class="btn">Eliminar caso del simulador</button>
        </div>

        <!-- Card con los detalles del caso -->
        <CaseSimulatorDetailsCard
          :caseName="caseToView.name"
          :id="caseToView.spotlight_id"
          :language="caseToView.language"
          :topic="caseToView.topic_name"
          :subtopic="caseToView.subtopic_name"
        />

        <div class="description-container">
          <h1>Descripción del caso</h1>

          <quill-editor
            :options="editorOption"
            @ready="onEditorReady($event)"
            @change="onEditorChange($event)"
          />
        </div>

        <div class="questions-container">
          <h3>Preguntas:</h3>

          <IndividualQuestionCard
            v-for="(ques, index) in caseToView.individual_questions"
            :key="ques._id"
            :question="ques"
            :ind="index"
            @update="updateQuestionModal(ques, index)"
            @delete="deleteQuestionConfirm(ques)"
          />

          <div class="add-question-container">
            <button class="btn" @click="addNewQuestion">
              <i class="fas fa-plus-circle"></i> Agregar pregunta
            </button>
          </div>
        </div>

        <div class="buttons-container">
          <button class="btn save" @click="saveCaseConfirm">
            <i class="fas fa-save"></i> Guardar caso
          </button>
        </div>
      </div>
    </div>

    <!-- Agregar preguntas al banco -->
    <AcceptModal
      v-if="isShowAddQuestionsModal"
      @close="closeAddQuestionsModal"
      :textTitle="titleModal"
      :textBody="bodyModal"
      :action="sendQuestions"
      :textButton="button"
      :isBusy="busyQuestions"
    />

    <!-- Agregar una pregunta a un caso -->
    <AddCaseQuestion
      v-if="isShowAddQuestionModal"
      :typ="types"
      @close="closeAddQuestionModal"
      :data.sync="questionData"
      @addQues="addQuestion"
    />

    <!-- Detalles de la pregunta -->
    <CaseQuestionDetailsModal
      v-if="isShowCaseQuestionDetailsModal"
      @close="closeUpdateQuestionModal"
      @reload="reloadQuestions"
      :toUpdate="questionToUpdate"
      :typ="types"
      :case="caseToView._id"
      :data.sync="questionUpdated"
      :simulatorFlag="true"
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

    <!-- Eliminar caso del simulador -->
    <RejectModal
      v-if="isShowDeleteCaseModal"
      @close="closeConfirmModal"
      :textTitle="titleModal"
      :textBody="bodyModal"
      :action="deleteCase"
      :textButton="button"
      :isBusy="busyDelete"
    />

    <accept-modal
      key="case"
      v-if="isShowConfirmUpdate"
      @close="closeUpdateModal"
      :action="saveCase"
      :textTitle="titleModal"
      :textBody="bodyModal"
      :textButton="button"
    />

    <SuccessToast v-if="showSuccessToast" :textTitle="titleModal" />

    <FailToast v-if="showFailToast" :textTitle="titleModal" />
  </div>
</template>

<script>
import Loading from '@/components/modals/loading.modal.vue';
import Chart from '@/components/chart/chart.vue';
import CaseSimulatorDetailsCard from '@/components/cards/administrators/case-simulator-details.card.vue';
import IndividualQuestionCard from '@/components/cards/administrators/individual-question.card.vue';
import AddCaseQuestion from '@/components/modals/administrators/add-case-question.modal.vue';
import CaseQuestionDetailsModal from '@/components/modals/administrators/case-question-details.modal.vue';
import AcceptModal from '@/components/modals/accept.modal.vue';
import RejectModal from '@/components/modals/reject.modal.vue';
import SuccessToast from '@/components/toasts/success.toast.vue';
import FailToast from '@/components/toasts/fail.toast.vue';

const default_block_questions = {
  type: 'block',
  time: 60,
  questions: 80,
};
const default_block_break = {
  type: 'break',
  time: 60,
};

export default {
  components: {
    Loading,
    Chart,
    CaseSimulatorDetailsCard,
    IndividualQuestionCard,
    AddCaseQuestion,
    CaseQuestionDetailsModal,
    AcceptModal,
    RejectModal,
    SuccessToast,
    FailToast,
  },
  data() {
    return {
      loading: false,
      isShowAddQuestionsModal: false,
      isShowConfirmUpdate: false,
      busyQuestions: false,
      isShowDeleteCaseModal: false,
      busyDelete: false,
      showSuccessToast: false,
      showFailToast: false,
      isShowAddQuestionModal: false,
      isShowCaseQuestionDetailsModal: false,
      isShowDeleteQuestionModal: false,
      busyDeleteQuestion: false,

      titleModal: '',
      bodyModal: '',
      button: '',

      types: [],
      simulatorData: {},
      topics: [],
      topicSelected: '',
      topicIdSelected: '',
      subtopicIdSelected: '',
      subtopicName: '',
      topicTotalQuestions: 0,
      subtopics: [],
      questionsByType: [],
      questionsByDificulty: [],
      casesFiltered: [],
      chartDataType: {},
      chartSubtopicType: {},
      simulatorStatus: false,

      caseToView: {},

      questionsSubtopicType: [],
      questionsSubtopicDificulty: [],
      chartDataDificulty: {},
      chartSubtopicDificulty: {},
      totalQuestionsBySubtopic: 0,
      topicsInfo: [],
      topicBubble: '',
      subtopicBubble: '',
      caseToDelete: {},
      questionData: {},
      questionToUpdate: {},
      questionUpdated: {},
      questionToDelete: '',
      caseQuestionToDelete: '',

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

      simulatorsBlocksNumber: 0,
      simulatorsBlocks: [],
    };
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;
      this.topicsInfo = JSON.parse(localStorage.getItem('topics'));
      this.types = JSON.parse(localStorage.getItem('types'));
    }

    await this.getSimulator();
  },
  computed: {
    blocksSimulatorTotals() {
      return this.simulatorsBlocks.reduce(
        (acc, curr) => {
          acc.time += curr.time;
          if (curr.questions) {
            acc.questions += curr.questions;
          }
          return acc;
        },
        { time: 0, questions: 0 }
      );
    },
  },
  methods: {
    onEditorReady(quill) {
      quill.setContents(
        JSON.parse(JSON.stringify(this.caseToView.question.content.ops))
      );
    },
    onEditorChange({ quill, html }) {
      this.contentDescription = quill.getContents();
      this.contentHtml = html;
    },
    async getSimulator() {
      try {
        this.loading = !this.loading;

        let simulatorResponse = await this.$axios.get(
          '/getNumSimulatorQuestionsTopic',
          { params: { simulator_id: this.$route.params.id } }
        );

        this.simulatorData = simulatorResponse.data.payload.simulator;
        this.topics = simulatorResponse.data.payload.topics;
        this.questionsByType = simulatorResponse.data.payload.byType;
        this.questionsByDificulty = simulatorResponse.data.payload.byDificulty;
        this.simulatorStatus = this.simulatorData.enabled;
        this.simulatorsBlocksNumber = this.simulatorData.blocks.filter(
          (block) => block.type === 'block'
        ).length;
        this.simulatorsBlocks = this.simulatorData.blocks;

        this.createDataForType();
        this.createDataForDificulty();

        this.loading = !this.loading;
      } catch (err) {
        console.log(err);
      }
    },
    createDataForType() {
      this.loading = !this.loading;

      let typesNames = [];
      let totalQuestions = [];
      this.questionsByType.forEach((type) => {
        typesNames.push(type.type_display + ' (' + type.total_questions + ')');
        totalQuestions.push(type.total_questions);
      });

      this.chartDataType = {
        labels: typesNames,
        datasets: [
          {
            // borderWidth: 1,
            backgroundColor: [
              '#1CA4FC',
              '#F48FC2',
              '#2ACE06',
              '#FFC942',
              '#EE2F2F',
              '#FE9400',
            ],
            data: totalQuestions,
          },
        ],
      };

      this.loading = !this.loading;
    },
    createDataForDificulty() {
      let dificultyName = [];
      let totalDificulty = [];
      this.questionsByDificulty.forEach((dificulty) => {
        dificultyName.push(
          dificulty.dificulty + ' (' + dificulty.total_questions + ')'
        );
        totalDificulty.push(dificulty.total_questions);
      });

      this.chartDataDificulty = {
        labels: dificultyName,
        datasets: [
          {
            backgroundColor: ['#20B000', '#FABE23', '#DB1212'],
            data: totalDificulty,
          },
        ],
      };
    },
    changeSubtopics(topic) {
      this.topicSelected =
        topic.topic_name == 'Gine&Obstetricia'
          ? 'Ginecología y obstetricia'
          : topic.topic_name;
      this.topicTotalQuestions = topic.total_questions;
      this.subtopics = topic.subtopics;
      this.topicIdSelected = topic.topic_id;
    },
    async subtopicSelected(subtopic) {
      try {
        this.loading = !this.loading;

        this.subtopicIdSelected = subtopic.subtopic_id;
        this.subtopicName = subtopic.subtopic_name;

        let topic = this.topicsInfo.filter(
          (top) => top._id == this.topicIdSelected
        );
        let topic_bubble = topic[0].bubble_id;

        let sub = topic[0].subtopics.filter(
          (s) => s._id == subtopic.subtopic_id
        );
        let subtopic_bubble = sub[0].subtopic;
        this.topicBubble = topic_bubble;
        this.subtopicBubble = subtopic_bubble;

        let casesResponse = await this.$axios.get('/getCasesFromSimulator', {
          params: {
            topic: topic_bubble,
            subtopic: subtopic_bubble,
            simulator_id: this.$route.params.id,
          },
        });

        this.casesFiltered = casesResponse.data.payload.cases;
        this.questionsSubtopicType = casesResponse.data.payload.byType;
        this.questionsSubtopicDificulty =
          casesResponse.data.payload.byDificulty;
        this.createDataSubtopicType();
        this.createDataSubtopicDificulty();
        this.setTotalQuestionsBySubtopic();

        this.loading = !this.loading;
      } catch (err) {
        console.log(err);
      }
    },
    createDataSubtopicType() {
      this.loading = !this.loading;

      let typesNames = [];
      let totalQuestions = [];
      this.questionsSubtopicType.forEach((type) => {
        typesNames.push(type.type_display + ' (' + type.total_questions + ')');
        totalQuestions.push(type.total_questions);
      });

      this.chartSubtopicType = {
        labels: typesNames,
        datasets: [
          {
            backgroundColor: [
              '#1CA4FC',
              '#F48FC2',
              '#2ACE06',
              '#FFC942',
              '#EE2F2F',
              '#FE9400',
            ],
            data: totalQuestions,
          },
        ],
      };

      this.loading = !this.loading;
    },
    createDataSubtopicDificulty() {
      let dificultyName = [];
      let totalDificulty = [];
      this.questionsSubtopicDificulty.forEach((dificulty) => {
        dificultyName.push(
          dificulty.dificulty + ' (' + dificulty.total_questions + ')'
        );
        totalDificulty.push(dificulty.total_questions);
      });

      this.chartSubtopicDificulty = {
        labels: dificultyName,
        datasets: [
          {
            // borderWidth: 1,
            backgroundColor: ['#20B000', '#FABE23', '#DB1212'],
            data: totalDificulty,
          },
        ],
      };
    },
    setTotalQuestionsBySubtopic() {
      this.totalQuestionsBySubtopic = 0;
      this.casesFiltered.forEach((theCase) => {
        this.totalQuestionsBySubtopic += theCase.individual_questions.length;
      });
    },
    goBack() {
      this.subtopicIdSelected = '';
      this.subtopicName = '';
    },
    async changeStatusSimulator(simulator) {
      try {
        if (this.simulatorStatus) {
          let activeResponse = await this.$axios.put('/setSimulatorActive', {
            simulator_id: this.$route.params.id,
          });
          simulator.enabled = this.simulatorStatus;

          setTimeout(() => {
            alert(activeResponse.data.message);
          }, 2000);
        } else {
          let inactiveResponse = await this.$axios.put(
            '/setSimulatorInactive',
            { simulator_id: this.$route.params.id }
          );
          simulator.enabled = this.simulatorStatus;

          setTimeout(() => {
            alert(inactiveResponse.data.message);
          }, 2000);
        }
      } catch (err) {
        console.log(err);
      }
    },
    addQuestionsConfirm() {
      this.titleModal = 'Enviar preguntas al banco';
      this.bodyModal =
        'Al enviar las preguntas al banco, este simulador se vaciará y quedará sin información. Al quedar limpio, deberán agregarse los casos nuevamente. Esta acción no puede deshacerse.';
      this.button = 'Enviar al banco';

      this.isShowAddQuestionsModal = !this.isShowAddQuestionsModal;
    },
    async sendQuestions() {
      try {
        this.busyQuestions = !this.busyQuestions;

        let sendQuestionsResponse = await this.$axios.delete(
          '/deleteAllCasesFromSimulator',
          {
            params: {
              simulator_id: this.$route.params.id,
              topic: this.topicBubble,
              subtopic: this.subtopicBubble,
            },
          }
        );

        this.titleModal = sendQuestionsResponse.data.message;
        this.showSuccessToast = !this.showSuccessToast;

        setTimeout(() => {
          this.busyQuestions = !this.busyQuestions;
          this.isShowAddQuestionsModal = !this.isShowAddQuestionsModal;

          this.$router.push({ path: '/simulators' });
        }, 2000);
      } catch (err) {
        this.isShowAddQuestionsModal = !this.isShowAddQuestionsModal;
        this.busyQuestions = !this.busyQuestions;

        const response = err.response;
        this.titleModal = response.data.message;
        this.showFailToast = !this.showFailToast;

        setTimeout(() => {
          this.showFailToast = !this.showFailToast;
        }, 1);
      }
    },
    viewCase(theCase) {
      this.caseToView = theCase;
      let topic = this.topicsInfo.filter(
        (top) => top.bubble_id == theCase.topic
      )[0];
      this.caseToView.topic_name = topic.name;
      let subtopic = topic.subtopics.filter(
        (sub) => sub.subtopic == theCase.subtopic
      )[0];
      this.caseToView.subtopic_name = subtopic.name;
      // console.log('top', topic)
    },
    addNewQuestion() {
      this.isShowAddQuestionModal = !this.isShowAddQuestionModal;
    },
    async addQuestion() {
      try {
        let addQuestionResponse = await this.$axios.post(
          '/addSimulatorCaseQuestion',
          {
            ...this.questionData,
            index: this.caseToView.individual_questions.length + 1,
            case_id: this.caseToView._id,
            simulator_question: this.caseToView._id,
          }
        );

        // console.log('question added', addQuestionResponse);

        this.caseToView.individual_questions.push(
          addQuestionResponse.data.payload.individual
        );
      } catch (err) {
        console.log(err);
      }
    },
    updateQuestionModal(question, index) {
      this.questionToUpdate = question;
      this.questionToUpdate.indexInArray = index;
      this.questionToUpdate.case_id = this.caseToView.case_id;

      this.isShowCaseQuestionDetailsModal =
        !this.isShowCaseQuestionDetailsModal;

      console.log('questionToUpdate', this.questionToUpdate);
      console.log('caseToView', this.caseToView);
    },
    reloadQuestions() {
      this.caseToView.individual_questions[this.questionUpdated.indexInArray] =
        this.questionUpdated.updated;
    },
    deleteQuestionConfirm(question) {
      this.questionToDelete = question._id;
      // console.log('question', this.caseToView)
      this.caseQuestionToDelete = question.case_question;
      this.titleModal = 'Eliminar pregunta';
      this.bodyModal =
        '¿Deseas eliminar esta pregunta? Esta acción eliminará la pregunta junto con las respuestas y puede deshacerse.';
      this.button = 'Eliminar';
      this.isShowDeleteQuestionModal = !this.isShowDeleteQuestionModal;
    },
    async deleteQuestion() {
      try {
        this.busyDeleteQuestion = !this.busyDeleteQuestion;

        let deleteResponse = await this.$axios.delete(
          '/deleteIndividualQuestion',
          {
            params: {
              individual_id: this.questionToDelete,
              question_id: this.caseQuestionToDelete,
              simulator_question_id: this.caseToView._id,
              case_question_id: this.caseToView.case_id,
            },
          }
        );

        console.log(deleteResponse.data);

        alert(deleteResponse.data.message);
        this.caseToView.individual_questions =
          this.caseToView.individual_questions.filter(
            (ques) => ques._id != this.questionToDelete
          );

        this.busyDeleteQuestion = !this.busyDeleteQuestion;
        this.isShowDeleteQuestionModal = !this.isShowDeleteQuestionModal;
      } catch (err) {
        console.log(err);
      }
    },
    goToSubtopics() {
      this.caseToView = {};
    },
    saveCaseConfirm() {
      console.log('case', this.caseToView);
      this.titleModal = 'Actualizar caso';
      this.bodyModal = '¿Deseas actualizar este caso?';
      this.button = 'Actualizar';
      this.isShowConfirmUpdate = true;
    },
    async saveCase() {
      try {
        await this.$axios.put('/updateSimulatorQuestion', {
          question: {
            content: this.contentDescription,
            html: this.contentHtml,
          },
          case_id: this.caseToView._id,
        });
        this.titleModal = 'Caso actualizado';
        this.isShowConfirmUpdate = false;
        this.showSuccessToast = !this.showSuccessToast;
        setTimeout(() => {
          this.showSuccessToast = !this.showSuccessToast;
        }, 3000);
      } catch (err) {
        console.log('Error:', err);
      }
    },
    closeUpdateModal() {
      this.isShowConfirmUpdate = false;
    },
    deleteCaseConfirm(theCase) {
      this.titleModal = 'Eliminar caso';
      this.bodyModal =
        '¿Deaseas eliminar este caso? Esta acción no puede deshacerse.';
      this.button = 'Eliminar caso';

      this.isShowDeleteCaseModal = !this.isShowDeleteCaseModal;

      this.caseToDelete = theCase;
      // console.log('case!!!!', theCase)
    },
    async deleteCase() {
      try {
        this.busyDelete = !this.busyDelete;

        let caseDeletedResponse = await this.$axios.delete(
          '/deleteCaseFromSimulator',
          {
            params: {
              simulator_id: this.$route.params.id,
              case_id: this.caseToDelete._id,
            },
          }
        );
        // console.log(caseDeletedResponse);
        alert(caseDeletedResponse.data.message);
        this.casesFiltered = this.casesFiltered.filter(
          (cases) => cases._id != this.caseToDelete._id
        );
        this.totalQuestionsBySubtopic -=
          this.caseToDelete.individual_questions.length;

        this.simulatorData.questions = this.simulatorData.questions.filter(
          (ques) => ques._id != this.caseToDelete._id
        );

        this.questionsSubtopicType = this.questionsSubtopicType.filter(
          (ques) => ques._id != this.caseToDelete._id
        );
        this.questionsSubtopicDificulty =
          this.questionsSubtopicDificulty.filter(
            (ques) => ques._id != this.caseToDelete
          );

        // console.log('subtopic', this.subtopics);

        this.busyDelete = !this.busyDelete;
        this.isShowDeleteCaseModal = !this.isShowDeleteCaseModal;
      } catch (err) {
        const response = err.response;
        this.titleModal = response.data.message;
        this.showFailToast = !this.showFailToast;

        setTimeout(() => {
          this.showFailToast = !this.showFailToast;
        }, 1);
      }
    },
    closeAddQuestionsModal() {
      this.isShowAddQuestionsModal = false;
    },
    closeDeleteCaseModal() {
      this.isShowDeleteCaseModal = false;
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
    calculeSimulatorBlocks() {
      this.simulatorsBlocks = [];
      for (let i = 0; i < this.simulatorsBlocksNumber; i++) {
        this.simulatorsBlocks.push(structuredClone(default_block_questions));
        if (i < this.simulatorsBlocksNumber - 1) {
          this.simulatorsBlocks.push(structuredClone(default_block_break));
        }
      }
    },
    async saveSimulatorBlock() {
      console.log('save');
      console.log(this.simulatorsBlocks);
      const response = await this.$axios.put('/simulator/blocks', {
        simulator_id: this.$route.params.id,
        blocks: this.simulatorsBlocks,
      });
      console.log(response);
    },
    removeSimulatorBlock(idx) {
      const nDeletions = this.simulatorsBlocksNumber > 1 ? 2 : 1;
      this.simulatorsBlocksNumber--;
      if (this.simulatorsBlocks.length - 1 === idx) {
        this.simulatorsBlocks.splice(idx - 1, 2);
      } else {
        this.simulatorsBlocks.splice(idx, nDeletions);
      }
    },
  },
};
</script>

<style scoped>
.sim-container {
  display: flex;
  flex-direction: column;
  font-family: Montserrat;
}

.sim-container a {
  color: #000;
  text-decoration: none;
}

.header-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-container h1 {
  font-style: normal;
  font-weight: bold;
  font-size: 32px;
  line-height: 39px;
  color: #000000;
  margin-bottom: 0;
}

.header-container p {
  margin-bottom: 0;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
}

.questions-info {
  display: flex;
  flex-direction: row;
}

.questions-info span {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #1ca4fc;
  margin: 0px 8px;
}

.inactive {
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
  color: #9e9e9e;
}

.active {
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
  color: #000000;
}

.header-container i {
  margin: 0px 8px;
}

.header-container button {
  padding: 12px 20px;
  background: #fe9400;
  color: #fff;
  box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
  border-radius: 10px;
  margin: 0px 20px;
}

.body-container {
  display: grid;
  grid-template-areas: 'content config' 'content blocks' 'analitics analitics';
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr 1fr;
  justify-items: center;
}
.body-container > div {
  width: 100%;
  padding: 1rem 4vw;
}

hr {
  border: 1.5px solid #000000;
  opacity: 1;
  margin: 0;
}
.line-up {
  border-top: 3px solid #000000;
}

h3 {
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 18px;
  color: #000000;
  margin-bottom: 0;
}
h4 {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #000000;
  margin-bottom: 0;
}

.config-container {
  grid-area: config;
}
.config-container input {
  background-color: #f1f1f1 !important;
  font-weight: 600;
  border: none;
}

.blocks-container {
  grid-area: blocks;
}
.blocks-container input {
  background-color: #f1f1f1 !important;
  font-weight: 600;
  border: none;
  width: 60px;
}
.blocks-container > div {
  overflow-y: auto;
  max-height: 40vh;
}
.blocks-container .block.shadowed {
  box-shadow: 0 0 10px #cccccc;
}
.blocks-container .block > * {
  min-width: 20px;
}
.blocks-container .block > div,
.blocks-container .block > h3 {
  min-width: 180px;
}
.blocks-container .block .trash-icon {
  min-width: 20px;
}
.block input::-webkit-outer-spin-button,
.block input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
  appearance: none;
}

.block input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
  appearance: none;
}

.content-container {
  grid-area: content;
  display: flex;
  flex-direction: column;
}

.topics-container {
  display: flex;
  flex-direction: row;
}

.topics {
  display: flex;
  flex-direction: column;
  margin: 40px 0px;
  width: 50%;
  border-right: 1px solid #000000;
}

.topics button {
  text-align: right;
  border-bottom: 1px solid #c6e8fe;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #212529;
  padding: 20px 40px 20px 20px;
  margin: 0px 20px;
}

.topics button:focus {
  background: #e9f6ff;
}

.topics span {
  font-weight: bold;
}

.subtopics {
  display: flex;
  flex-direction: column;
  margin: 40px 0px;
  width: 50%;
  border-left: 1px solid #000000;
}

.subtopics h3 {
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  color: #fe9400;
  margin: 20px 20px;
}

.subtopics ul {
  margin: 0px 20px;
}

.subtopics li {
  margin: 12px 4px;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 21px;
  color: #212529;
}

.subtopics span {
  margin: 0px 4px;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  color: #1ca4fc;
}

.subtopics button {
  width: 85%;
  text-align: left;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 21px;
  color: #212529;
}

.subtopics button:focus {
  background: #e9f6ff;
}

.subtopics i {
  font-size: 8px;
}

.config-container {
  grid-area: config;
}

.analitics-container {
  grid-area: analitics;
}

.analitics-container h3 {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #000000;
  margin-bottom: 0;
}

.analitics-container span {
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 23px;
  color: #000000;
  margin-top: 40px;
  margin-bottom: 10px;
}

/* .chart-container {
        width: 100%;
        height: 50%;
    } */

canvas {
  /* width: 173px !important; */
  height: 800px !important;
}

/* Estilos para los casos por subtema */
.filter-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.back {
  width: 50%;
}

.head-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 15px 0px;
}

.head-container h3 {
  display: flex;
  align-items: center;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #000000;
  margin-bottom: 0;
  align-items: center;
}

.head-container p {
  margin-bottom: 0;
}

.head-container i {
  margin: 0px 5px;
  font-size: 8px;
  color: #1ca4fc;
}

.sub {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #fe9400;
  /* margin: 0px 5px; */
}

.title {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #212529;
}

.num {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #1ca4fc;
  margin: 0px 8px;
}

.subtopic-analitics {
  display: flex;
  flex-direction: row;
  margin: 15px 0px;
}

.subtopic-analitics h3 {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #000000;
  margin-bottom: 0;
}

.cases-subtopic {
  display: flex;
  flex-direction: column;
  width: 70%;
  margin: 0px 40px;
}

.table-container {
  margin: 20px 0px;
}

.thead-admin {
  background: #212529;
  color: #fff;
  text-transform: uppercase;
}

.thead-admin th:last-child {
  border-radius: 0px 15px 0px 0px;
  border: 1px solid white;
  -moz-border-radius: 0px 15px 0px 0px;
  -webkit-border-radius: 0px 15px 0px 0px;
}

.thead-admin th:first-child {
  border-radius: 15px 0px 0px 0px;
  border: 1px solid white;
  -moz-border-radius: 15px 0px 0px 0px;
  -webkit-border-radius: 15px 0px 0px 0px;
}

.tbody {
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 18px;
  color: #212529;
}

td {
  vertical-align: middle;
  /* max-width: fit-content !important; */
}

.edit {
  color: #1ca4fc;
}

.delete {
  color: #db1212;
}

.graphics {
  display: flex;
  flex-direction: column;
  width: 45%;
  margin: 0px 40px;
}

.graphics span {
  margin-top: 40px;
}

/* Estilos para detalles del caso */
.case-details-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: Montserrat;
}

.cancel-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 20px 0px;
}

.case-details-container h1 {
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 39px;
}

.description-container {
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
  /* height: 200px; */
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

.buttons-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.buttons-container button {
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

.buttons-container i {
  margin: 0px 8px;
}

.save {
  background: #20b000;
  color: #fff;
}

/* switch */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #db1212;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 14px;
  width: 14px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #20b000;
}

input:focus + .slider {
  box-shadow: 0 0 1px #20b000;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
