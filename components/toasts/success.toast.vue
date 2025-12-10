<template>
    <div aria-live="polite" aria-atomic="true" style="position: relative; min-height: 200px;">
        <div class="toast my-toast">
            <div class="toast-header">
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body">
                <span>{{textTitle}}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['textTitle']
}
</script>

<style scoped>
    .my-toast {
        background: #D5FFCB;
        position: fixed;
        top: 5%;
        right: 3%;
    }

    .toast:not(.showing):not(.show) {
        opacity: 1;
        -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
        animation: fadein 0.5s, fadeout 0.5s 2.5s;
    }

    .toast-header {
        display: flex;
        justify-content: flex-end;
        background-color: #D5FFCB;
        padding: 0px;
    }

    .toast-header button {
        color: #DB1212;
        margin: 2px 8px;
    }

    .toast-body span {
        margin: 0;
        font-weight: bold;
    }

    /* Animations to fade the snackbar in and out */
    @-webkit-keyframes fadein {
        from {top: 5%; right: 3%; opacity: 0;}
        to {top: 5%; right: 3%; opacity: 1;}
    }

    @keyframes fadein {
        from {top: 5%; right: 3%; opacity: 0;}
        to {top: 5%; right: 3%; opacity: 1;}
    }

    @-webkit-keyframes fadeout {
        from {top: 5%; right: 3%; opacity: 1;}
        to {top: 5%; right: 3%; opacity: 0;}
    }

    @keyframes fadeout {
        from {top: 5%; right: 3%; opacity: 1;}
        to {top: 5%; right: 3%; opacity: 0;}
    }
</style>