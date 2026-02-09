<template>
  <div class="student-detail">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="lds-dual-ring"></div>
      <p>Cargando detalle del estudiante...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <nuxt-link to="/students" class="back-link">
        <i class="fas fa-arrow-left"></i> Volver a estudiantes
      </nuxt-link>
    </div>

    <!-- Content -->
    <template v-else-if="detail">
      <!-- Top Bar -->
      <div class="top-bar fade-in-up">
        <nuxt-link to="/students" class="back-link">
          <i class="fas fa-chevron-left"></i>
          Volver a estudiantes
        </nuxt-link>
      </div>

      <!-- Profile Header -->
      <div class="profile-header fade-in-up delay-1">
        <div class="profile-left">
          <MedScoreRing
            :score="detail.med_score"
            :photo-url="student.photo_url"
            :alt="studentFullName"
            :size="180"
            :stroke-width="10"
          />
        </div>

        <div class="profile-center">
          <h1 class="student-name">{{ studentFullName }}</h1>
          <div class="student-meta">
            <div class="meta-item">
              <i class="fas fa-envelope"></i>
              <span>{{ student.email }}</span>
            </div>
            <div v-if="student.university_student_id" class="meta-item">
              <i class="fas fa-id-card"></i>
              <span>{{ student.university_student_id }}</span>
            </div>
            <div v-if="universityName" class="meta-item">
              <i class="fas fa-university"></i>
              <span>{{ universityName }}</span>
            </div>
          </div>
        </div>

        <div class="profile-right">
          <div class="info-badges">
            <div class="info-badge" v-if="student.test_date">
              <span class="badge-label">Fecha de examen</span>
              <span class="badge-value">{{
                formatDateShort(student.test_date)
              }}</span>
            </div>
            <div class="info-badge">
              <span class="badge-label">Ultimo acceso</span>
              <span class="badge-value">{{
                student.last_login
                  ? formatDateRelative(student.last_login)
                  : 'Sin registro'
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row fade-in-up delay-2">
        <div class="stat-card">
          <div class="stat-icon icon-diagnostic">
            <i class="fas fa-stethoscope"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{
              detail.diagnostic_score.percentage
            }}%</span>
            <span class="stat-label">Diagnostico</span>
            <span class="stat-detail">
              {{ detail.diagnostic_score.total_correct }}/{{
                detail.diagnostic_score.total_questions
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
            <span class="stat-value">{{ student.study_hours || 0 }}h</span>
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
            <span class="stat-value">{{ detail.manuals.total_read }}</span>
            <span class="stat-label">Manuales leidos</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-exams">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ detail.custom_exams.total }}</span>
            <span class="stat-label">Examenes realizados</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="detail-tabs fade-in-up delay-3">
        <b-tabs
          content-class="tab-content-wrapper"
          nav-class="custom-tabs-nav"
          v-model="activeTab"
        >
          <b-tab title="Manuales" active>
            <template #title>
              <i class="fas fa-book-open mr-2"></i>
              Manuales
              <span class="tab-count">{{ detail.manuals.total_read }}</span>
            </template>
            <StudentManualsTab
              :manuals-list="detail.manuals.list"
              :by-topic="detail.manuals.by_topic"
              :total-read="detail.manuals.total_read"
            />
          </b-tab>

          <b-tab title="Examenes Personalizados">
            <template #title>
              <i class="fas fa-file-alt mr-2"></i>
              Examenes
              <span class="tab-count">{{ detail.custom_exams.total }}</span>
            </template>
            <StudentExamsTab
              :exams-list="detail.custom_exams.list"
              :total-exams="detail.custom_exams.total"
              :average-score="detail.custom_exams.average_score"
              :questions-by-topic="detail.custom_exams.questions_by_topic"
            />
          </b-tab>
        </b-tabs>
      </div>
    </template>
  </div>
</template>

<script>
import MedScoreRing from '@/components/students/med-score-ring.vue';
import StudentManualsTab from '@/components/students/student-manuals-tab.vue';
import StudentExamsTab from '@/components/students/student-exams-tab.vue';

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
  components: {
    MedScoreRing,
    StudentManualsTab,
    StudentExamsTab,
  },
  data() {
    return {
      loading: true,
      error: null,
      activeTab: 0,
    };
  },
  computed: {
    detail() {
      return this.$store.getters['students/getStudentDetail'];
    },
    student() {
      return this.detail ? this.detail.student : {};
    },
    studentFullName() {
      if (!this.student) return '';
      const parts = [];
      if (this.student.name) parts.push(this.student.name);
      if (this.student.last_name) parts.push(this.student.last_name);
      if (parts.length === 0 && this.student.first_name) {
        parts.push(this.student.first_name);
        if (this.student.last_name) parts.push(this.student.last_name);
      }
      return parts.join(' ') || 'Sin nombre';
    },
    universityName() {
      if (!this.student || !this.student.university) return '';
      if (typeof this.student.university === 'string')
        return this.student.university;
      return this.student.university.name || '';
    },
    freeDayName() {
      const day = this.student.free_day ?? this.student.rest_day ?? -1;
      if (day < 0 || day > 6) return 'Ninguno';
      return DAY_NAMES[day] || 'Ninguno';
    },
  },
  methods: {
    formatDateShort(date) {
      if (!date) return '-';
      const d = new Date(date);
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
    formatDateRelative(date) {
      if (!date) return '-';
      const d = new Date(date);
      const now = new Date();
      const diffMs = now - d;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMin < 1) return 'Justo ahora';
      if (diffMin < 60) return `Hace ${diffMin} min`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  async mounted() {
    this.$store.dispatch('pageHeader/setHeader', {
      hasHeader: false,
    });

    try {
      await this.$store.dispatch(
        'students/fetchStudentDetail',
        this.$route.params.id
      );
    } catch (err) {
      console.error('Error fetching student detail:', err);
      this.error = 'No se pudo cargar la informacion del estudiante.';
    } finally {
      this.loading = false;
    }
  },
  beforeDestroy() {
    this.$store.dispatch('pageHeader/clearHeader');
    // Clear detail data when leaving
    this.$store.commit('students/setStudentDetail', null);
  },
};
</script>

<style lang="scss" scoped>
.student-detail {
  padding: 0 24px 48px;
  max-width: 1280px;
  margin: 0 auto;
  font-family: 'Montserrat', sans-serif;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #979797;

  p {
    margin-top: 16px;
    font-size: 15px;
  }
}

.lds-dual-ring {
  width: 48px;
  height: 48px;

  &::after {
    content: '';
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 5px solid #ff9300;
    border-color: #ff9300 transparent #ff9300 transparent;
    animation: spin 1.2s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #979797;

  i {
    font-size: 48px;
    color: #ff574f;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    margin-bottom: 24px;
  }
}

/* Top Bar */
.top-bar {
  padding: 16px 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #5b5b5b;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #ff9300;
    text-decoration: none;
  }

  i {
    font-size: 12px;
  }
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.profile-left {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.profile-center {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 12px;
}

.student-name {
  font-size: 26px;
  font-weight: 700;
  color: #1d1d1b;
  margin: 0 0 12px;
  line-height: 1.2;
}

.student-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #5b5b5b;
  font-size: 14px;

  i {
    width: 16px;
    text-align: center;
    color: #bbbbb3;
    font-size: 13px;
  }
}

.profile-right {
  flex-shrink: 0;
}

.info-badges {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 10px 16px;
  background: #f8f8f8;
  border-radius: 10px;
  min-width: 160px;
}

.badge-label {
  font-size: 11px;
  color: #979797;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 500;
}

.badge-value {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1b;
  margin-top: 2px;
}

/* Stats Row */
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

/* Tabs */
.detail-tabs {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.detail-tabs ::v-deep .custom-tabs-nav {
  border-bottom: 2px solid #f3f3f0;
  padding: 0 24px;

  .nav-item {
    margin-bottom: -2px;
  }

  .nav-link {
    padding: 16px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #979797;
    border: none;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      color: #5b5b5b;
      border-bottom-color: #e8e8e1;
    }

    &.active {
      color: #ff9300;
      border-bottom-color: #ff9300;
      background: transparent;
    }

    i {
      font-size: 13px;
    }
  }
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f3f3f0;
  color: #5b5b5b;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 6px;
}

.detail-tabs ::v-deep .nav-link.active .tab-count {
  background: rgba(255, 147, 0, 0.1);
  color: #ff9300;
}

.detail-tabs ::v-deep .tab-content-wrapper {
  padding: 24px;
}

/* Animations */
.fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

.delay-1 {
  animation-delay: 0.1s;
}

.delay-2 {
  animation-delay: 0.2s;
}

.delay-3 {
  animation-delay: 0.3s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-center {
    align-items: center;
  }

  .student-meta {
    align-items: center;
  }

  .profile-right {
    width: 100%;
  }

  .info-badges {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .info-badge {
    align-items: center;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
