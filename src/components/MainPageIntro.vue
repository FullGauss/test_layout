<template>
  <section class="intro-section">
    <div ref="introSlider" class="slider">
      <div class="slider-wrapper">
        <div class="slider-items intro-card">
          <div class="card">
            <div class="intro-section__mist"></div>
            <div class="intro-section__left-desktop-mist"></div>
            <div class="intro-section__right-desktop-mist"></div>
            <div class="intro-background"></div>
            <div class="intro-content">
              <div class="intro-content__description">
                <span>{{introContent.introFirstSlideText}}</span>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="intro-section__mist"></div>
            <div class="intro-section__left-desktop-mist"></div>
            <div class="intro-section__right-desktop-mist"></div>
            <div class="intro-background"></div>
            <div class="intro-content">
              <div class="intro-content__description">
                <span>{{introContent.introFirstSlideText}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="slider-buttons-wrapper">
        <div class="slider-control slider-control-prev" role="button" aria-label="left slide button">
          <div class="button-arrow"></div>
        </div>
        <div class="slider-control slider-control-next" role="button" aria-label="right slide button">
          <div class="button-arrow"></div>
        </div>
      </div>
    </div>

    <a class="intro-logo" href="#">
      <img alt="main-logo" :src="require('../assets/'+introContent.introLogo)">
    </a>
    <div class="language-changer">
      <div class="language-changer__button ru__button"
        :class="{active: pageLanguage===0}"
        @click="changePageLanguage(0)"
      >
        <span>RU</span>
      </div>
      <div class="language-changer__button eng__button"
        :class="{active: pageLanguage===1}"
        @click="changePageLanguage(1)"
      >
        <span>EN</span>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Slider from "../slider";

export default {
  name: 'MainPageIntro',

  data() {
    return {}
  },

  computed: {
    ...mapState(['languagesList', 'pageLanguage', 'content']),

    language(){
      return this.languagesList[this.pageLanguage];
    },

    introContent () {
      return this.content[this.language];
    }
  },

  methods: {
    ...mapActions(['SET_PAGE_LANGUAGE_TO_STORE']),

    changePageLanguage (indexOfLanguage) {
      this.SET_PAGE_LANGUAGE_TO_STORE(indexOfLanguage);
    }
  },
  mounted() {
    const $introSlider = this.$refs.introSlider;
    Slider($introSlider, 1, 1).start();
  }
}
</script>

<style lang="stylus" src="./MainPageIntro.styl">


</style>
