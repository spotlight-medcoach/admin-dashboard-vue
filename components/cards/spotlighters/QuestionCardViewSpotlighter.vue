<template>
    <div class="question-container">
        <div class="question-body">
            <div class="question-title">
                <h3 class="index">{{ind + 1}}.</h3>
                <h3 class="content">{{question.question.content.ops[0].insert}}</h3>
            </div>
            <div class="icons">
                <button class="btn edit" @click="$emit('viewQuestion')"><i class="fas fa-eye"></i></button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['question', 'ind']
}
</script>

<style scoped>
    .question-container {
        display: flex;
        flex-direction: column;
        margin: 10px 0px;
    }
    .question-body {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    
    .question-title {
        display: flex;
        flex-direction: row;
        padding: 4px 20px;
        align-items: center;
        width: 85%;
    }

    .question-title h3 {
        margin-bottom: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .content {
        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 20px;
        color: #212529;
        /* margin: 0px 12px; */
    }

    .index {
        margin: 0px 8px;
        color: #FE9400;
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
        margin: 0px 12px;
    }

    .edit {
        color: #1CA4FC;
        font-size: 24px;
    }

    .delete {
        color: #DB1212;
        font-size: 24px;
    }
    /* .icons {
        font-size: 24px;
    } */
</style>