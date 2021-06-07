<template>
    <div>
        <Navigation />
        <h1>Detalles del caso</h1>
        {{this.$route.params.id}}
        <!-- <Loading v-if="loading" />
        <div v-else class="details-container">
            <div class="back-btn">
                <nuxt-link to="/myCases">
                    <i class="fas fa-chevron-left"></i>
                    Volver
                </nuxt-link>
            </div>

            <div class="cancel-container">
                <h1>Detalles del caso</h1>
                <button type="button" class="btn cancel" @click="discardConfirm"><i class="fas fa-trash mr-5 pr-5"></i> Descartar caso</button>
            </div>

            <DescriptionCard
                :caseName="caseDetails.name"
                :id="caseDetails.pending_case_id"
                :language="caseDetails.language"
                :theStatus="caseDetails.status"
                :request_description="caseDetails.request_description"
                :topic="caseDetails.name_topic"
                :subtopic="caseDetails.name_subtopic" />
            
            <div class="description-container">
                <h1>Descripción del caso</h1>
                <quill-editor
                    v-model="content"
                    :options="editorOption" />
            </div>

            <div class="questions-container">
                <h1>Preguntas</h1>

                <div class="each-question">
                    <QuestionCard 
                        v-for="(ques, index) in questions"
                        :key="ques._id"
                        :question="ques"
                        :ind="index"
                        :updateQuestion="updateQuestion"
                        :deleteQuestion="deleteQuestion" />
                </div>

                <div class="add-question-container">
                    <button class="btn" @click="addQuestion"><i class="fas fa-plus-circle"></i> Agregar pregunta</button>
                </div>
            </div>

            <div class="buttons-container">
                <button class="btn draft" @click="draftConfirm"><i class="fas fa-save"></i> Guardar como borrador</button>
                <button class="btn send" @click="saveAndSendConfirm"><i class="fas fa-paper-plane"></i> Guardar y enviar caso</button>
            </div>
        </div>

        <AcceptModal 
            v-if="isShowModalAccept"
            @close="closeAcceptModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="saveAsDraft"
            :textButton="button"
            :isBusy="busyDraft" />

        <AcceptModal 
            v-if="isShowModalAccept"
            @close="closeAcceptModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="saveAndSend"
            :textButton="button"
            :isBusy="busySend" />

        <RejectModal 
            v-if="isShowModalReject"
            @close="closeRejectModal"
            :textTitle="titleModal"
            :textBody="bodyModal"
            :action="discardCase"
            :textButton="button"
            :isBusy="busyReject" /> -->

    </div>
</template>

<script>
import Navigation from '../../components/navs/Navigation';
import Loading from '../../components/modals/Loading';

export default {
    components: {
        Navigation
    }
}
</script>

<style scoped>
    .details-container {
        display: flex;
        flex-direction: column;
        margin: 20px 40px;
        font-family: Montserrat;
    }

    .back-btn a {
        color: #000;
        text-decoration: none;
    }

    .cancel-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 20px 0px;
    }

    .cancel-container h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 32px;
        line-height: 39px;
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

    .description-container {
        display: flex;
        flex-direction: column;
        margin: 20px 0px;
    }

    .details-container h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
    }

    .questions-container {
        display: flex;
        flex-direction: column;
    }

    .questions-container h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 24px;
        margin: 0;
    }

    .each-question {
        display: flex;
        flex-direction: column;
    }

    .add-question-container i {
        color: #FFF;
        font-size: 20px;
        margin: 0px 6px;
    }

    .add-question-container button {
        padding: 12px 20px;
        color: #FFF;
        background: #FE9400;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 20px 0px;
    }

    .buttons-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    }

    .buttons-container button {
        padding: 12px 20px;
        box-shadow: 2px 3px 4px rgba(49, 51, 100, 0.2);
        border-radius: 10px;
        margin: 0px 20px;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        align-items: center;
    }

    .buttons-container i {
        margin: 0px 8px;
    }

    .draft {
        border: 1px solid #1CA4FC;
        color: #1CA4FC;
    }

    .send {
        background: #20B000;
        color: #FFF;
    }

</style>