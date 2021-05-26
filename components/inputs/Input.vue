<template>
    <div class="input-title">
        <div class="title">
            <h3>{{ title }}</h3>
        </div>
        <input :type="type" :placeholder="placeholder" v-model="localValue">
        <h2>{{model}}</h2>
    </div>
</template>

<script>
export default {
    props: ['type', 'placeholder', 'model', 'title'],
    data() {
        return {
            localValue: this.model
        }
    },
    watch: {
        localValue (newValue) {
            this.$emit('input', newValue)
        },
        value (newValue) {
            this.localValue = value
        }
    }
}
</script>

<style scoped>
    .input-title {
        display: flex;
        flex-direction: column;
        color: #1CA4FC;
    }

    .title {
        display: flex;
        flex-direction: row;
    }

    .input-title h3 {
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 0;
    }

    input {
        margin-top: .5rem;
        background-color:transparent;
        border: 0px solid;
        height:30px;
        width: 100%;
        border-bottom: 2px solid lightgray;
        font-family: Montserrat;
    }

    input:focus {
        outline: none;
    }
</style>