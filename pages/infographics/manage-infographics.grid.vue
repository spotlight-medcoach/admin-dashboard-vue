<template>
	<div class="d-flex flex-wrap justify-content-around">
		<div
			v-for="(infographic, index) in infographics"
			:key="index"
			class="infographic-item p-4 pointer"
		>
			<div
				class="infographic-preview"
				:class="{'disabled': loadingState}"
				:style="{'width': infographicCardSize+'px', 'height': infographicCardSize+'px'}"
				@click="selectedInfographic(index)"
			>
				<img
					:src="infographic.image"
					:alt="infographic.name"
				>
				<div
					v-if="overlayIcon"
					class="overlay-content d-flex justify-content-center align-items-center"
				>
					<b-icon v-bind="createIcon" font-scale="2" color="white" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	name: 'InfographicsGrid',
	props: {
		infographicCardSize: {
			type: Number,
			default: 0
		},
		overlayIcon: {
			type: String,
			default: undefined
		}
	},
	computed: {
		createIcon () {
			return {
				icon: this.overlayIcon
			}
		},
		...mapGetters({
			infographics: 'infographics/allInfographics',
			loadingState: 'infographics/loadingState'
		})
	},
	mounted () {
		if (this.infographics === undefined) {
			this.$store.dispatch('infographics/fetchInfographics')
		}
	},
	methods: {
		selectedInfographic (infographicIdx) {
			if (!this.loadingState) {
				this.$emit('onSelectedInfographic', infographicIdx)
			}
		}
	}
}
</script>
<style lang="scss" scoped>
	@import '@/assets/css/variables/color-palette.scss';
	.infographic-item {
		color: #{$main-500};
		.infographic-preview {
			position: relative;
			background-color: #eeeeee;
			img {
				object-fit: cover;
				object-position: center;
				width: 100%;
				height: 100%;
				transition: all 0.6s;
			}
			.overlay-content {
				position: absolute;
				background-color: rgba(#000000, 0.25);
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				width: 100%;
				height: 100%;
				z-index: -1;
				opacity: 0;
				transition: opacity 0.4s;
			}
			&:hover .overlay-content {
				z-index: 1;
				opacity: 1;
			}
			.disabled {
				opacity: 0.5;
			}
		}
	}
</style>
