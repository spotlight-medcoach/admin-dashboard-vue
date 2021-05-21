<template>
	<header class="head-navigation">
		<img src="../../assets/images/logo.svg" alt="">

		<nav class="nav">
			<div>
				<LinkNavigation
					to="/statistics"
					new_class="fas fa-chart-bar link" />
			</div>
			<div>
				<LinkNavigation 
					to="/findCase"
					new_class="fas fa-search link" />
			</div>
			<div>
				<LinkNavigation 
					to="/"
					new_class="fas fa-folder link nuxt-link-active" />
			</div>
			<div>
				<LinkNavigation 
					to="/reports"
					new_class="fas fa-exclamation-circle link nuxt-link-active" />
			</div>
			<div>
				<LinkNavigation 
					to="/"
					new_class="fas fa-list-alt link nuxt-link-active" />
			</div>
			<div>
				<LinkNavigation 
					to="/"
					new_class="fas fa-book-open link nuxt-link-active" />
			</div>
			<div>
				<LinkNavigation 
					to="/spotlighters"
					new_class="fas fa-user-friends link" />
			</div>
			<div>
				<LinkNavigation 
					to="/administrators"
					new_class="fas fa-user-shield link" />
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
		height: 80px;
		background: #FFF;
		border-bottom: 1px solid #D4D5D7;
    }

    .head-navigation img {
		height: 36px;
		margin-left: 4%;
		margin-right: 4%;
    }

    .profile {
		margin-left: auto;
		margin-right: 3%;
		color: #5F5F5F;
		background-color: #FFF;
    }

	.profile button {
		font-size: 30px;
	}

	.nav {
		display: flex;
		flex-direction: row;
		margin-left: 2%;
		margin-right: 4%;
	}

	.nav div {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: .0001%;
		margin-right: .0001%;
		width: 80px;
		height: 80px;
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
		/* top: 5%; */
	}
</style>