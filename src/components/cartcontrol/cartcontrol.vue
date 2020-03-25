<template>
  <div class="cartcontrol">
    <transition name="slide-fade">
      <!--这里的transition是2.0的写法-->
      <div class="cart-decrease cart-decrease icon-remove_circle_outline" v-show="food.count>0" @click="decreaseCart">
      </div>
    </transition>
    <div class="cart-count" v-show="food.count>0">{{food.count}}</div>
    <div class="cart-add icon-x_add_circle" @click="addCart"></div>
  </div>
</template>

<script type="text/ecmascript-6">
import Vue from 'vue'
import { eventBus } from '../../components/event-bus'
export default {
  props: {
    food: {
      type: Object
    }
  },
  // methods: {
  //   addCart (event) {
  //     if (!event._constructed) { // 这里和goods.vue里防止触发多次点击时一个方法
  //       return
  //     }
  //     // console.log('click') 大概意思就是本来点击多次只触发一个click点击次数也在那一个click里
  //     // 但是如果触发多次就会这一个click里面显示点了几次，那一个click里面显示点击了几次，就没法统计了
  //     if (!this.food.count) { // 判断food.count存不存在，不存在就设置它的值为1
  //       Vue.set(this.food, 'count', 1) // 通过vue.set来 添加一个属性的时候，变化就会被观测到，就会通知到dom他发生了变化 给对象添加他不存在的属性用Vue.set()
  //     } else {
  //       this.food.count++
  //       console.log(count)
  //     }
  //     // 传入dom对象，用来计算小球的出发点 优化体验，异步传递当前点击文档节点
  //     this.$nextTick(() => {
  //       eventChange.$emit('cart-add', event.target)
  //       console.log(this.event.target)
  //     })
  //   },
  //   decreaseCart (event) {
  //     if (!event._constructed) {
  //       return
  //     }
  //     if (this.food.count) {
  //       this.food.count--
  //     }
  //   }
  // },
  methods: {
    addCart (event) {
      if (!event._constructed) {
        return
      }
      if (!this.food.count) {
        Vue.set(this.food, 'count', 1)
      } else {
        this.food.count += 1
      }
      // 优化体验，异步传递当前点击文档节点
      this.$nextTick(() => {
        eventBus.$emit('cart-add', event.target)
      })
    },
    decreaseCart () {
      if (this.food.count) {
        this.food.count--
      }
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .cartcontrol
    font-size: 0
    .cart-decrease, .cart-add
      display: inline-block
      padding: 6px // 加这个padding的原因是想点击区域变得大一些
      line-height: 24px
      font-size: 24px
      color: rgb(0, 160, 220)
    .cart-count
      display: inline-block
      vertical-align: top
      width: 12px
      padding-top: 6px
      line-height: 24px
      text-align: center
      font-size: 10px
      color: rgb(147, 153, 159)
  .cartcontrol
  &.slide-fade-enter-active
    transition: all .3s ease
  &.slide-fade-leave-active
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0)
  &.slide-fade-enter, &.slide-fade-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */
    transform: translateX(24px) rotate(360deg)
    opacity: 0
</style>
