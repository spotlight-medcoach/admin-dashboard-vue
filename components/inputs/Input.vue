<template>
    <input :type="type" :placeholder="placeholder" v-model="localValue">
</template>

<script>
export default {
    props: ['type', 'placeholder', 'model'],
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
    input {
        margin-left: 2.5rem;
        margin-top: .5rem;
        background-color:transparent;
        border: 0px solid;
        height:30px;
        width:260px;
        border-bottom: 2px solid lightgray;
        font-family: Montserrat;
    }

    input:focus {
        outline: none;
    }
</style>