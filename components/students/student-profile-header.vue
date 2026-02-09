<template>
  <div class="profile-header">
    <div class="profile-left">
      <MedScoreRing
        :score="medScore"
        :photo-url="student.photo_url"
        :alt="fullName"
        :size="180"
        :stroke-width="10"
      />
    </div>

    <div class="profile-center">
      <h1 class="student-name">{{ fullName }}</h1>
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
</template>

<script>
import MedScoreRing from '@/components/students/med-score-ring.vue';

export default {
  name: 'StudentProfileHeader',
  components: {
    MedScoreRing,
  },
  props: {
    student: {
      type: Object,
      required: true,
    },
    medScore: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    fullName() {
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
      if (diffDays < 7)
        return `Hace ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
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
}
</style>
