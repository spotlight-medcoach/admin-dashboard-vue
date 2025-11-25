const storage = process.env.STORAGE_BASE_URL;

export const state = () => ({
  infographics: undefined,
  studentInfographics: undefined,
  loadingState: true,
});

export const getters = {
  allInfographics: (state) => state.infographics,
  studentInfographics: (state) => state.studentInfographics,
  loadingState: (state) => state.loadingState,
};

export const mutations = {
  setLoadingState(state, loadingState) {
    state.loadingState = loadingState;
  },
  setInfographics(state, infographics) {
    state.infographics = infographics;
  },
  setStudentInfographics(state, studentInfographics) {
    state.studentInfographics = studentInfographics;
  },
  addInfographic(state, infographic) {
    state.infographics.unshift(infographic);
  },
  addStudentInfographic(state, studentInfographic) {
    state.studentInfographics.push(studentInfographic);
  },
  removeInfographic(state, infographicId) {
    const idx = state.infographics.findIndex(
      (infographic) => infographic._id === infographicId
    );
    state.infographics.splice(idx, 1);
  },
  sendInfographicToLast(state, infographicId) {
    const infographicIdx = state.infographics.findIndex(
      (infographic) => infographic._id === infographicId
    );
    const infographic = state.infographics[infographicIdx];
    state.infographics.splice(infographicIdx, 1);
    state.infographics.push(infographic);
  },
  markInfographicAsLearned(state, infographicId) {
    const infographicIdx = state.infographics.findIndex(
      (infographic) => infographic._id === infographicId
    );
    state.infographics[infographicIdx].learned = true;
  },
};

export const actions = {
  fetchInfographics({ commit }) {
    commit("setLoadingState", true);
    this.$axios
      .get("/infographics")
      .then((infographicsResponse) => {
        const allInfographics = infographicsResponse.data.infographics;
        commit(
          "setInfographics",
          allInfographics.map((infographic) => {
            infographic.image = storage + "/infographics/" + infographic.image;
            return infographic;
          })
        );
        return true;
      })
      .catch((error) => {
        return error;
      })
      .finally(() => {
        commit("setLoadingState", false);
      });
  },
  async createInfographic({ commit }, infographic) {
    commit("setLoadingState", true);
    try {
      // Obtener la extensión del archivo desde el base64 o del objeto File
      let fileExtension = "jpg"; // default
      if (infographic.file) {
        // Si tenemos el objeto File, usar su tipo
        const fileType = infographic.file.type;
        fileExtension = fileType.split("/")[1] || "jpg";
      } else if (infographic.base64) {
        // Si solo tenemos base64, extraer la extensión
        const match = infographic.base64.match(/data:image\/(\w+);base64/);
        fileExtension = match ? match[1] : "jpg";
      }

      // Obtener presigned URL del backend
      const presignedResponse = await this.$axios.post(
        "/infographic/upload-image",
        {
          name: infographic.name,
          topic_id: infographic.topic_id,
          subtopic_id: infographic.subtopic_id,
          fileExtension: fileExtension,
        }
      );

      const { fileName, uploadUrl } = presignedResponse.data;

      // Convertir base64 a blob si es necesario
      let fileBlob;
      if (infographic.file) {
        fileBlob = infographic.file;
      } else if (infographic.base64) {
        // Convertir base64 a blob
        const base64Data = infographic.base64.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileBlob = new Blob([byteArray], { type: `image/${fileExtension}` });
      } else {
        throw new Error("No file or base64 provided");
      }

      // Subir directamente a S3 usando la presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: fileBlob,
        headers: {
          "Content-Type": `image/${fileExtension}`,
          "x-amz-acl": "public-read",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to S3");
      }

      // Crear la infografía con el nombre del archivo
      const response = await this.$axios.post("/infographic", {
        name: infographic.name,
        topic_id: infographic.topic_id,
        subtopic_id: infographic.subtopic_id,
        image: fileName,
      });

      const newInfographic = response.data;
      newInfographic.image = storage + "/infographics/" + newInfographic.image;
      commit("addInfographic", newInfographic);
      return newInfographic;
    } catch (error) {
      console.error("Error creating infographic:", error);
      return error;
    } finally {
      commit("setLoadingState", false);
    }
  },
  deleteInfographic({ commit }, infographicId) {
    commit("setLoadingState", true);
    return this.$axios
      .delete("/infographic", { data: { infographic_id: infographicId } })
      .then((response) => {
        commit("removeInfographic", infographicId);
        return response;
      })
      .catch((error) => {
        return error;
      })
      .finally(() => {
        commit("setLoadingState", false);
      });
  },
  setInfographicToStudent({ commit }, infographicId) {
    commit("setLoadingState", true);
    return this.$axios
      .post("/student/infographic", { infographic_id: infographicId })
      .then((sudentInfographic) => {
        commit("addStudentInfographic", sudentInfographic);
        commit("markInfographicAsLearned", infographicId);
        commit("sendInfographicToLast", infographicId);
        return sudentInfographic;
      })
      .catch((error) => {
        return error;
      })
      .finally(() => {
        commit("setLoadingState", false);
      });
  },
};
