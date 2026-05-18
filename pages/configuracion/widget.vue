<template>
  <div>
    <Navigation />

    <div class="cfg-layout">
      <ConfigSidebar />

      <div class="cfg-content">
        <h2 class="cfg-content__title">Widget de reportes</h2>
        <p class="cfg-content__subtitle">
          Controla cómo aparece el widget de reportes en la plataforma del estudiante.
        </p>

        <Loading v-if="loading" />

        <form v-if="!loading" class="cfg-form" @submit.prevent="save">
          <!-- Modo de visualización -->
          <section class="cfg-section">
            <h3 class="cfg-section__title">Modo de visualización</h3>
            <div class="cfg-radio-group">
              <label
                v-for="opt in modeOptions"
                :key="opt.value"
                :class="['cfg-radio-card', { 'cfg-radio-card--active': form.widget_mode === opt.value }]"
              >
                <input v-model="form.widget_mode" type="radio" :value="opt.value" />
                <i :class="opt.icon"></i>
                <span class="cfg-radio-card__title">{{ opt.label }}</span>
                <span class="cfg-radio-card__desc">{{ opt.desc }}</span>
              </label>
            </div>
          </section>

          <!-- Texto del tab -->
          <section v-if="hasTab" class="cfg-section">
            <h3 class="cfg-section__title">Texto del tab lateral</h3>
            <input
              v-model="form.widget_tab_text"
              type="text"
              class="cfg-input"
              placeholder="Ej. Feedback, Hacer un reporte…"
              maxlength="40"
            />
            <p class="cfg-hint">
              Este texto se muestra en el tab visible dentro de la pantalla del estudiante.
            </p>
          </section>

          <!-- Posición del tab -->
          <section v-if="hasTab" class="cfg-section">
            <h3 class="cfg-section__title">Posición del tab</h3>
            <div class="cfg-radio-group cfg-radio-group--small">
              <label :class="['cfg-radio-card', { 'cfg-radio-card--active': form.widget_tab_position === 'right' }]">
                <input v-model="form.widget_tab_position" type="radio" value="right" />
                <i class="fas fa-arrow-right"></i>
                <span class="cfg-radio-card__title">Derecha</span>
              </label>
              <label :class="['cfg-radio-card', { 'cfg-radio-card--active': form.widget_tab_position === 'left' }]">
                <input v-model="form.widget_tab_position" type="radio" value="left" />
                <i class="fas fa-arrow-left"></i>
                <span class="cfg-radio-card__title">Izquierda</span>
              </label>
            </div>
          </section>

          <!-- Vista previa -->
          <section class="cfg-section">
            <h3 class="cfg-section__title">Vista previa</h3>
            <div class="cfg-preview">
              <div class="cfg-preview__screen">
                <div
                  v-if="hasTab && form.widget_tab_position === 'left'"
                  class="cfg-preview__tab cfg-preview__tab--left"
                >{{ form.widget_tab_text || 'Tab' }}</div>

                <span class="cfg-preview__label">Pantalla del estudiante</span>

                <div v-if="hasFloating" class="cfg-preview__fab">
                  <i class="fas fa-bug"></i>
                </div>

                <div
                  v-if="hasTab && form.widget_tab_position === 'right'"
                  class="cfg-preview__tab cfg-preview__tab--right"
                >{{ form.widget_tab_text || 'Tab' }}</div>
              </div>
            </div>
          </section>

          <!-- Feedback y acciones -->
          <div class="cfg-footer">
            <p v-if="successMsg" class="cfg-footer__success">
              <i class="fas fa-check-circle"></i> {{ successMsg }}
            </p>
            <p v-if="errorMsg" class="cfg-footer__error">
              <i class="fas fa-exclamation-circle"></i> {{ errorMsg }}
            </p>
            <button type="submit" class="cfg-btn-save" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ saving ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Navigation from '@/components/navs/navigation.vue'
import Loading from '@/components/modals/loading.modal.vue'
import ConfigSidebar from '@/components/config/ConfigSidebar.vue'

