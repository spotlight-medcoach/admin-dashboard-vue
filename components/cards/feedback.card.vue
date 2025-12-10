<template>
    <div class="card-container">
        <div class="info-container">
            <div class="title-container">
                <h3>{{name}}</h3>
                <p>{{topicName}} <i class="fas fa-circle icon"></i> {{subtopicName}}</p>
            </div>
            <div class="description-container">
                <p>{{requestDescription}}</p>
            </div>
            <div class="edit-container">
                <button class="btn"><i class="fas fa-pencil-alt"></i> Editar</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['name', 'topicName', 'subtopicName', 'requestDescription']
}
</script>

<style scoped>
    .card-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        background: #FFFFFF;
        box-shadow: 0px 0px 20px #D4D5D7;
        border-radius: 10px;
        margin: 10px 0px;
        padding: 20px;
        height: 84px;
    }

    .info-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
    
    .icon {
        font-size: 8px;
        color: #1CA4FC;
        margin: 4px 4px;

    }

    .title-container h3 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
        color: #000000;
        margin: 2px 0px;
    }

    .title-container p {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 18px;
        color: #000000;
        margin: 0px 4px;
    }

    .description-container {
        width: 65%;
    }

    .description-container p {
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 21px;
        color: #000000;
        margin: 0px 20px;
    }

    .edit-container button {
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        color: #1CA4FC;
        margin: 0px 8px;
    }

    .edit-container i {
        margin: 0px 8px;
    }
</style>