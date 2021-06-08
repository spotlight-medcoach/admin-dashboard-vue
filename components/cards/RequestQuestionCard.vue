<template>
    <div class="card-container">
        <div class="info-container">
            <div class="title-container">
                <h3>{{name}}</h3>
                <p>{{topicName}} <i class="fas fa-circle icon"></i> {{subtopicName}}</p>
            </div>
            <div class="description-container">
                <p>{{requestDescription.content}}</p>
            </div>
            <div class="edit-container">
                <button class="btn fas fa-check-circle accept" @click="$emit('aceptCase', id)"></button>
                <button class="btn fas fa-trash-alt reject" @click="$emit('rejectCase', id)"></button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: [
        'name',
        'topicName',
        'subtopicName',
        'requestDescription',
        'id'
    ]
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
        font-family: Montserrat;
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

    .title-container {
        width: 30%;
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
        width: 60%;
    }

    .description-container p {
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 21px;
        color: #000000;
        margin: 0px 20px;
    }

    .edit-container {
        width: 10%;
    }

    .accept {
        color: #20B000;
        font-size: 24px;
    }

    .reject {
        color: #DB1212;
        font-size: 24px;
    }
</style>