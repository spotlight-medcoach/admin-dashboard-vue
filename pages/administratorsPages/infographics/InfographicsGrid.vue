<template>
	<div
		v-if="allInfographics && studentInfographics"
		class="d-flex flex-wrap justify-content-around"
	>
		<div
			v-for="(infographic, index) in infographics"
			:key="index"
			class="infographic-item p-4 pointer"
		>
			<div
				class="infographic-preview"
				:class="{'disabled': loadingState, 'hovered': infographic.learned}"
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
		<div v-if="infographics.length === 0" class="my-5">
			Sin resultados
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	name: 'InfographicsGrid',
	props: {
		topicId: {
			type: String,
			default: undefined
		},
		subtopicId: {
			type: String,
			default: undefined
		},
		infographicCardSize: {
			type: Number,
			default: 0
		},
		overlayIcon: {
			type: String,
			default: undefined
		}
	},
	data () {
		return {
			infographics: []
		}
	},
	computed: {
		createIcon () {
			return {
				icon: this.overlayIcon
			}
		},
		...mapGetters({
			loadingState: 'infographics/loadingState',
			allInfographics: 'infographics/allInfographics',
			studentInfographics: 'infographics/studentInfographics'
		})
	},
	watch: {
		topicId (topicId) {
			this.filterResults(topicId, this.subtopicId)
		},
		subtopicId (subtopicId) {
			this.filterResults(this.topicId, subtopicId)
		}
	},
	mounted () {
		if (this.infographics === undefined && this.loadingState === false) {
			this.$store.dispatch('infographics/fetchInfographics')
		} else if (this.topicId || this.subtopicId) {
			this.filterResults(this.topicId, this.subtopicId)
		}
	},
	methods: {
		selectedInfographic (filteredIdx) {
			if (!this.loadingState) {
				const selectedInfographic = this.infographics[filteredIdx]
				this.$emit('onSelectedInfographic', selectedInfographic._id)
			}
		},
		filterResults (topicId, subtopicId) {
			if (subtopicId) {
				this.filterBySubTopic()
			} else if (topicId) {
				this.filterByTopic()
			}
		},
		filterByTopic () {
			this.infographics = this.allInfographics.filter(
				infographic => infographic.topic_id === this.topicId
			)
		},
		filterBySubTopic () {
			this.infographics = this.allInfographics.filter(
				infographic => infographic.subtopic_id === this.subtopicId
			)
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
			transition: all 0.6s;
			img {
				object-fit: cover;
				object-position: center;
				width: 100%;
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
			&.hover:hover .overlay-content,
			&.hovered .overlay-content {
				z-index: 1;
				opacity: 1;
			}
			.disabled {
				opacity: 0.5;
			}
		}
	}
</style>
