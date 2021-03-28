import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    languagesList: {
        0: 'ru',
        1: 'en'
    },
    pageLanguage: 0,
    content: {
        en: {
            introLogo: 'intro-logo_en.png',
            introFirstSlideText: 'Experience, Century-Old History Scientific Developments Discoveries and Personalities'
        },
        ru: {
            introLogo: 'intro-logo_ru.png',
            introFirstSlideText: 'Опыт, вековая история, научные разработки, открытия и личности'
        }
    }
  },
  mutations: {
    SET_PAGE_LANGUAGE (state, languageIndex) {
        state.pageLanguage = languageIndex
    }
  },
  actions: {
    SET_PAGE_LANGUAGE_TO_STORE({ commit }, languageIndex){
        commit("SET_PAGE_LANGUAGE", languageIndex);
    }
  }
  
})
