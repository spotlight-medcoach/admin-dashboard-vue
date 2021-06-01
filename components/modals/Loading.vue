<template>
    <div class="load-container">
        <div class="lds-dual-ring"></div>
        <h2>Cargando... Por favor, espera un momento</h2>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
    .load-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: #FFF;
        margin: 2rem;
        padding: 2rem;
    }

    .load-container h2 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
        display: flex;
        color: #9E9E9E;
        margin-bottom: 0;
        margin-top: 23px;
    }

    .lds-dual-ring {
        display: inline-block;
        width: 160px;
        height: 160px;
    }

    .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 160px;
        height: 160px;
        /* margin: 8px; */
        border-radius: 50%;
        border: 6px solid #FE9400;
        border-color: #FE9400 transparent #FE9400 transparent;
        animation: lds-dual-ring 1.2s linear infinite;
    }

    @keyframes lds-dual-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>