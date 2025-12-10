<template>
	<div class="infographics-header d-flex justify-content-between">
		<h3 class="body-title-1 mb-4">Infográficos</h3>
		<b-button
			class="add-infographic-button"
			variant="primary"
			@click="createInfographic"
		>
			Agregar Infográfico
		</b-button>
	</div>
</template>

<script>
export default {
	name: 'InfographicsAdminHeader',
	methods: {
		createInfographic () {
			this.$bvModal.show('infographic-create-modal')
		}
	}
}
</script>
<style lang="scss" scoped>
	.add-infographic-button {
		padding: 12px 24px;
		min-width: 200px;
		border-radius: 9px;
	}
</style>
