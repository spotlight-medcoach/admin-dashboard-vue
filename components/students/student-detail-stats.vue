<template>
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-icon icon-diagnostic">
        <i class="fas fa-stethoscope"></i>
      </div>
      <div class="stat-content">
        <span class="stat-value">{{ diagnosticScore.percentage }}%</span>
        <span class="stat-label">Diagnostico</span>
        <span class="stat-detail">
          {{ diagnosticScore.total_correct }}/{{
            diagnosticScore.total_questions
          }}
          correctas
        </span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon icon-hours">
        <i class="fas fa-clock"></i>
      </div>
      <div class="stat-content">
        <span class="stat-value">{{ studyHours }}h</span>
        <span class="stat-label">Horas de estudio diarias</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon icon-rest">
        <i class="fas fa-calendar-check"></i>
      </div>
      <div class="stat-content">
        <span class="stat-value">{{ freeDayName }}</span>
        <span class="stat-label">Dia de descanso</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon icon-manuals">
        <i class="fas fa-book-open"></i>
      </div>
      <div class="stat-content">
        <span class="stat-value">{{ totalManualsRead }}</span>
        <span class="stat-label">Manuales leidos</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon icon-exams">
        <i class="fas fa-file-alt"></i>
      </div>
      <div class="stat-content">
        <span class="stat-value">{{ totalExams }}</span>
        <span class="stat-label">Examenes realizados</span>
      </div>
    </div>
  </div>
</template>

<script>
const DAY_NAMES = [
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
  'Domingo',
];

export default {
  name: 'StudentDetailStats',
  props: {
    diagnosticScore: {
      type: Object,
      default: () => ({
        percentage: 0,
        total_correct: 0,
        total_questions: 0,
      }),
    },
    studyHours: {
      type: Number,
      default: 0,
    },
    freeDay: {
      type: Number,
      default: -1,
    },
    totalManualsRead: {
      type: Number,
      default: 0,
    },
    totalExams: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    freeDayName() {
      const day = this.freeDay;
      if (day < 0 || day > 6) return 'Ninguno';
      return DAY_NAMES[day] || 'Ninguno';
    },
  },
};
</script>

<style lang="scss" scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;

  &.icon-diagnostic {
    background: rgba(255, 147, 0, 0.1);
    color: #ff9300;
  }

  &.icon-hours {
    background: rgba(67, 182, 244, 0.1);
    color: #43b6f4;
  }

  &.icon-rest {
    background: rgba(129, 143, 249, 0.1);
    color: #818ff9;
  }

  &.icon-manuals {
    background: rgba(116, 237, 92, 0.1);
    color: #4fcb43;
  }

  &.icon-exams {
    background: rgba(255, 57, 170, 0.1);
    color: #ff39aa;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1b;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #979797;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-detail {
  font-size: 11px;
  color: #bbbbb3;
  margin-top: 2px;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
