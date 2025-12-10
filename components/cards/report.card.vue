<template>
    <div class="card-container">
        <div class="info-container">
            <div class="name-container">
                <p class="title">Tipo:</p>
                <span class="content">{{report}}</span>
            </div>
        </div>
        <div class="info-container">
            <div class="name-container">
                <p class="title">Reporte:</p>
                <span class="content">{{typeReport}}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['typeReport', 'report']
}
</script>

<style scoped>
    .card-container {
        display: flex;
        flex-direction: column;
        padding: 10px;
        background: #FFFFFF;
        box-shadow: 0px 0px 20px #D4D5D7;
        border-radius: 10px;
    }

    .info-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 4px 0px;
    }

    .info-container p {
        margin: 0;
    }

    .title {
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        color: #1CA4FC;
    }

    .feedback {
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        color: #DB1212;
    }

    .content {
        margin: 0px 8px;
    }

    .icon {
        font-size: 8px;
        color: #1CA4FC;
        margin: 4px 4px;

    }

    .name-container {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>