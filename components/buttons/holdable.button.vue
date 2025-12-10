<template>
	<div
		class="holdable-button pointer d-inline-flex align-items-center justify-content-around"
		:class="{'holded' : isHoldOn || checked, 'disabled': disabled}"
		:style="`max-width: ${maxWidth}px`"
		@mousedown="holdOn()"
		@mouseup="holdOff()"
	>
		<b-icon :icon="checked ? 'check-circle-fill' : 'check-circle'" class="h5 m-2" />
		<div class="my-2 mr-2">
			<strong>{{ message }}</strong>
		</div>
		<span
			class="bg-layout"
			:style="`transition-duration: ${checkOnMiliseconds}ms`"
		></span>
	</div>
</template>
<script>
export default {
	name: 'HoldableButton',
	props: {
		message: {
			type: String,
			default: 'Manten presionado'
		},
		checkOnMiliseconds: { // tiempo delay para check
			type: Number,
			default: 3000
		},
		maxWidth: {
			type: Number,
			default: 200
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			holdTimeMiliseconds: 0,
			holdListener: undefined,
			checked: false,
			isHoldOn: false,
			step: 100
		}
	},
	methods: {
		holdOn () {
			this.isHoldOn = true // registra el evento de click
			clearInterval(this.holdListener)
			this.holdListener = setInterval(function () {
				this.holdTimeMiliseconds += this.step // cada 100ms se reporta a la variable que sigue en hold
				if (this.holdTimeMiliseconds >= this.checkOnMiliseconds) {
					// cuando el tiempo en hold es mayor o igual al tiempo establecido para check
					clearInterval(this.holdListener)
					this.$emit('onCheck')
					this.checked = true
					// se hace check y limpia buffer
				}
			}.bind(this), this.step)
		},
		holdOff () {
			this.isHoldOn = false // registra el evento unhold
			clearInterval(this.holdListener) // por si hubiera un evento previo de holdOn se limpia el buffer
			if (this.checked === false) {
				this.holdListener = setInterval(function () {
					this.holdTimeMiliseconds -= this.step // cada 100ms se reporta a la variable que no hay hold
					if (this.holdTimeMiliseconds <= 0) {
						// cuando el tiempo en holdOff es menor o igual a 0 detiene el proceso
						clearInterval(this.holdListener)
					}
				}.bind(this), this.step)
			}
		}
	}
}
</script>
<style lang="scss" scoped>
	@import '@/assets/css/variables/color-palette.scss';
	.holdable-button {
		position: relative;
		font-size: 14px;
		line-height: 17px;
		color: #{$neutral-700};
		.bg-layout {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background-color: #{$neutral-700};
			opacity: 0.2;
			transition: all 5s ease-in-out;
			border-radius: 5px 0 0 5px;
			margin-left: 100%;
			z-index: 0;
		}
		> * {
			z-index: 1;
		}
		.bi-check-circle-fill {
			color: #{$main-500} !important;
		}
	}
	.holdable-button.holded {
		> .bg-layout {
			background-color: #{$main-500};
			color: #{$neutral-1000};
			margin-left: 0px;
			border-radius: 5px;
		}
	}
	.holdable-button.disabled {
		pointer-events: none;
		opacity: 0.6;
	}
</style>
