export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
	head: {
			title: 'dashboard-admin-spotlight',
			htmlAttrs: {
				lang: 'en'
			},
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{ hid: 'description', name: 'description', content: '' }
			],
			link: [
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
			  	{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css", integrity: "sha384-wEmeIV1mKuiNpC+IOBjI7aAzPcEZeedi5yW5f2yOq55WWLwNGmvvx4Um1vskeMj0", crossorigin: "anonymous" }
			]
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [
	],

	script: [
		{ src: "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js", integrity: "sha384-p34f1UUtsS3wqzfto5wAAmdvj+osOnFyQFpp4Ua3gs/ZVWx6oOypYoCJhGGScy+8", crossorigin: "anonymous" }

	],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
	],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
	],

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {
	}
}
