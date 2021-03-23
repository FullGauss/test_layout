<template>
  <section class="intro-section">
    <div class="intro-section__mist"></div>

    <div class="intro-section__left-desktop-mist"></div>
    <div class="intro-section__right-desktop-mist"></div>

    <div class="intro-content">
      <a class="intro-content__logo" href="#">
        <img alt="main-logo" src="../assets/TPULogo.png">
      </a>
      <div class="language-changer">
        <div class="language-changer__button ru__button"
          :class="{active: isRuLanguage}"
          @click="isRuLanguage=true"
        >
          <span>RU</span>
        </div>
        <div class="language-changer__button eng__button"
          :class="{active: !isRuLanguage}"
          @click="isRuLanguage=false"
        >
          <span>EN</span>
        </div>
      </div>

      <div class="intro-content__description">
        <span>Опыт, вековая история, научные разработки, открытия и личности</span>
      </div>

      <div class="gallery-buttons-wrapper">
        <div class="gallery-buttons-wrapper__button left-button">
          <div class="button-arrow"></div>
        </div>
        <div class="gallery-buttons-wrapper__button right-button">
          <div class="button-arrow"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MainPageIntro',
  data() {
    return {
      isRuLanguage: true,
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus" src="./MainPageIntro.styl">


</style>
