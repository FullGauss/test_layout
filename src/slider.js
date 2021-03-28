import debounce from './debounce';
import {assert, isHTMLElement} from './libs';

/* Класс, отвечающий за слайдер*/
class SliderComponent{
  constructor($sliderElement, numberOfCardTablet, numberOfCardDesktop){
    assert(isHTMLElement($sliderElement), '$sliderElement is not HTMLElement');
    this.$sliderElement = $sliderElement; // слайдер
    this.$sliderContainer = $sliderElement.querySelector('.slider-items'); // враппер слайдера
    this.$sliderCards = $sliderElement.querySelectorAll('.card'); // карточки, из которых будут создаваться слайды
    this.$sliderItems = []; // переменная для хранения слайдов
    this.$sliderControls = $sliderElement.querySelectorAll('.slider-control'); // кнопки для переключения слайдов
    this.currentPosition = 0; // текущий слайд
    this.transformValue = 0; // значение transform для враппера
    this.transformStep = 100; // шаг трансформации
    this.itemsArray = []; // массив, в который записываются параметры каждого слайда
    this.indicatorIndex = 0; // индекс активного индикатора
    this.indicatorIndexMax = 0; // максимальный индекс индикатора
    this.$indicatorItems = []; // массив, для хранения индикаторов слайдов
    this.minItemPosition = 0; // позиция самого левого слайда
    this.maxItemPosition = 0; // позиция самого правого слайда
    this.debounceTimeout = 100; 
    this.tabletStartWidth = 720; // ширина экрана, с которого начининается планшетная версия слайдера
    this.numberOfCardsTablet= numberOfCardTablet; // количество карточек в одном слайде для планшетной версии
    this.desktopStartWidth = 1200; // ширина экрана, с которого начининается десктопная версия слайдера
    this.numberOfCardsDesktop = numberOfCardDesktop; // количество карточек в одном слайде для десктопной версии
    this.mobileScreenSliderIsEnabled = false; // переменная отслеживющая, нужно ли включить мобильную версию слайдера
    this.tabletScreenSliderIsEnabled = false; // переменная отслеживющая, нужно ли включить планшетную версию слайдера
    this.desktopScreenSliderIsEnabled = false; // переменная отслеживющая, нужно ли включить десктопную версию слайдера
    this.$indicatorsContainer; // контейнер для индикаторов
    this.startXCoord = null; // начальная абсцисса при touch cобытии
    this.startYCoord = null; // начальная ордината при touch cобытии
    this.screenWidth = null; // текущая ширина экрана
    this.swipeLocked = false; // событие, отслеживающее началось или закончилось событие touch
    return this;
  }

  // входная точка
  start(){
    this.initializeSlider();
    this.setTouchSwipeHandlers();
    window.addEventListener('resize', this.windowOnResizeHandler);
  }

  // метод происходящий при изменении ширины экрана 
  windowOnResizeHandler = debounce(() => {    
    this.initializeSlider();
  }, this.debounceTimeout)

  /* инициализация слайдера */
  initializeSlider(){
    if(this.isMobileScreen()){ // если экран мобильного устройства
      if (!this.mobileScreenSliderIsEnabled){  // и версия для мобильно экрана не была активна
        this.updateSlider(1); // обновить слайдер
        this.mobileScreenSliderIsEnabled = true; // теперь версия для мобильного экрана активна
        this.tabletScreenSliderIsEnabled = false;
        this.desktopScreenSliderIsEnabled = false;
      }
    }
    if(this.isTabletScreen()){ // если экран планшета
      if (!this.tabletScreenSliderIsEnabled){ // и версия для планшета не была активна
        this.updateSlider(this.numberOfCardsTablet); // обновить слайдер
        this.mobileScreenSliderIsEnabled = false; 
        this.tabletScreenSliderIsEnabled = true; // теперь версия для планшета активна
        this.desktopScreenSliderIsEnabled = false;
      }
    }
    if(this.isDesktopScreen()){ // если экран десктопа
      if (!this.desktopScreenSliderIsEnabled){ // и версия для десктопа не была активна
        this.updateSlider(this.numberOfCardsDesktop); // обновить слайдер
        this.mobileScreenSliderIsEnabled = false; 
        this.tabletScreenSliderIsEnabled = false; // теперь версия для десктопа активна
        this.desktopScreenSliderIsEnabled = true;
      }
    }
  }

