<template>
    <div class="aech-container">
        <div class="question-body">
            <div class="question-title">
                <h3 class="index">{{ind + 1}}.</h3>
                <h3 class="content">{{question}}</h3>
            </div>
            <div class="icons">
                <button class="btn fas fa-eye view" @click="$emit('view')"></button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['ind', 'question']
}
</script>

<style scoped>
    .aech-container {
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
    }

    .question-title h3 {
        margin-bottom: 0;
    }

    .content {
        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 20px;
        color: #212529;
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

    .view {
        color: #1CA4FC;
        font-size: 24px;
    }
</style>