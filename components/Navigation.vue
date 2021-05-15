<template>
	<header class="header">
		<img src="../assets/images/logo.svg" alt="" height="40" class="">

		<nav class="nav">
			<LinkNavigation
				to="/"
				new_class="fas fa-home link nuxt-link-active"
			/>
			<LinkNavigation 
				to="/statistics"
				new_class="fas fa-chart-bar link nuxt-link-active" />

			<LinkNavigation 
				to="/requestNewCases"
				new_class="fas fa-code link nuxt-link-active" />

			<LinkNavigation 
				to="/users"
				new_class="fas fa-users link nuxt-link-active" />

			<LinkNavigation 
				to="/reviewNewQuestions"
				new_class="fas fa-tasks link nuxt-link-active" />

			<LinkNavigation 
				to="/simulators"
				new_class="fas fa-file-alt fa-lg link nuxt-link-active" />

			<!-- <LinkNavigation 
				to="/statistics"
				class="fas fa-trophy" /> -->

			<LinkNavigation 
				to="/findCase"
				new_class="fas fa-search link nuxt-link-active" />

			<!-- <nuxt-link to="">8</nuxt-link>
			<nuxt-link to="">9</nuxt-link>
			<nuxt-link to="">10</nuxt-link>
			<nuxt-link to="">11</nuxt-link> -->
		</nav>
		<div class="profile">
			<LinkNavigation
				to="/profile"
				new_class="fas fa-user fa-2x"
			/>
		</div>
	</header>
</template>

<script>
import Logo from './Logo';
import LinkNavigation from './LinkNavigation';

export default {
	components: {
		Logo,
		LinkNavigation
	}
}
</script>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: whitesmoke;
	}

	.header img {
		margin-left: 3rem;
	}

	.header nav {
		margin-right: 6rem;
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.profile {
		margin-right: 4rem;
	}

	.profile a {
		padding-left: .6rem;
        padding-right: .6rem;
        padding-top: .6rem;
        padding-bottom: .6rem;
        border-radius: 50%;
        border: 1px solid #FF9300;
        text-decoration: none;

        margin: 1rem;
		font-weight: bold;
		color: #FFF;
        background: #FF9300;
	}

	.link {
        padding-left: .5rem;
        padding-right: .5rem;
        padding-top: .5rem;
        padding-bottom: .5rem;
        border-radius: 50%;
        border: 1px solid #929292;
        text-decoration: none;

        margin: 1rem;
		font-weight: bold;
		color: #FFF;
        background: #929292;
    }

	.nuxt-link-exact-active {
        color:#fff;
        background-color:#FF9300;
        border-color: #FF9300;
    }

</style>