  // проверка, мобильный ли экран
  isMobileScreen(){
    return document.documentElement.clientWidth < this.tabletStartWidth;
  }
  
  // проверка, на экран планшета
  isTabletScreen(){
    return document.documentElement.clientWidth >= this.tabletStartWidth && document.documentElement.clientWidth < this.desktopStartWidth;
  }

  // проверка, на экран десктопа
  isDesktopScreen(){
    return document.documentElement.clientWidth >= this.desktopStartWidth;
  }

  // метод, удаляющий слайды
  deleteOldItems(){
    for( let item of this.$sliderItems){
      item.remove();
    }
  }

  // метод, удаляющий индикаторы
  deleteOldIndicatorItems(){
    if(this.$indicatorsContainer){
      this.$indicatorsContainer.remove();
    }
  }

  // метод обновляющий/создающий слайдер, на основе того, сколько карточек будет на одном слайде
  updateSlider(numberOfCards){
    this.deleteOldItems();
    this.deleteOldIndicatorItems();
    this.createSliderItems(numberOfCards);
    this.addIndicators();
    this.itemsArray = [];
    this.fillItemsArray();
    this.indicatorIndex = 0;
    this.currentPosition = 0;
    this.maxItemPosition = this.$sliderItems.length - 1;
    this.indicatorIndexMax = this.$sliderItems.length - 1;
    this.minItemPosition = 0;
    this.transformValue = 0;
    this.moveSlideAnimation()
    this.enableOnClickControlsHandlers();
    this.setUpIndicatorOnClickEventHandlers();
  }

  // метод, для унификации события touch и mouse
  unify(e) {	
    return e.changedTouches ? e.changedTouches[0] : e ;
  }

  // метод, сообщающий, что начался swipe слайдера
  lock(e) { 
    this.startXCoord = this.unify(e).clientX;
    this.startYCoord = this.unify(e).clientY;

    this.swipeLocked = true;
  }

  // анимация swipe лайдера
  dragInteraction(e) {
    this.screenWidth = window.innerWidth;
    let dx = this.unify(e).clientX - this.startXCoord,
        f = +(dx/this.screenWidth).toFixed(2)*4,
        dy = this.unify(e).clientY - this.startYCoord;
        
    if(e.cancelable && dx > 2 * dy){
      e.preventDefault();
    }
    
    if(dy > 10 || dy < -10){
      this.swipeLocked = false;
    }
    
    if(this.swipeLocked) {
      this.$sliderContainer.style.transform = 'translateX(' + (f - this.currentPosition)*100 + '%)';
    }
  }

  // окончание анимации, смена слайда при swipe слайдера
  swipeInteraction(e){
    if(this.startXCoord || this.startXCoord === 0){
      let dx = this.unify(e).clientX - this.startXCoord, s = Math.sign(dx), f = +(dx/this.screenWidth).toFixed(2)*4;
      if(s<0 && f<-0.3){
        this.sliderMoveNextEvent();
      } else if (s>0 && f>0.3) {
        this.sliderMovePrevEvent();
      } else if(f>=-0.3 && f<=0.3){
        this.$sliderContainer.style.transform = 'translateX(' + (-this.currentPosition*100) + '%)';
      }
    }
    this.swipeLocked = false;
  }

  // метод, навешивающий методы на события touchstart, touchmove, touchend
  setTouchSwipeHandlers(){
    // this.$sliderElement.addEventListener('mousedown', (e) => (this.lock(e)), false);
    this.$sliderElement.addEventListener('touchstart', (e) => (this.lock(e)), false);
    // this.$sliderElement.addEventListener('mousemove', (e) => (this.dragInteraction(e)), false);
    this.$sliderElement.addEventListener('touchmove', (e) => (this.dragInteraction(e)));
    // this.$sliderElement.addEventListener('mouseup', (e) => (this.swipeInteraction(e)), false);
    this.$sliderElement.addEventListener('touchend', (e) => (this.swipeInteraction(e)), false);
  }

