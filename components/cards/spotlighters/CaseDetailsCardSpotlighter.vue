<template>
    <div class="card-container">
        <div class="info-container">
            <div class="name-container">
                <p class="title">Nombre del caso:</p>
                <span class="content">{{caseName}}</span>
            </div>
            <div class="name-container">
                <p class="title">ID: </p>
                <span class="content">{{id}}</span>
            </div>
        </div>
        <div class="info-container">
            <div class="name-container">
                <p class="title">Idioma:</p>
                <span class="content">{{language}}</span>
            </div>

            <div class="name-container">
                <p class="title">Usuario:</p>
                <span class="content">{{user}}</span>
            </div>
        </div>
        <div class="info-container">
            <!-- <div class="name-container"> -->
                <div class="name-container">
                    <p class="title">Descripción requerida:</p>
                    <span class="content">{{request_description ? request_description : 'Sin descripción requerida' }}</span>
                </div>

                <div class="name-container">
                    <span class="content">{{topic}} <i class="fas fa-circle icon"></i> {{subtopic}}</span>
                </div>
        </div>

        <div :class="newStatus== 'With feedback' ? 'feedback-container' : 'status-container'">
            <div v-if="newStatus == 'With feedback'">
                <div class="feed-cont">
                    <p class="title">Feedback:</p>
                    <span class="content">{{ feedback }}</span>
                </div>
            </div>

            <div class="name-container">
                <div v-if="newStatus == 'Pending'" class="status">
                    <div class="pending">
                        Pendiente
                    </div>
                </div>
                <div v-else-if="newStatus == 'In edit'">
                    <div class="edit">
                        En edición
                    </div>
                </div>
                <div v-else-if="newStatus == 'Pending review'">
                    <div class="pending-review">
                        Revisión pendiente
                    </div>
                </div>
                <div v-else-if="newStatus == 'With feedback'">
                    <div class="feedback">
                        Feedback
                    </div>
                </div>
                <div v-else-if="newStatus == 'Accepted by Spotlighter'">
                    <div class="accepted">
                        Aceptado
                    </div>
                </div>
                <div v-else-if="newStatus == 'Approved'">
                    <div class="approved">
                        Aprobado
                    </div>
                </div>
            </div>  
        </div>
    </div>
</template>

<script>
export default {
    props: ['caseName', 'id', 'language', 'theStatus', 'request_description', 'feedback', 'topic', 'subtopic', 'user'],
    data() {
        return {
            newStatus: this.theStatus
        }
    }
}
</script>

<style scoped>
    .card-container {
        display: flex;
        flex-direction: column;
        padding: 10px;
        background: #FFFFFF;
        box-shadow: 0px 0px 20px #D4D5D7;
        border-radius: 10px;
    }

    .info-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 4px 0px;
    }

    .info-container p {
        margin: 0;
    }

    .status-container {
        display: flex;
        justify-content: flex-end;
    }

    .feedback-container {
        display: flex;
        justify-content: space-between;
    }

    .feed-cont {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin: 4px 0px;
    }

    .feed-cont p {
        margin: 0;
        color: #DB1212;
    }

    .pending {
        font-weight: bold;
        text-align: center;
        background: #D4D5D7;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .edit {
        font-weight: bold;
        text-align: center;
        background: #FFDE89;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .pending-review {
        font-weight: bold;
        text-align: center;
        background: #FBD6E9;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .feedback {
        font-weight: bold;
        text-align: center;
        background: #61C0FD;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .accepted {
        font-weight: bold;
        text-align: center;
        background: #C6E8FE;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .approved {
        font-weight: bold;
        text-align: center;
        background: #90DF7E;
        border-radius: 4px;
        padding: 4px 12px;
    }

    .title {
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        color: #1CA4FC;
    }

    .feedback {
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
    }

    .content {
        margin: 0px 8px;
    }

    .icon {
        font-size: 8px;
        color: #1CA4FC;
        margin: 4px 4px;

    }

    .name-container {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>