export default function ({ $axios, redirect, store }) {
    // Base URL
    
    $axios.setBaseURL(process.env.BASE_PATH || 'https://1ux80d7y1m.execute-api.us-east-1.amazonaws.com/api')
    // $axios.setBaseURL(process.env.BASE_PATH || 'http://localhost:3005/api')
    // Content Type
    $axios.setHeader('Content-Type', 'application/json')
    // Interceptors
    $axios.onError((error) => {
        const code = parseInt(error.response && error.response.status)
        console.log('axios code', code);
        if (code === 403 || code === 402 || code === 500) {
            store.dispatch('killSession')
            redirect({ path: '/' })
        }
    })
  }