  // метод, создающий слайды на основе числа карточек на один слайд и вставляющий слайды в враппер слайдера
  createSliderItems(numberOfCardToOneItem){
    let cardCount = 0;
    let cardsBuffer = [];
    let itemBuffer;
    for (let indexOfCard = 0; indexOfCard<this.$sliderCards.length; indexOfCard++){
      cardsBuffer.push(this.$sliderCards[indexOfCard]);
      cardCount++;
      if(cardCount === numberOfCardToOneItem){
        itemBuffer = this.wrapCardsToItem(cardsBuffer);
        this.$sliderContainer.appendChild(itemBuffer);
        cardsBuffer = [];
        cardCount = 0;
      }
    } 
    if(cardsBuffer.length!==0){
      itemBuffer = this.wrapCardsToItem(cardsBuffer);
      this.$sliderContainer.appendChild(itemBuffer);
    }
    this.$sliderItems = this.$sliderElement.querySelectorAll('.slider-item');
  }

  // метод помещающий карточки в слайд
  wrapCardsToItem(cards){
    let itemWrapper = document.createElement('div');
    itemWrapper.classList.add('slider-item');
    for (let card of cards){
      itemWrapper.appendChild(card);
    }
    return itemWrapper;
  }

  // метод, заполняющий массив с параметрами слайдов
  fillItemsArray(){
    this.$sliderItems.forEach(
      (item, index) => {
        this.itemsArray.push({
          item: item,
          position: index,
          transform: 0 
        });
        this.resetItemTransformValue(this.itemsArray[index].item);
      }
    );
  }

  // метод сбрасывающий трансформацию враппера
  resetItemTransformValue(item){
    item.style.transform = 'translateX(' + 0 + '%)';
  }

  // метод навешивющий на кнопки переключения слайдов, события
  enableOnClickControlsHandlers(){
    for( let sliderControl of this.$sliderControls){
      if(this.isNextControlButton(sliderControl)){
        sliderControl.addEventListener('click', this.sliderMoveNextEvent);
      } else {
        sliderControl.addEventListener('click', this.sliderMovePrevEvent);
      }
    }
  }

  // проверка, что это кнопа для переключения на следующий слайд
  isNextControlButton( controlButton ){
    return controlButton.classList.contains('slider-control-next');
  }

  // метод, переключающий на следующий слайд
  sliderMoveNextEvent = () => {
    let nextItem, currentIndicator = this.indicatorIndex;
    this.currentPosition++;
    this.setNewMaxItemPosition(this.getMaxItemPosition());
    if(this.needToMoveFirstSlideToEndPosition()){
      nextItem = this.getMinItemIndex();
      this.moveLeftmostOneItemToEnd(this.itemsArray[nextItem]);
    }
    this.transformValue -= this.transformStep;
    this.indicatorIndex++;
    if (this.indicatorIndex > this.indicatorIndexMax){
      this.indicatorIndex = 0;
    }
    this.moveSlideAnimation(currentIndicator);
    this.$indicatorItems[currentIndicator].classList.remove('active');
    this.$indicatorItems[this.indicatorIndex].classList.add('active');
  }

  // метод, для переноса самого первого слайда в конец враппера
  moveLeftmostOneItemToEnd(item){
    item.position = this.maxItemPosition + 1;
    item.transform += this.itemsArray.length * 100;
    item.item.style.transform = 'translateX(' + item.transform + '%)';
  }

  // метод, переключающий на предыдущий слайд
  sliderMovePrevEvent = () => {
    let nextItem, currentIndicator = this.indicatorIndex;
    this.currentPosition--;
    this.setNewMinItemPosition(this.getMinItemPosition());
    if(this.needToMoveLastSlideToStartPosition()){
      nextItem = this.getMaxItemIndex();
      this.moveRightmostOneItemToStart(this.itemsArray[nextItem]);
    }
    this.transformValue += this.transformStep;
    this.indicatorIndex--;
    if (this.indicatorIndex < 0){
      this.indicatorIndex = this.indicatorIndexMax;
    }
    this.moveSlideAnimation();
    this.$indicatorItems[currentIndicator].classList.remove('active');
    this.$indicatorItems[this.indicatorIndex].classList.add('active');
  }

