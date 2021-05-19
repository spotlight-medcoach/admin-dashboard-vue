<template>
    <header class="head-login">
		<img src="../assets/images/logo.svg" alt="">

		<!-- <nav class="bg-info"> -->
			<!-- <LinkNavigation
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

			<LinkNavigation 
				to="/findCase"
				new_class="fas fa-search link nuxt-link-active" /> -->
		<!-- </nav> -->
		<!-- <div class="profile"> -->
		<LinkNavigation
			to="/profile"
			new_class="fas fa-bars"
		/>
		<!-- </div> -->
	</header>
</template>

<script>
export default {

}
</script>

<style>
    .head-login {
        position: relative;
        /* width: 1920px; */
        height: 80px;
        background: #FFFFFF;
    }

    .head-login img {
        position: absolute;
        width: 283px;
        height: 36px;
        left: 40px;
        top: calc(50% - 36px/2);
    }

    .head-login a {
        position: absolute;
        right: 40px;
        top: calc(50% - 48px/2);
        text-decoration: none;
        color: #5F5F5F;
		font-size: 48px;
    }
</style>