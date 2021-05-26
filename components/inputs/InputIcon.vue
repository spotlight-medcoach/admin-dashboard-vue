<template>
    <div class="input-title">
        <div class="title">
            <i :class="icon"></i>
            <h3>{{ title }}</h3>
        </div>
        <input :type="type" :placeholder="placeholder" v-model="localValue">
    </div>
</template>

<script>
export default {
    props: ['type', 'placeholder', 'model', 'icon', 'title']

}
</script>

<style>
    .input-title {
        display: flex;
        flex-direction: column;
        /* align-items: center; */
        color: #1CA4FC;
    }

    .title {
        display: flex;
        flex-direction: row;
    }

    .input-title i {
        font-size: 24px;
        margin-right: 8px;
        /* margin: 0px 8px; */
    }

    .input-title h3 {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 550;
        font-size: 20px;
        margin-bottom: 0;
    }

    input {
        /* margin-left: 2.5rem; */
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