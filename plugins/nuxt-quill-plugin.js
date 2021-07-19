import Quill from 'quill'
import Vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'

let Font = Quill.import('formats/font');
Font.whitelist = ['montserrat'];
Quill.register(Font, true);

Vue.use(VueQuillEditor)