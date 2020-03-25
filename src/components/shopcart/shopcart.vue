<template>
  <div>
    <div class="shopcart">
      <div class="content" @click="toggleList"> <!--toggle开关  这个是为了已选商品界面绑定的折叠开关 -->
          <!--左侧自适应，右侧固定宽度-->
          <!--左侧购物车-->
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{'highlight':totalCount>0}">
              <i class="icon-shopping_cart" :class="{'highlight':totalCount>0}"></i>
            </div>
            <div class="num" v-show="totalCount>0">{{totalCount}}</div>
          </div>
          <div class="price" :class="{'highlight':totalPrice>0}">￥{{totalPrice}}</div>
          <div class="desc">另需配送费￥{{deliveryPrice}}</div>
        </div>
        <!--右侧购物车-->
        <div class="content-right" @click.stop.prevent="pay"> <!--.stop   .prevent阻止了点击事件的冒泡和默认事件-->
          <div class="pay" :class="payClass">
            {{payDesc}}
          </div>
        </div>
      </div>
        <!--动画小球-->
      <div class="ball-container">
        <transition-group name="drop" v-on:before-enter="beforeDrop" v-on:enter="dropping" v-on:after-enter="afterDrop">
          <div v-for="(ball, index) in balls" :key="index + 0" v-show="ball.show" class="ball">
            <span class="inner inner-hook"></span>
          </div>
        </transition-group>
      </div>
      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <div class="list-content" ref="listContent"> <!--取它的dom，为了已选区可以加减商品 并且下面引入了betterscroll-->
            <ul>
              <li class="food" v-for="(food,idx) in selectFoods" :key="idx">
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span>￥{{food.price*food.count}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol :food="food"></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div class="list-mask" @click="hideList" v-show="listShow"></div> <!--这里的hideList是让人点击模糊的区域也可以关闭列表-->
      <!--当list显示的时候，这个背景也显示-->
    </transition>
  </div>
</template>

<script text="ecmascript-6">
import BScroll from 'better-scroll'
import { eventBus } from '../../components/event-bus'
import cartcontrol from '../../components/cartcontrol/cartcontrol'
export default {
  props: {
    // 接收父组件的传值
    selectFoods: {
      type: Array,
      default () {
        return [
          {
            price: 20, // 当这里的数据改变的时候就会影响总价格及样式
            count: 2
          }
        ]
      }
    },
    deliveryPrice: {
      type: Number,
      default: 0 // 默认值
    },
    minPrice: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      balls: [
        {show: false},
        {show: false},
        {show: false},
        {show: false},
        {show: false}
      ],
      dropBalls: [], // 观测已经下落的小球
      fold: true // 表示购物车 状态 折叠 fold折叠
    }
  },
  created () {
    // 优化体验，异步监听小球平抛动画
    this.$nextTick(() => {
      eventBus.$on('cart-add', this.drop)
    })
  },
  computed: { // vue的计算属性computed 这里用来计算总价 注意，下面这几个式子必须放到computed下面计算，不然识别不了
    totalPrice () {
      let total = 0
      this.selectFoods.forEach((food) => {
        total += food.price * food.count
      })
      return total
    },
    totalCount () { // 计算商品总和
      let count = 0
      this.selectFoods.forEach((food) => {
        count += food.count
      })
      return count
    },
    payDesc () { // 判断总价是否达到起送价，并计算还差多少，达到了就可以结算，没达到就不可以
      if (this.totalPrice === 0) {
        return `￥${this.minPrice}元起送` // 这里的引号用的是键盘左上角的~键，避免了用加号拼接 但是别的地方还是要用普通的引号，不然不支持
      } else if (this.totalPrice < this.minPrice) {
        let diff = this.minPrice - this.totalPrice
        return `还差￥${diff}元起送` // 这里的引号用的是键盘左上角的~键，避免了用加号拼接 但是别的地方还是要用普通的引号，不然不支持
      } else {
        return '去结算'
      }
    },
    payClass () { // 判断总价是否达到起送价，从而改变它的样式
      if (this.totalPrice < this.minPrice) {
        return 'not-enough'
      } else {
        return 'enough'
      }
    },
    listShow () {
      if (!this.totalCount) { // 总价等于0的情况 即折叠
        this.fold = true
        return false
      }
      let show = !this.fold // 总价大于0 即不折叠
      if (show) {
        this.$nextTick(() => {
          if (!this.scroll) {
            this.scroll = new BScroll(this.$refs.listContent, { // 访问到dom并传给Betterscroll
              click: true
            })
          } else {
            this.scroll.refresh()
          // 重新计算视口和内容的高度差
          }
        })
      }
      return show
    }
  },
  methods: {
    drop (el) {
    // 触发一次事件就会将所有小球进行遍历
      for (let i = 0; i < this.balls.length; i++) {
        let ball = this.balls[i]
        if (!ball.show) { // 将false的小球放到dropBalls
          ball.show = true
          ball.el = el // 设置小球的el属性为一个dom对象
          this.dropBalls.push(ball)
          return
        }
      }
    },
    beforeDrop (el) { // 这个方法的执行是因为这是一个vue的监听事件
      let count = this.balls.length
      while (count--) {
        let ball = this.balls[count]
        if (ball.show) {
          let rect = ball.el.getBoundingClientRect() // 获取小球的相对于视口的位移(小球高度)
          let x = rect.left - 32 // 因为小球落点会和左边距32px
          let y = -(window.innerHeight - rect.top - 22) // 负数,因为是从左上角往下的的方向  总高度-这个元素距离顶部的高度-最终落点距底部的高度=偏移的值
          el.style.display = '' // 清空display
          el.style.webkitTransform = `translate3d(0,${y}px,0)` // 纵向的动画
          el.style.transform = `translate3d(0,${y}px,0)`
          // 处理内层动画
          let inner = el.getElementsByClassName('inner-hook')[0] // 使用inner-hook类来单纯被js操作
          inner.style.webkitTransform = `translate3d(${x}px,0,0)`
          inner.style.transform = `translate3d(${x}px,0,0)`
        }
      }
    },
    dropping (el, done) { // 这个方法的执行是因为这是一个vue的监听事件
      /* eslint-disable no-unused-vars */
      let rf = el.offsetHeight // 触发重绘html
      this.$nextTick(() => { // 让动画效果异步执行,提高性能
        el.style.webkitTransform = 'translate3d(0,0,0)'
        el.style.transform = 'translate3d(0,0,0)' // 纵向的动画
        // 处理内层动画
        let inner = el.getElementsByClassName('inner-hook')[0] // 使用inner-hook类来单纯被js操作
        inner.style.webkitTransform = 'translate3d(0,0,0)'
        inner.style.transform = 'translate3d(0,0,0)' // 横向的动画
        el.addEventListener('transitionend', done) // Vue为了知道过渡的完成，必须设置相应的事件监听器。
      })
    },
    afterDrop (el) { // 这个方法的执行是因为这是一个vue的监听事件
      let ball = this.dropBalls.shift() // 完成一次动画就删除一个dropBalls的小球
      if (ball) {
        ball.show = false // 重复利用小球
        el.style.display = 'none' // 隐藏小球
      }
    },
    toggleList () {
      if (!this.totalCount) { // 这是已选商品的点击事件 当为0时
        return false
      }
      this.fold = !this.fold
    },
    empty () {
      this.selectFoods.forEach((food) => { // 遍历
        food.count = 0 // 清空
      })
    },
    hideList () {
      this.fold = true
    },
    pay () {
      if (this.totalPrice < this.minPrice) {
        return
      }
      window.alert(`需要支付${this.totalPrice}元`) // 去结算界面
    }
  },
  components: {
    cartcontrol
  }
}
</script>

