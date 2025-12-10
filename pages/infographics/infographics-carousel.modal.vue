<template>
	<b-modal
		id="infographics-carousel-modal"
		ref="infographics-carousel-modal"
		v-b-modal.infographics-delete-modal
		header-close-label="x"
		size="lg"
		header-class="p-0"
		title-class="w-100 pl-5"
		body-class="p-0"
		footer-class="p-0"
		header-text-variant="light"
		centered
	>
		<div slot="modal-header-close">
			<b-icon icon="x" font-scale="2" />
		</div>
		<div slot="modal-title">
			<span v-if="selectedInfographic">
				{{ selectedInfographic.name }}
			</span>
		</div>
		<b-carousel
			id="carousel-1"
			v-model="infographicIdx"
			:interval="0"
			controls
		>
			<b-carousel-slide
				v-for="(infographic, index) in allInfographics"
				:key="index"
				:img-src="infographic.image"
			/>
		</b-carousel>
		<div slot="modal-footer" class="mx-auto mt-4">
			<holdable-button
				v-if="selectedInfographic"
				class="rounded p-2"
				message="Marcar como aprendido"
				:max-width="300"
				:disabled="selectedInfographic.learned"
				@onCheck="markAsLearned"
			/>
			<b-button
				v-if="selectedInfographic"
				variant="light"
				class="download-button"
				:href="selectedInfographic.image"
				:download="selectedInfographic.name"
				target="_blank"
			>
				<b-icon icon="download" aria-hidden="true" />
			</b-button>
		</div>
	</b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import HoldableButton from '@/components/buttons/holdable.button.vue'
export default {
	name: 'InfographicsCarouselModal',
	components: {
		HoldableButton
	},
	props: {
		selectedInfographicId: {
			type: String,
			default: undefined
		}
	},
	data () {
		return {
			infographicIdx: 0
		}
	},
	computed: {
		selectedInfographic () {
			return this.allInfographics ? this.allInfographics[this.infographicIdx] : undefined
		},
		...mapGetters({
			allInfographics: 'infographics/allInfographics',
			studentInfographics: 'infographics/studentInfographics'
		})
	},
	watch: {
		selectedInfographicId (infographicId) {
			if (this.allInfographics) {
				this.infographicIdx = this.allInfographics.findIndex(infographic => infographic._id === infographicId)
			}
		}
	},
	mounted () {
		console.log(this.infographicIdx)
	},
	methods: {
		markAsLearned () {
			this.$refs['infographics-carousel-modal'].hide()
			this.$emit('onMarkAsLearned', this.selectedInfographicId)
		}
	}
}
</script>
<style lang="scss">
	#infographics-carousel-modal {
		text-align: center;
		.modal-content {
			background-color: transparent;
		}
		img {
			height: 60vh;
			object-fit: contain;
			object-position: center;
		}
		.holdable-button {
			background-color: #ffffff;
			width: 260px;
		}
		.download-button {
			position: absolute;
			margin-left: 1rem
		}
	}
</style>
