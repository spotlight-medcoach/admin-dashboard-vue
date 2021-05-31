<template>
    <div class="input-title">
        <div class="title">
            <i :class="icon"></i>
            <h3>{{ title }}</h3>
        </div>
        <input :type="type" :placeholder="placeholder" v-model="localValue" class="inp">
    </div>
</template>

<script>
export default {
    props: ['type', 'placeholder', 'model', 'val', 'icon', 'title'],
    data() {
        return {
            localValue: this.val
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

<style scope>
    .input-title {
        display: flex;
        flex-direction: column;
        color: #1CA4FC;
    }

    .title {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .input-title i {
        font-size: 24px;
        margin-right: 8px;
    }

    .input-title h3 {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        margin-bottom: 0;
    }

    .inp {
        margin-top: .5rem;
        background-color:transparent;
        border: 0px solid;
        height: 30px;
        width: 100%;
        border-bottom: 2px solid lightgray;
        font-family: Montserrat;
    }

    input:focus {
        outline: none;
    }
</style>