export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
	head: {
			title: 'Dashboard - Medcoach',
			htmlAttrs: {
				lang: 'en'
			},
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{ hid: 'description', name: 'description', content: '' },
			],
			link: [
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
				{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css", integrity: "sha384-wEmeIV1mKuiNpC+IOBjI7aAzPcEZeedi5yW5f2yOq55WWLwNGmvvx4Um1vskeMj0", crossorigin: "anonymous" },
				{ rel: "stylesheet", href: "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css", integrity: "sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T", crossorigin:"anonymous" },
				{ rel: "stylesheet", href: "https://use.fontawesome.com/releases/v5.2.0/css/all.css", integrity: "sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ", crossorigin: "anonymous" },
				{ rel: "preconnect", href: "https://fonts.gstatic.com" },
				{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Montserrat" },
				{ rel: "stylesheet", href: "https://unpkg.com/select2@4.0.3/dist/css/select2.min.css", type: "text/css" },
				{ href: "https://cdn.quilljs.com/1.3.6/quill.snow.css", rel: "stylesheet" },
				{ rel: "stylesheet", href: "style-sheet_chrome.css", type: "text/chrome/safari" }
			],
			script: [
				{ src: "https://code.jquery.com/jquery-3.2.1.slim.min.js", integrity: "sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN", crossorigin: "anonymous" },
				{ src: "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js", integrity: "sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q", crossorigin: "anonymous" },
				{ src: "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js", integrity: "sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl", crossorigin: "anonymous" },
				{ src: "https://unpkg.com/select2@4.0.3/dist/js/select2.js" },

				{ src: "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js", integrity: "sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM", crossorigin: "anonymous" },
				{ src: "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js", integrity: "sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p", crossorigin: "anonymous" },
				{ src: "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js", integrity: "sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF", crossorigin: "anonymous" }
			],
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [
		'quill/dist/quill.core.css',
		'quill/dist/quill.snow.css',
		'quill/dist/quill.bubble.css',
		'@/assets/css/normalize.css',
	],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
		{ src: '~/plugins/axios'},
		{ src: '~/plugins/nuxt-quill-plugin', ssr: false }
	],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		'@nuxtjs/axios'
	],

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {
		// plugins: [
		// 	new webpack.ProvidePlugin({
		// 		'window.Quill': 'quill/dist/quill.js',
		// 		'Quill': 'quill/dist/quill.js'
		// 	})
		// ],
	},
	env: {
		baseUrl: process.env.BASE_PATH || 'https://1ux80d7y1m.execute-api.us-east-1.amazonaws.com/api'
	}
}
