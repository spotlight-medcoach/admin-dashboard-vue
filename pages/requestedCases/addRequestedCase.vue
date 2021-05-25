<template>
    <div>
        <Navigation />
        <div class="add-case-container">
            <div class="btn-container">
                <nuxt-link to="/requestedCases">
                    <i class="fas fa-chevron-left"></i>
                    Volver
                </nuxt-link>
            </div>

            <div class="form-container">
                <div class="title-container">
                    <h1>Solicitar nuevo caso</h1>
                    <button type="button" class="btn cancel" @click="discardCase"><i class="fas fa-trash mr-5 pr-5"></i> Descartar caso</button>
                </div>

                <div class="inputs-container">
                    <div class="input-name">
                        <InputTitle 
                            icon=""
                            title="Nombre del caso" />

                        <Input
                            type="text"
                            placeholder="Example"
                            v-model="case_name" />
                    </div>

                    <div class="">
                        <InputTitle 
                            icon=""
                            title="ID" />
                        <Input
                            type="text"
                            placeholder="123456"
                            v-model="case_id" />
                    </div>
                </div>

                <div class="inputs-container topic-container">
                    <div class="">
                        <InputTitle 
                            icon=""
                            title="Tema" />
                        <Input
                            type="text"
                            placeholder="Texto"
                            v-model="topic" />
                    </div>

                    <div class="">
                        <InputTitle 
                            icon=""
                            title="Subtema" />
                        <Input
                            type="text"
                            placeholder="Texto"
                            v-model="subtopic" />
                    </div>

                    <div class="">
                        <InputTitle 
                            icon=""
                            title="Idioma" />
                        <Input
                            type="text"
                            placeholder="Español"
                            v-model="language" />
                    </div>
                </div>

                <div class="inputs-container">
                    <div class="description">
                        <InputTitle 
                            icon=""
                            title="Descripción" />
                        <textarea
                            name="description"
                            id="description"
                            v-model="description"
                            rows="7"
                            placeholder="Lorem ipsum dolor, sit amet consectetur adipisicing elit. Veniam, nobis expedita provident eveniet distinctio odio iusto recusandae facere. Molestiae, consectetur. Corporis temporibus voluptate velit quis quae animi cumque nobis tenetur."></textarea>
                    </div>
                </div>

                <select class="" v-model="selected" @change="usersSelected(selected)">
                    <option value="" selected>Seleccionar estudiantes</option>
                    <option v-bind:value="user" v-for="user in users" :key="user._id">
                        {{ user.name }}
                    </option>
                </select>

                <h2 v-for="user in users_selected" :key="user._id" class="">{{ user.name}} {{user.last_name}} <i class="fas fa-user-times" @click="removeItem(user)"></i> </h2>

                <div class="add-btn">
                    <SuccessButton 
                        :text="'Solicitar nuevo caso'"
                        :click="add"
                        :new_class="'btn'"
                        :i_class="'fas fa-list-alt'" /> 
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Input from '../../components/inputs/Input';
import InputTitle from '../../components/inputs/InputTitle';
import SuccessButton from '../../components/buttons/SuccessButton';

export default {
    components: {
        Navigation,
        Input,
        InputTitle,
        SuccessButton
    },
    data() {
        return {
            users: [],
            selected: '',
            users_selected: [],
            case_name: '',
            case_id: '',
            topic: '',
            subtopic: '',
            language: '',
            description: ''
        }
    },
    async created() {
        if (process.browser)
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
        
        await this.getUsers();
    },
    methods: {
        async getUsers() {
            try {
                let users = await this.$axios.get('/getAllAdminnistrator?status=true');
                console.log(users)
                this.users = users.data.administrators;
            } catch (err) {
                console.log(err);
            }
        },
        usersSelected(selected) {
            try {
                console.log('select: ', selected)
                if (selected != null) {
                    this.users_selected.push(selected)
                    this.users = this.users.filter(user => user._id !== selected._id)
                }
            } catch (err) {
                console.log(err);
            }
        },
        removeItem(user) {
            try {
                console.log('user: ', user)
                if (user != null) {
                    this.users.push(user)
                    this.users_selected = this.users_selected.filter(us => us._id !== user._id)
                }
            } catch (err) {
                console.log(err);
            }
        },
        add() {
            alert('agregar el caso')
        },
        discardCase() {
             this.$router.push({ path: '/requestedCases'});
        }
    }
}
</script>

<style scoped>
    .add-case-container {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
    }

    .btn-container {
        margin-top: 1.5%;
        margin-left: 3%;
    }
    
    .btn-container a {
        color: #000;
        text-decoration: none;
    }

    .form-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin: 2%;
    }

    .title-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }

    .cancel {
        font-family: Montserrat;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        color: #DB1212;
        margin-right: 2%;
    }

    .cancel i {
        margin: .5rem;
    }

    .inputs-container {
        display: flex;
        flex-direction: row;
        width: 100%;
        margin-top: 1%;
    }

    .input-name {
        width: 80%;
    }

    .topic-container {
        display: flex;
        justify-content: space-between;
    }

    .description {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    textarea {
        margin-top: 1%;
        border: 1px solid #000000;
        box-sizing: border-box;
        border-radius: 10px;
    }
    
    .select-users {
        margin-top: 2%;
    }

    .add-btn {
        display: flex;
        justify-content: flex-end;
        width: 100%;
    }

</style>