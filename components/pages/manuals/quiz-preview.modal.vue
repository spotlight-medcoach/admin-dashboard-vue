<template>
  <div v-if="isVisible" class="quiz-preview-overlay" @click.self="closeModal">
    <div class="quiz-preview-container">
      <button class="quiz-preview-close" @click="closeModal">
        <b-icon icon="x" font-scale="1.2" />
      </button>
      <div class="quiz-preview-content" v-if="currentQuizUrl || quizUrl">
        <iframe
          :src="currentQuizUrl || quizUrl"
          class="quiz-iframe"
          frameborder="0"
          allowfullscreen
        />
      </div>
      <div v-else class="quiz-empty">
        <p class="text-muted">No hay quiz disponible para previsualizar</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizPreviewModal',
  props: {
    quizUrl: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      isVisible: false,
      currentQuizUrl: null,
    };
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    },
    quizUrl(newVal) {
      this.currentQuizUrl = newVal;
    },
  },
  beforeDestroy() {
    document.body.style.overflow = 'auto';
  },
  methods: {
    show(url = null) {
      // Si se pasa una URL como parámetro, usarla
      if (url) {
        this.currentQuizUrl = url;
      } else if (this.quizUrl !== undefined) {
        // Si no, usar la prop quizUrl
        this.currentQuizUrl = this.quizUrl;
      }
      this.isVisible = true;
    },
    closeModal() {
      this.isVisible = false;
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.quiz-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.quiz-preview-container {
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  position: relative;
  overflow: hidden;
}

.quiz-preview-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.quiz-preview-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background-color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
}

.quiz-iframe {
  width: 100%;
  height: 90vh;
  min-height: 500px;
  border: none;
  display: block;
}

.quiz-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
  padding: 20px;
}
</style>
