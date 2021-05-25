<template>
    <div class="load-container">
        <h2>Cargando...</h2>
        <div class="lds-dual-ring"></div>
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
        background: whitesmoke;
        margin: 2rem;
        padding: 2rem;
    }

    .lds-dual-ring {
        display: inline-block;
        width: 50px;
        height: 50px;
    }

    .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 44px;
        height: 44px;
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