export default function ({ $axios, redirect, store }) {
    // Base URL
    $axios.setBaseURL(process.env.BASE_PATH || 'https://8i22vr7bh1.execute-api.us-west-2.amazonaws.com/refinery/api/')
    // Content Type
    $axios.setHeader('Content-Type', 'application/json')
    // Interceptors
    $axios.onError((error) => {
        const code = parseInt(error.response && error.response.status)
        if (code === 403 || code === 402) {
        store.dispatch('killSession')
        redirect({ path: '/login', query: { invalid_token: 'Su token ha expirado' } })
        }
    })
  }