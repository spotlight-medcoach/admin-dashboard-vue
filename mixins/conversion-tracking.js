export default {
  data() {
    return {
      conversionPollingIntervals: {}, // Map of manualId -> intervalId
    };
  },
  mounted() {
    // Reanudar polling para manuales en conversión al montar el componente
    this.resumeConversionTracking();
  },
  beforeDestroy() {
    // Limpiar todos los intervals al destruir el componente
    this.stopAllConversionTracking();
  },
  methods: {
    /**
     * Iniciar polling para un manual en conversión
     */
    startConversionPolling(manualId) {
      // Si ya hay un polling activo, no crear otro
      if (this.conversionPollingIntervals[manualId]) {
        return;
      }

      const intervalId = setInterval(async () => {
        try {
          const status = await this.$store.dispatch(
            'manuals/checkConversionStatus',
            manualId
          );

          if (!status) {
            this.stopConversionPolling(manualId);
            return;
          }

          // Si la conversión está completa o falló, detener el polling
          if (status.status === 'completed' || status.status === 'failed') {
            this.stopConversionPolling(manualId);

            // Mostrar toast de éxito o error
            if (status.status === 'completed') {
              this.$bvToast.toast('Manual convertido exitosamente', {
                title: 'Éxito',
                variant: 'success',
                solid: true,
              });
            } else {
              this.$bvToast.toast(
                `Error en la conversión: ${status.error || 'Error desconocido'}`,
                {
                  title: 'Error',
                  variant: 'danger',
                  solid: true,
                }
              );
            }

            // Recargar manuales después de un breve delay
            setTimeout(() => {
              if (this.$store.dispatch) {
                this.$store.dispatch('manuals/fetchManuals');
              }
            }, 1000);
          }
        } catch (error) {
          console.error('Error checking conversion status:', error);
          this.stopConversionPolling(manualId);
        }
      }, 3000); // Verificar cada 3 segundos

      this.conversionPollingIntervals[manualId] = intervalId;
    },

    /**
     * Detener polling para un manual específico
     */
    stopConversionPolling(manualId) {
      if (this.conversionPollingIntervals[manualId]) {
        clearInterval(this.conversionPollingIntervals[manualId]);
        delete this.conversionPollingIntervals[manualId];
      }
    },

    /**
     * Detener todos los pollings activos
     */
    stopAllConversionTracking() {
      Object.keys(this.conversionPollingIntervals).forEach((manualId) => {
        this.stopConversionPolling(manualId);
      });
    },

    /**
     * Reanudar tracking para manuales que están en conversión
     */
    resumeConversionTracking() {
      const convertingManuals = this.$store.getters['manuals/convertingManuals'];
      if (convertingManuals) {
        Object.keys(convertingManuals).forEach((manualId) => {
          const status = convertingManuals[manualId];
          // Solo reanudar si el estado no es completed o failed
          if (
            status &&
            status.status !== 'completed' &&
            status.status !== 'failed'
          ) {
            this.startConversionPolling(manualId);
          }
        });
      }
    },
  },
};

