<template>
	<header class="head-navigation">
		<img src="../../assets/images/logo.svg" alt="">

		<nav class="nav">
			<div>
				<LinkNavigation
					to="/statistics"
					new_class="link nuxt-link-active"
					icon="fas fa-chart-bar"
					title="Análisis de banco" />
			</div>
			<div>
				<LinkNavigation 
					to="/findCase"
					new_class="link nuxt-link-active"
					icon="fas fa-search"
					title="Búsqueda de casos" />
			</div>
			<div>
				<LinkNavigation 
					to="/reviewNewQuestions"
					new_class="link nuxt-link-active"
					icon="fas fa-folder"
					title="Revisión de preguntas" />
			</div>
			<div>
				<LinkNavigation 
					to="/reports"
					new_class="link nuxt-link-active"
					icon="fas fa-exclamation-circle"
					title="Reportes" />
			</div>
			<div>
				<LinkNavigation 
					to="/requestedCases"
					new_class="link nuxt-link-active"
					icon="fas fa-list-alt"
					title="Solicitud de casos" />
			</div>
			<div>
				<LinkNavigation 
					to="/simulators"
					new_class="link nuxt-link-active"
					icon="fas fa-book-open"
					title="Simuladores" />
			</div>
			<div>
				<LinkNavigation 
					to="/spotlighters"
					new_class="link nuxt-link-active"
					icon="fas fa-user-friends"
					title="Spotlighters" />
			</div>
			<div>
				<LinkNavigation 
					to="/administrators"
					new_class="link nuxt-link-active"
					icon="fas fa-user-shield"
					title="Administradores" />
			</div>
		</nav>
		
		<div class="profile">
			<OptionsModal :show="showModal" @close="showModal = false" />
			<button class="fas fa-bars btn" @click="showModal = true"></button>
		</div>

	</header>
</template>

<script>
import LinkNavigation from '../LinkNavigation';
import OptionsModal from '../modals/OptionsModal';

export default {
	components: {
		LinkNavigation,
		OptionsModal
	},
	data() {
		return {
			showModal: false
		}
	},
	methods: {
		
	}
}
</script>

<style scoped>
	.head-navigation {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		height: 60px;
		background: #FFF;
		border-bottom: 1px solid #D4D5D7;
    }

    .head-navigation img {
		width: 220.11px;
		height: 28px;
		margin-left: 40px;
    }

    .profile {
		margin-left: auto;
		margin-right: 3%;
		color: #5F5F5F;
		background-color: #FFF;
    }

	.profile button {
		font-size: 36px;
	}

	.nav {
		display: flex;
		flex-direction: row;
		margin-top: 4px;
		margin: 0px 4%;
	}

	.nav div {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 125px;
	}

	.nuxt-link-exact-active {
        color:#fff;
        background-color:#FF9300;
        border-color: #FF9300;
    }

	.options {
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		background: red;
	}
</style>