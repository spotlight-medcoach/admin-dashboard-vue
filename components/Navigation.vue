<template>
	<header class="header">
		<nav>
			<nuxt-link to="/">Home</nuxt-link>
			<nuxt-link to="/statistics">Análisis de preguntas</nuxt-link>
			<nuxt-link to="/requestNewCases">Solicitar nuevos casos</nuxt-link>
			<nuxt-link to="/users">Usuarios</nuxt-link>
			<nuxt-link to="/reviewNewQuestions">Revisión de preguntas nuevas</nuxt-link>
			<nuxt-link to="/simulators">Simuladores</nuxt-link>
			<nuxt-link to="/findCase">Busqueda de casos</nuxt-link>
			<!-- <nuxt-link to="">8</nuxt-link>
			<nuxt-link to="">9</nuxt-link>
			<nuxt-link to="">10</nuxt-link>
			<nuxt-link to="">11</nuxt-link> -->
		</nav>
	</header>
</template>

<script>
export default {

}
</script>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: gray;
	}

	.header nav {
		margin: 2rem;
	}

	.header a {
		margin: 1rem;
		font-weight: bold;
		color: #FFF;
	}

</style>