export default {
  components: { Navigation, Loading, ConfigSidebar },
  data () {
    return {
      loading: false,
      saving: false,
      successMsg: null,
      errorMsg: null,
      form: {
        widget_mode: 'floating',
        widget_tab_text: 'Hacer un reporte',
        widget_tab_position: 'right',
      },
      modeOptions: [
        {
          value: 'floating',
          label: 'Botón flotante',
          desc: 'Ícono redondo en la esquina inferior',
          icon: 'fas fa-circle',
        },
        {
          value: 'tab',
          label: 'Tab lateral',
          desc: 'Franja vertical con texto configurable',
          icon: 'fas fa-bookmark',
        },
        {
          value: 'both',
          label: 'Ambos',
          desc: 'Tab lateral y botón flotante visibles',
          icon: 'fas fa-layer-group',
        },
      ],
    }
  },
  computed: {
    hasTab () {
      return this.form.widget_mode === 'tab' || this.form.widget_mode === 'both'
    },
    hasFloating () {
      return this.form.widget_mode === 'floating' || this.form.widget_mode === 'both'
    },
  },
  async created () {
    await this.loadConfig()
  },
  methods: {
    async loadConfig () {
      this.loading = true
      try {
        const res = await this.$axios.get('/admin/tools/widget-config')
        const d = res.data?.data
        if (d) {
          this.form.widget_mode = d.widget_mode || 'floating'
          this.form.widget_tab_text = d.widget_tab_text || 'Hacer un reporte'
          this.form.widget_tab_position = d.widget_tab_position || 'right'
        }
      } catch (_) {
        // usa defaults si el doc aún no tiene los campos
      } finally {
        this.loading = false
      }
    },
    async save () {
      this.saving = true
      this.successMsg = null
      this.errorMsg = null
      try {
        await this.$axios.patch('/admin/tools/widget-config', this.form)
        this.successMsg = 'Configuración guardada correctamente.'
      } catch (err) {
        this.errorMsg = 'Error al guardar. Intenta de nuevo.'
        console.error(err)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
/* Layout de dos columnas: sub-sidebar + contenido */
.cfg-layout {
  display: flex;
  align-items: flex-start;
  min-height: calc(100vh - 60px);
  background: #fff;
}

.cfg-content {
  flex: 1;
  padding: 32px 40px;
  max-width: 680px;
}

.cfg-content__title {
  font-size: 22px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 6px;
}

.cfg-content__subtitle {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 32px;
}

/* Secciones */
.cfg-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f0f0;
}
.cfg-section:last-of-type { border-bottom: none; }

.cfg-section__title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: #495057;
  margin-bottom: 16px;
}

/* Tarjetas radio */
.cfg-radio-group { display: flex; gap: 12px; flex-wrap: wrap; }
.cfg-radio-group--small .cfg-radio-card { min-width: 130px; flex: 0 0 auto; }

.cfg-radio-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  min-width: 150px;
  text-align: center;
  transition: border-color .15s, background .15s;
  user-select: none;
}
.cfg-radio-card input { display: none; }
.cfg-radio-card i { font-size: 20px; color: #adb5bd; }
.cfg-radio-card__title { font-weight: 700; font-size: 14px; color: #212529; }
.cfg-radio-card__desc { font-size: 12px; color: #6c757d; }

.cfg-radio-card--active {
  border-color: #4040c8;
  background: #f0f0ff;
}
.cfg-radio-card--active i { color: #4040c8; }

/* Input de texto */
.cfg-input {
  width: 100%;
  max-width: 420px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  display: block;
}
.cfg-input:focus { outline: none; border-color: #4040c8; box-shadow: 0 0 0 3px rgba(64,64,200,.1); }
.cfg-hint { font-size: 12px; color: #6c757d; margin-top: 8px; }

/* Vista previa */
.cfg-preview__screen {
  position: relative;
  height: 180px;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  max-width: 520px;
}
.cfg-preview__label { color: #ced4da; font-size: 13px; }

.cfg-preview__tab {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #fe9400;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 10px 6px;
  letter-spacing: .5px;
  writing-mode: vertical-rl;
}
.cfg-preview__tab--right {
  right: 0;
  border-radius: 0 6px 6px 0;
  transform: translateY(-50%) rotate(180deg);
}
.cfg-preview__tab--left {
  left: 0;
  border-radius: 0 6px 6px 0;
}

.cfg-preview__fab {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fe9400;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 3px 8px rgba(0,0,0,.2);
}

/* Footer de acciones */
.cfg-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.cfg-footer__success { color: #2e7d32; font-size: 14px; margin: 0; }
.cfg-footer__error   { color: #c62828; font-size: 14px; margin: 0; }

.cfg-btn-save {
  padding: 11px 28px;
  border: none;
  border-radius: 8px;
  background: #4040c8;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background .15s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cfg-btn-save:hover:not(:disabled) { background: #3030a8; }
.cfg-btn-save:disabled { opacity: .6; cursor: not-allowed; }
</style>
