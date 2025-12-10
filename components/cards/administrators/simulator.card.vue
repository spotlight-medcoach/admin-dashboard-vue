<template>
    <div class="card-container">
        <div class="title-container">
            <h3>{{title}}</h3>
        </div>
        <div class="id-container">
            <p class="title">ID:</p>
            <p class="content">{{id}}</p>
        </div>
        <div class="questions-container">
            <p class="title">Casos:</p>
            <p class="content">{{totalQuestions}}</p>
        </div>
        <div class="status-container">
            <p v-if="status" class="active"><i class="fas fa-circle icon"></i>Activo</p>
            <p v-else class="inactive"><i class="fas fa-circle icon"></i>Inactivo</p>
        </div>
        <div class="button-container">
            <button class="btn" @click="$emit('view')"><i class="fas fa-book-open"></i> Ir a simulador</button>
        </div>
    </div>
</template>

<script>
export default {
    props: ['title', 'id', 'totalQuestions', 'status']
}
</script>

<style scoped>
    .card-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: #FFFFFF;
        box-shadow: 0px 0px 20px #D4D5D7;
        border-radius: 10px;
        margin: 10px 0px;
    }

    .card-container p {
        margin-bottom: 0;
    }

    .title-container h3 {
        font-style: normal;
        font-weight: bold;
        font-size: 24px;
        line-height: 29px;
        color: #212529;
    }

    .id-container {
        display: flex;
        flex-direction: row;
    }

    .questions-container {
        display: flex;
        flex-direction: row;
    }

    .status-container i {
        margin: 0px 8px;
    }

    .title {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #1CA4FC;
    }

    .content {
        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 20px;
        color: #000000;
        margin: 0px 8px;
    }

    .active {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #2e9c15;
    }

    .inactive {
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 20px;
        color: #DB1212;
    }

    .button-container i {
        margin: 0px 8px;
    }

    .button-container button {
        padding: 12px 20px;
        background: #1CA4FC;
        color: #FFF;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 0px 20px;
    }
</style>