<style  lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/mixin"
  .shopcart
    position: fixed
    left: 0
    bottom: 0
    z-index: 50
    width: 100%
    height: 48px
    .content
      display: flex
      background: #141d27
      font-size: 0 // 因为下方设置了inline-block会有间隙，所以这里将font-size设为0
      .content-left
        flex: 1
        .logo-wrapper
          display: inline-block
          position: relative
          top: -10px
          margin: 0 12px
          padding: 6px
          width: 56px
          height: 56px
          box-sizing: border-box
          vertical-align: top
          border-radius: 50%
          background: #141d27
          .num
            position: absolute
            top: 0
            right: 0
            width: 24px
            height: 16px
            line-height: 16px
            text-align: center
            border-radius: 16px
            font-size: 9px
            font-weight: 700
            color: #fff
            background: rgb(240, 20, 20)
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, .4)
          .logo
            width: 100%
            height: 100%
            border-radius: 50%
            background: #2b343c
            text-align: center
            &.highlight // 高亮
              background: rgb(0, 160, 220)
            .icon-shopping_cart
              line-height: 44px
              font-size: 24px
              color: #80858a
              &.highlight
                color: #fff
        .price
          display: inline-block
          vertical-align: top
          line-height: 24px
          margin-top: 12px
          box-sizing: border-box
          padding-right: 12px
          border-right: 1px solid rgba(255, 255, 255, .1)
          font-size: 16px
          font-weight: 700
          color: rgba(255, 255, 255, .4)
          &.highlight
            color: #fff
        .desc
          display: inline-block
          vertical: top
          line-height: 24px
          margin: 12px 0 0 12px
          color: rgba(255, 255, 255, .4)
          font-size: 10px
      .content-right
        flex: 0 0 105px
        width: 105px
        .pay
          height: 48px
          line-height: 48px
          text-align: center
          font-size: 12px
          color: rgba(255, 255, 255, .4)
          font-weight: 700
          background: #2b333b
          &.not-enough
            background: #2b333b
          &.enough
            background: #00b43c
            color: #fff
    .ball-container // 点击时触发的小球的样式
      .ball
        position: fixed
        left: 32px // 最终的状态
        bottom: 22px
        z-index: 200
        &.drop-enter, &.drop-enter-active
          transition all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41) // 贝塞尔曲线
        .inner
          display: inline-block
          width: 16px
          height: 16px
          border-radius: 50%
          background: rgb(0, 160, 220)
          transition: all .4s linear // x轴线性
    .shopcart-list
      position: absolute
      left: 0
      top: 0
      width: 100%
      z-index: -1
      transform: translate3d(0, -100%, 0)
      &.fold-enter-active, &.fold-leave-active
        transition: all 0.5s
      &.fold-enter, &.fold-leave-to
        transform: translate3d(0, 0, 0)
      .list-header
        height: 40px
        line-height: 40px
        padding: 0 18px
        background: #f3f5f7
        border-bottom: 1px solid rgba(7, 17, 27, .1)
        .title
          font-size: 14px
          float: left
          color: rgb(7, 17, 27)
        .empty
          float: right
          font-size: 12px
          color: rgb(0, 160, 220)
      .list-content
        padding: 0 18px
        max-height: 217px
        overflow: hidden
        background: #fff
        .food
          position: relative
          padding: 12px 0
          box-sizing: border-box
          border-1px(rgba(7, 17,27, .1))
          .name
            line-height: 24px
            font-size: 14px
            color: rgb(7, 17, 27)
          .price
            position: absolute
            right: 90px
            bottom: 12px
            line-height: 24px
            font-size: 14px
            font-weight: 700
            color: rgb(240, 20, 20)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 6px
  .list-mask
    position: fixed
    // max-width: 540px
    top: 0
    left: 0
    right: 0
    margin: 0 auto
    width: 100%
    height: 100%
    background: rgba(7, 17, 27, 0.6)
    // backdrop-filter: blur(10px) 加了后面太不清楚了，就去了
    z-index: 40;
    opacity: 1
    &.mask-fade-enter-active, &.mask-fade-leave-active
      transition: all 0.3s
    &.mask-fade-enter, &.mask-fade-leave-to
      opacity: 0
      background: rgba(7, 17, 27, 0)
</style>
