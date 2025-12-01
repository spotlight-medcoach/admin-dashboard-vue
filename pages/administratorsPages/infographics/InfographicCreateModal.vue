<template>
  <b-modal
    id="infographic-create-modal"
    ref="infographic-create-modal"
    title="Sube tu Infografía"
    cancel-title="Cancelar"
    ok-title="Guardar Infografía"
    cancel-variant="light"
    header-class="mt-4"
    title-class="w-100 pl-5 text-center"
    body-class="px-5 pb-0"
    footer-class="px-5 pb-5"
    centered
    @shown="loaded = true"
    @hidden="loaded = false"
  >
    <template #modal-header-close>
      <b-icon icon="x" font-scale="1.1" />
    </template>
    <b-form
      id="infographic-form"
      name="infographic-form"
      @submit="createInfographic"
    >
      <b-form-group label="Nombre" label-for="name">
        <b-form-input
          id="name"
          v-model="form.name"
          placeholder="Nombre de Infografía"
          required
        />
      </b-form-group>
      <b-form-group label="Tema" label-for="topic">
        <b-form-select
          id="topic"
          v-model="form.topic"
          :options="topicOptions"
          required
        >
          <template #button-content>
            <b-icon icon="gear-fill" aria-hidden="true" />
            Settings
          </template>
        </b-form-select>
      </b-form-group>
      <b-form-group label="Subtema" label-for="subtopic">
        <b-form-select
          id="subtopic"
          v-model="form.subtopic"
          :options="subtopicOptions"
          :disabled="form.topic === null"
          required
        />
      </b-form-group>
    </b-form>
    <picture-input
      v-if="loaded"
      ref="pictureInput"
      width="600"
      height="300"
      margin="16"
      accept="image/jpeg,image/png"
      size="10"
      button-class="btn btn-light"
      class="mt-4 mb-2"
      :custom-strings="pictureInputStrings"
      @change="onChange"
    />
    <template #modal-footer>
      <b-button
        type="submit"
        form="infographic-form"
        variant="primary"
        :disabled="!form.image"
      >
        Guardar Infografía
      </b-button>
    </template>
  </b-modal>
</template>
<script>
import PictureInput from 'vue-picture-input';
// https://github.com/alessiomaffeis/vue-picture-input
const formDefault = {
  name: '',
  topic: null,
  subtopic: null,
  image: '',
  file: null,
};
export default {
  name: 'InfographicsCreateModal',
  components: {
    PictureInput,
  },
  props: {
    selectedInfographicIdx: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loaded: false,
      infographicIdx: 0,
      topics: [],
      form: {
        name: '',
        topic: null,
        subtopic: null,
        image: '',
        file: null,
      },
      pictureInputStrings: {
        upload: '<h3>Cargado</h3>', // HTML allowed
        drag: '<h1>☁️</h1>Sube un archivo JPEG o PNG aquí', // HTML allowed
        tap: 'Tap here to select a photo <br>from your gallery', // HTML allowed
        change: 'Cambiar Imágen', // Text only
        remove: 'Eliminar Imágen', // Text only
        select: 'Seleccionar foto', // Text only
        selected: '<p>Foto seleccionada correctamente</p>', // HTML allowed
        fileSize: 'El archivo es demasiado grande', // Text only
        fileType: 'El tipo de archivo no está permitido', // Text only
      },
    };
  },
  computed: {
    topicOptions() {
      const initial = [
        { text: '-- Tema de infografía', value: null, disabled: true },
      ];
      return initial.concat(
        this.topics.map((topic) => {
          return { text: topic.name, value: topic };
        })
      );
    },
    subtopicOptions() {
      const initial = [
        { text: '-- Subtema de infografía', value: null, disabled: true },
      ];
      if (this.form.topic === null) {
        return initial;
      }
      return initial.concat(
        this.form.topic.subtopics.map((subtopic) => {
          return { text: subtopic.name, value: subtopic };
        })
      );
    },
  },
  watch: {
    selectedInfographicIdx() {
      this.infographicIdx = this.selectedInfographicIdx;
    },
  },
  async created() {
    if (process.browser) {
      this.topics = JSON.parse(localStorage.getItem('topics'));
    }
  },
  mounted() {
    this.form = Object.assign({}, formDefault);
  },
  methods: {
    onChange(image) {
      if (image) {
        this.form.image = image;
        // Obtener el objeto File original del componente PictureInput
        if (this.$refs.pictureInput && this.$refs.pictureInput.file) {
          this.form.file = this.$refs.pictureInput.file;
        }
      } else {
        this.form.image = '';
        this.form.file = null;
        console.log('FileReader API not supported: use the <form>, Luke!');
      }
    },
    async createInfographic(event) {
      event.preventDefault();
      const data = await this.$store.dispatch(
        'infographics/createInfographic',
        {
          name: this.form.name,
          topic_id: this.form.topic._id,
          subtopic_id: this.form.subtopic._id,
          base64: this.form.image,
          file: this.form.file,
        }
      );
      if (data) {
        this.form = Object.assign({}, formDefault);
        this.$emit('onCreate', this.infographicIdx);
        this.$refs['infographic-create-modal'].hide();
      }
    },
  },
};
</script>
<style lang="scss">
#infographic-create-modal {
  .preview-container {
    max-width: initial !important;
    border: 2px dotted #5b5b5b;
    border-radius: 8px !important;
    .picture-preview {
      background-color: transparent;
      width: 100%;
      height: 100%;
      margin-top: 0;
    }
    .picture-inner {
      margin: 0;
      width: 100%;
      border: none;
    }
    .picture-inner-text {
      font-size: 1rem;
    }
  }
  .modal-content {
    border: none;
    > * {
      border: none;
    }
  }
}
</style>
