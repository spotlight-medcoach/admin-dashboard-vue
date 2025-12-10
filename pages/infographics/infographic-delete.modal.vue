<template>
	<div v-if="infographics">
		<b-modal
			id="infographic-delete-modal"
			ref="infographic-delete-modal"
			title="Eliminar Infografía"
			cancel-title="Cancelar"
			ok-title="Sí, eliminar"
			ok-variant="danger"
			cancel-variant="light"
			header-class="pl-4"
			body-class="px-4"
			footer-class="d-flex justify-content-between"
			size="sm"
			centered
			@ok="deleteInfographic"
		>
			<template #modal-header-close>
				<b-icon icon="x" color="red" font-scale="1.1" />
			</template>
			<p v-if="selectedInfographic">
				Estás por eliminar la infografía
				<q>{{ selectedInfographic.name }}</q>
			</p>
		</b-modal>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	name: 'InfographicsDeleteModal',
	props: {
		selectedInfographicIdx: {
			type: Number,
			default: 0
		}
	},
	data () {
		return {
			infographicIdx: 0
		}
	},
	computed: {
		selectedInfographic () {
			return this.infographics[this.infographicIdx]
		},
		...mapGetters({
			infographics: 'infographics/allInfographics'
		})
	},
	watch: {
		selectedInfographicIdx () {
			this.infographicIdx = this.selectedInfographicIdx
		}
	},
	methods: {
		deleteInfographic () {
			const infographicId = this.selectedInfographic._id
			this.$store.dispatch('infographics/deleteInfographic', infographicId)
				.then((response) => {
					console.log(response)
					// this.$emit('onDelete', this.infographicIdx)
					// this.$refs['infographic-delete-modal'].hide()
				})
		}
	}
}
</script>
