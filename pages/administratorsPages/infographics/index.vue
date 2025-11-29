<template>
	<div id="infographics" class="p-2">
		<!-- MAIN CONTENT (RIGHT) -->
		<section class="infographics-container">
			<article class="full m-2 mb-3 p-5">
				<template v-if="loadingState">
					<loading-state message="Estamos obteniendo tus resultados" />
				</template>
				<template v-else>
				<!-------------------------------------------------------------------- Infographics Header -->
					<infographics-admin-header class="pb-4"/>
					<!-------------------------------------------------------------------- Infographics Content -->
					<manage-infographics-grid
						:infographicCardSize="infographicCardSize"
						:overlayIcon="'trash-fill'"
						@onSelectedInfographic="selectInfographic"
					/>
				</template>
			</article>
		</section>
		<!--------------------------------------------------------------------------- Infographic Modal -->
			<infographic-create-modal />
			<infographic-delete-modal
				:selectedInfographicIdx="selectedInfographicIdx"
			/>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
import LoadingState from '@/components/LoadingState.vue'
import InfographicsAdminHeader from './InfographicsAdminHeader.vue'
import ManageInfographicsGrid from './ManageInfographicsGrid.vue'
import InfographicCreateModal from './InfographicCreateModal.vue'
import InfographicDeleteModal from './InfographicDeleteModal.vue'
export default {
	components: {
		LoadingState,
		InfographicsAdminHeader,
		ManageInfographicsGrid,
		InfographicCreateModal,
		InfographicDeleteModal
	},
	data () {
		return {
			selectedTopicIdx: 0,
			selectedSubtopicIdx: 0,
			selectedInfographicIdx: 0,
			infographicCardSize: 300
		}
	},
	computed: {
		...mapGetters({
			loadingState: 'infographics/loadingState',
			infographics: 'infographics/allInfographics'
		})
	},
	methods: {
		createInfographic () {
			this.$bvModal.show('infographic-create-modal')
		},
		selectInfographic (selectedInfographicIdx) {
			this.selectedInfographicIdx = selectedInfographicIdx
			this.$bvModal.show('infographic-delete-modal')
		}
	},
	async created() {
        if (process.browser) {
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        }
    },
	mounted () {
		console.log(process.env.STORAGE_BASE_URL)
		if (this.infographics === undefined) {
			this.$store.dispatch('infographics/fetchInfographics')
		}
	}
}
</script>
<style lang="scss" scoped>
	#infographics {
		.shadow-sm {
			background-color: #ffffff;
			overflow-y: auto;
		}
	}
</style>