  // метод, для переноса самого последнего слайда в начало враппера
  moveRightmostOneItemToStart(item){
    item.position = this.minItemPosition - 1;
    item.transform -= this.itemsArray.length * 100;
    item.item.style.transform = 'translateX(' + item.transform + '%)';
  }

  // метод, добавляющий индикаторы слайдов
  addIndicators(){
    this.$indicatorsContainer = document.createElement('ol');
    let sliderIndicatorsItemBuffer;
    this.$indicatorsContainer.classList.add('slider-indicators');
    for (let indexOfItem = 0; indexOfItem < this.$sliderItems.length; indexOfItem++){
      sliderIndicatorsItemBuffer = document.createElement('li');
      if(indexOfItem===0){
        sliderIndicatorsItemBuffer.classList.add('active');
      }
      sliderIndicatorsItemBuffer.setAttribute('data-slide-to', indexOfItem);
      this.$indicatorsContainer.appendChild(sliderIndicatorsItemBuffer);
    }
    this.$sliderElement.appendChild(this.$indicatorsContainer);
    this.$indicatorItems = this.$sliderElement.querySelectorAll('.slider-indicators > li');
  }

  // метод для перехода по слайдам с помощью индикаторов
  indicatorMoveTo( indicatorIndex ){
    let indicatorIndexCount = 0;
    while(indicatorIndex !== this.indicatorIndex && indicatorIndexCount <= this.indicatorIndexMax){
      if(indicatorIndex > this.indicatorIndex){
        this.sliderMoveNextEvent();
      } else {
        this.sliderMovePrevEvent();
      }
      indicatorIndexCount++;
    }
  }

  // метод, навешивающий на индикаторы событие onClick
  setUpIndicatorOnClickEventHandlers(){
    for ( let indicatorItem of this.$indicatorItems){
      indicatorItem.addEventListener('click', () => {
        this.indicatorMoveTo(parseInt(indicatorItem.getAttribute('data-slide-to')));
      })
    }
  }

  // проверка, нужно ли переносить самый начальный слайд в конец враппера
  needToMoveFirstSlideToEndPosition(){
    return this.currentPosition > this.maxItemPosition;
  }

  // проверка, нужно ли переносить самый последний слайд в начало враппера
  needToMoveLastSlideToStartPosition(){
    return this.currentPosition < this.minItemPosition;
  }

  // получить индекс самого левого слайда
  getMinItemIndex(){
    let index = 0;
    for(let i = 0; i < this.itemsArray.length; i++){
      if(this.itemsArray[i].position < this.itemsArray[index].position){
        index = i;
      }
    }
    return index;
  }
  
  // получить индекс самого правого слайда
  getMaxItemIndex(){
    let index = 0;
    for(let i = 0; i < this.itemsArray.length; i++){
      if(this.itemsArray[i].position > this.itemsArray[index].position){
        index = i;
      }
    }
    return index;
  }
  
  // получить позиция самого левого слайда
  getMinItemPosition(){
    return this.itemsArray[this.getMinItemIndex()].position;
  }
  
  // получить позиция самого правого слайда
  getMaxItemPosition(){
    return this.itemsArray[this.getMaxItemIndex()].position;
  }

  // задать позицию замого правого слайда
  setNewMaxItemPosition(newMaxItemPosition){
    this.maxItemPosition = newMaxItemPosition;
  }

  // задать позицию замого левого слайда
  setNewMinItemPosition(newMinItemPosition){
    this.minItemPosition = newMinItemPosition;
  }

  // анимация-карусель враппера слайдера
  moveSlideAnimation( ){
    this.$sliderContainer.style.transform = 'translateX(' + this.transformValue + '%)';
  }
}

export default function Slider($sliderElement, numberOfCardTablet, numberOfCardDesktop) {
  return new SliderComponent($sliderElement, numberOfCardTablet, numberOfCardDesktop);
}
