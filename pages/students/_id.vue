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
      <StudentProfileHeader
        :student="student"
        :med-score="detail.med_score"
        class="fade-in-up delay-1"
      />

      <!-- Debug Actions (solo visible con ?debug=true) -->
      <StudentDebugActions
        v-if="isDebugMode"
        :student-id="$route.params.id"
        :current-test-date="student.test_date"
        class="fade-in-up delay-3"
        @action-completed="refreshDetail"
      />
      
      <!-- Stats Row -->
      <StudentDetailStats
        :diagnostic-score="detail.diagnostic_score"
        :study-hours="student.study_hours || 0"
        :free-day="studentFreeDay"
        :total-manuals-read="detail.manuals.total_read"
        :total-exams="detail.custom_exams.total"
        class="fade-in-up delay-2"
      />

      <!-- Tabs -->
      <div :class="['detail-tabs', 'fade-in-up', isDebugMode ? 'delay-4' : 'delay-3']">
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
import StudentProfileHeader from '@/components/students/student-profile-header.vue';
import StudentDetailStats from '@/components/students/student-detail-stats.vue';
import StudentManualsTab from '@/components/students/student-manuals-tab.vue';
import StudentExamsTab from '@/components/students/student-exams-tab.vue';
import StudentDebugActions from '@/components/students/student-debug-actions.vue';

export default {
  components: {
    StudentProfileHeader,
    StudentDetailStats,
    StudentManualsTab,
    StudentExamsTab,
    StudentDebugActions,
  },
  data() {
    return {
      loading: true,
      error: null,
      activeTab: 0,
      userRole: null,
    };
  },
  computed: {
    isSupervisor() {
      return this.userRole === 'Supervisor';
    },
    isDebugMode() {
      // return this.$route.query.debug === 'true' && !this.isSupervisor;
      return !this.isSupervisor;
    },
    detail() {
      return this.$store.getters['students/getStudentDetail'];
    },
    student() {
      return this.detail ? this.detail.student : {};
    },
    studentFreeDay() {
      if (this.student.free_day != null) return this.student.free_day;
      if (this.student.rest_day != null) return this.student.rest_day;
      return -1;
    },
  },
  methods: {
    async refreshDetail() {
      try {
        await this.$store.dispatch(
          'students/fetchStudentDetail',
          this.$route.params.id
        );
      } catch (err) {
        console.error('Error refreshing student detail:', err);
      }
    },
  },
  async mounted() {
    // Load user role
    if (process.browser) {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          this.userRole = user.role;
        }
      } catch (e) {
        console.error('Error loading user role:', e);
      }
    }

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

.delay-4 {
  animation-delay: 0.4s;
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
</style>
