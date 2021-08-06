<template>
    <div>
        <!-- 'Falta de ortografía',
        'Desactualizada',
        'Incomprensible',
        'Respuesta incorrecta',
        'Error de redacción',
        'Otros' -->
        <Navigation />
        
        <div class="report-conteiner">
            <div class="title">
                <h1>Reportes</h1>
            </div>

            <Loading v-if="loading" />

            <div v-if="!loading" class="filter-conteiner">
                <div class="search">
                    <input v-model="search" type="searchText" placeholder="Buscar" @keyup.enter="searchReports">
                </div>
                
                <div class="select-container">
                    <select v-model="resolvedSelected" class="options" @change="getReports">
                        <option value=false>Sin resolver</option>
                        <option value=true>Resueltos</option>
                    </select>
                </div>
            </div>

            <div v-if="!loading" class="table-container">
                <table class="table table-bordered">
                    <thead class="thead-admin">
                        <tr>
                            <th scope="col">No. caso</th>
                            <th scope="col">Tipo</th>
                            <th scope="col">Estudiante</th>
                            <th scope="col">Descripcion</th>
                            <th scope="col">Acciones</th>

                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(report) in reports" :key="report._id">
                            <td>{{ report.case_id.spotlight_id }}</td>
                            <td>{{ report.type }}</td>
                            <td>{{ report.student_id.name + " " + report.student_id.last_name }}</td>
                            <td>{{ report.description }}</td>
                            <td>
                                <button class="btn edit" @click="reportDetails(report._id)"><i class="fas fa-pencil-alt"></i> Editar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="!loading" class="pagination-container">
                <div class="results-container">
                    <span>Resultados por página: </span>
                    <select v-model="pageResults" class="js-example-basic-single" @change="rowsChange">
                        <option value=1>1</option>
                        <option value=2>2</option>
                        <option value=3>3</option>
                        <option value=5>5</option>
                        <option value=10>10</option>
                        <option value=15>15</option>
                    </select>
                </div>

                <div class="arrows-container">
                    <span>{{ (page - 1) * pageResults + 1 }} - {{ pageResults > totalReports ? totalReports : (page * pageResults) > totalReports ? totalReports : page * pageResults }} de {{totalReports}} reportes</span>
                    <button class="btn fas fa-chevron-left" @click="before" :disabled="disbaledBefore == 1"></button>
                    <button class="btn fas fa-chevron-right" @click="after" :disabled="disabledAfter == 1"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Navigation from '../../../components/navs/Navigation';
import Loading from '../../../components/modals/Loading';

export default {
    components: {
        Navigation,
        Loading
    },
    data() {
        return {
            loading: false,
            reports: [],
            resolvedSelected: false,
            search: '',

            disabledAfter: 0,
            disbaledBefore: 0,
            totalReports: 0,
            page: 1,
            pageResults: 10,
        }
    },
    async created() {
        if (process.browser) 
            this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`

        await this.getReports();
        this.before();
    },
    methods: {
        async getReports() {
            try {
                this.loading = !this.loading;

                let reportsResponse = await this.$axios.get('/getAllReports', {
                    params: {
                        page: this.page,
                        pageResults: this.pageResults,
                        resolved: this.resolvedSelected,
                        spotlight_id: this.search
                    }
                });
                this.reports = reportsResponse.data.payload.reports;
                this.totalReports = reportsResponse.data.payload.length;
                console.log('reports', reportsResponse.data.payload.reports);

                this.loading = !this.loading;
            } catch (err) {
                console.log(err);
            }
        },
        reportDetails(report_id) {
            this.$router.push({ path: `/administratorsPages/reports/${report_id}` });
        },
        searchReports() {
            try {
                this.getReports();
            } catch (err) {
                console.log(err);
            }
        },
        rowsChange() {
            this.page = 1;

            if (this.pageResults > this.totalReports || this.totalReports == 0) {
                this.disabledAfter = 1
                this.disbaledBefore = 1
            } else {
                this.disbaledBefore = 1
                this.disabledAfter = 0
            }

            this.getReports()
        },
        before() {
            if (this.page == 1) {
                this.disbaledBefore = 1
                if (this.totalReports == 0)
                    this.disabledAfter = 1
                else {
                    if (this.totalReports > this.pageResults)
                        this.disabledAfter = 0
                    else
                        this.disabledAfter = 1
                }
            } else if (this.page > 1) {
                this.page -= 1;
                this.disabledAfter = 0

                if (this.page == 1)
                    this.disbaledBefore = 1
                
                this.getReports();
            }
        },
        after() {
            this.page += 1;
            if (this.page * this.pageResults >= this.totalReports) {
                this.disabledAfter = 1
                this.disbaledBefore = 0
            } else {
                if (this.page > 1)
                    this.disbaledBefore = 0
            }
            // this.page += 1;
            // if (this.page * this.pageResults > this.totalReports) {
            //     this.disabledAfter = 1
            //     this.disbaledBefore = 0
            // } else {
            //     if (this.page > 1)
            //         this.disbaledBefore = 0
            //         if ((this.page * this.pageResults) >= this.totalReports)
            //             this.disabledAfter = 1
            // }

            this.getReports();
        }
    }
}
</script>

<style scoped>
    .report-conteiner {
        display: flex;
        flex-direction: column;
        font-family: Montserrat;
        margin: 20px 40px;
    }

    .title h1 {
        font-style: normal;
        font-weight: bold;
        font-size: 32px;
        line-height: 39px;
        color: #000000;
    }

    .filter-conteiner {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        height: 48px;
        margin: 20px 0px;
    }

    .search {
        display: flex;
        align-items: center;
        width: 60%;
        height: 100%;
    }

    .search input {
        padding: 12px;
        width: 800px;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #D4D5D7;
        box-sizing: border-box;
        border-radius: 10px;
    }

    .select-container {
        display: flex;
        height: 32px;
        margin: 0px 40px;
        width: 100%;
    }

    .select-container select {
        height: 32px;
        width: 25%;
        margin: 0px 20px;
        border: none;
        border-bottom: 1px solid #000;
        background-color: transparent;
        background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill=''><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;
        background-size: 12px;
        background-position: calc(100% - 10px) center;
        background-repeat: no-repeat;
        -webkit-appearance: none;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        border-bottom-left-radius: 0px;
    }

    .select-container select:focus {
        outline: none;
    }

    .table-container {
        margin: 20px 0px;
    }

    .thead-admin {
        background: #212529;
        color: #FFF;
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 15px;
        letter-spacing: 1px;
        text-transform: uppercase;
    }

    .thead-admin th:last-child {
        border-radius: 0px 15px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 0px 15px 0px 0px;
        -webkit-border-radius: 0px 15px 0px 0px;
    }

    .thead-admin th:first-child {
        border-radius: 15px 0px 0px 0px;
        border: 1px solid white;
        -moz-border-radius: 15px 0px 0px 0px;
        -webkit-border-radius: 15px 0px 0px 0px;
    }

    .tbody {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 18px;
        color: #212529;
    }

    td {
        vertical-align: middle;
    }

    .edit {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 18px;
        color: #1CA4FC;
    }

    .edit i {
        margin: 0px 5px;
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
        height: 56px;
    }

    .results-container {
        display: flex;
        align-items: center;
        margin: 0px 40px;
    }

    .results-container span {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        margin: 0px 10px;
        color: #212529;
    }

    .arrows-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 0px 40px;
    }

    .arrows-container span {
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        color: #212529;
    }

    .arrows-container button {
        color: #FE9400;
    }
</style>