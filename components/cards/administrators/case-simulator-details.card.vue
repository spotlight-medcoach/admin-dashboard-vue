<template>
    <div class="card-container">
        <div class="info-container">
            <div class="name-container">
                <p class="title">Nombre del caso:</p>
                <span class="content">{{caseName}}</span>
            </div>
            <div class="name-container">
                <p class="title">ID: </p>
                <span class="content">{{id}}</span>
            </div>
        </div>
        <div class="info-container">
            <div class="name-container">
                <p class="title">Idioma:</p>
                <span class="content">{{language}}</span>
            </div>
            <div class="name-container">
                <span class="content">{{topic}} <i class="fas fa-circle icon"></i> {{subtopic}}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['caseName', 'id', 'language', 'topic', 'subtopic'],
    data() {
        return {
            newStatus: this.theStatus
        }
    }
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