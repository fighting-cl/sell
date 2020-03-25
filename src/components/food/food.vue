<template>
  <div>
    <transition name="move"> <!--让他可以被访问到而实现betterscroll-->
      <div v-show="showFlag" class="food"  ref="food">
        <div class="food-content">
          <!--图片-->
          <div class="image-header">
            <img :src="food.image">
            <div class="back" @click="hide"> <!--返回按钮-->
              <i class="icon-arrow_lift"></i>
            </div>
          </div>
          <!--内容区-->        
          <div class="content">
            <h1 class="title">{{food.name}}</h1>
            <div class="detail">
              <span class="sell-count">月售{{food.sellCount}}份</span>
              <span class="ratings">好评率{{food.rating}}%</span>
            </div>
            <div class="price">
              <span class="now">￥{{food.price}}</span>
              <span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
            </div>
            <div class="cartcontrol-wrapper">
              <cartcontrol :food="food"></cartcontrol> <!--将food组件的food传给cartcontrol-->
            </div>
            <transition name="fade"> <!--将购物车消失做成一个动画-->
              <div @click.stop.prevent="addFirst" class="buy" v-show="!food.count || food.count===0">加入购物车</div> <!--当点击buy时，buy消失，cartcontrol出现 该商品购买数量为0的时候会显示buy-->
            </transition>
          </div>
          <split v-show="food.info"></split>
          <div class="info" v-show="food.info"> <!--因为并不是每一个商品都有info所以当有的时候才会显示-->
            <h1 class="title">商品信息</h1>
            <p class="text">{{food.info}}</p>
          </div>
          <split></split>
          <!--商品评价区-->
          <div class="rating">
            <h1 class="title">商品评价</h1>
            <ratingselect v-on:content-toggle="contentToggle" v-on:ratingtype-select="ratingTypeSelect" :select-Type="selectType" :only-content="onlyContent" :desc="desc" :ratings="food.ratings"></ratingselect>
            <div class="rating-wrapper">
              <ul v-show="food.ratings && food.ratings.length">
                <li v-show="needShow(rating.rateType,rating.text)" v-for="(rating, index) in food.ratings" :key="index" class="rating-item border-1px">
                  <!--这里的v-show绑定了一个函数的返回值-->
                  <div class="user">
                    <div class="name">{{rating.username}}</div>
                    <img class="avatar" width="12px" height="12px" :src="rating.avatar">
                  </div>
                  <div class="time">{{rating.rateTime | formatDate}}</div> <!--时间格式-->
                  <span class="text">
                    <i class="icon" :class="{'icon-thumb_up':rating.rateType===0, 'icon-thumb_down':rating.rateType===1}"></i>
                    <p>{{rating.text}}</p>
                  </span>
                </li>
              </ul>
              <div class="no-rating" v-show="!food.ratings || !food.ratings.length">暂无评价</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll' // 实现一个滚动的效果，且没有系统的滚动条
import cartcontrol from '../cartcontrol/cartcontrol.vue'
import Vue from 'vue'
import { eventBus } from '../event-bus'
import split from '../split/split.vue'
import ratingselect from '../ratingselect/ratingselect.vue'
import {formatDate} from '../../common/js/date'
// const POSITIVE = 0 // 正向评价
const NEGATIVE = 1 // 负面评价
const ALL = 2 // 所有评价

export default {
  props: { // 从父组件接收food （goods组件）
    food: {
      type: Object
    }
  },
  data () {
    return {
      showFlag: false,
      selectType: ALL,
      onlyContent: true,
      desc: {
        all: '全部',
        positive: '推荐',
        negative: '吐槽'
      }
    }
  },
  methods: {
    show () {
      this.showFlag = true
      this.selectType = ALL
      this.onlyContent = true // 在这里可以改变被选择的状态
      this.$nextTick(() => {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.food, { // 访问到dom并传给Betterscroll
            click: true
          })
        } else {
          this.scroll.refresh()
          // 重新计算视口和内容的高度差
        }
      })
    },
    hide () {
      this.showFlag = false
    },
    addFirst (event) { // 默认参数event
      if (!event._constructed) { // 这个及下面的在cartontrol也用到了
        return
      }
      // 优化体验，异步传递当前点击文档
      this.$nextTick(() => {
        eventBus.$emit('cart-add', event.target)
      })
      Vue.set(this.food, 'count', 1)
    },
    needShow (type, text) {
      if (this.onlyContent && !text) {
        return false
      }
      if (this.selectType === ALL) {
        return true
      } else {
        return type === this.selectType
      }
    },
    ratingTypeSelect (type) {
      this.selectType = type
      this.$nextTick(() => {
        this.scroll.refresh()
      })
    },
    contentToggle (contentOnly) {
      this.onlyContent = contentOnly
      this.$nextTick(() => {
        this.scroll.refresh()
      })
    }
  },
  filters: { // 将时间戳转化为字符串 4步
    formatDate(time) {
      time = time * 1000
      let date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  },
  components: {
    cartcontrol,
    split,
    ratingselect
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/mixin.styl"
    .food
      position: fixed
      left: 0
      top: 0
      bottom: 48px
      padding-bottom: 48px
      z-index: 30
      width: 100%
      background: #fff
      &.move-enter-active, &.move-leave-active
        transition: all 0.2s linear
      &.move-enter, &.move-leave-to
        transform: translate3d(-100%, 0, 0)
      &.move-enter-to, &.move-leave
        transform: translate3d(0, 0, 0)
      .image-header
        position: relative
        width: 100%
        height: 0
        padding-top: 100% // padding-bottom也可 这样设这个值和宽度是一样的 就能保正不同分辨率情况下，图片都是正方形的
        img
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 100%
        .back
          position: absolute
          top: 10px
          left: 0
          .icon-arrow_lift
            display: block
            padding: 10px //为了点击区域变大
            font-size: 20px
            color: #fff
      .content
        position: relative
        padding: 18px
        .title
          line-height: 14px
          margin-bottom: 8px
          font-size: 14px
          font-weight: 700
          color: rgb(7, 17, 27)
        .detail
          margin-bottom: 18px
          line-height: 10px
          font-size: 0
          height: 10px
          .sell-count, .ratings
            font-size: 10px
            color: rgb(147, 153, 159)
          .sell-count
            margin-right: 12px
        .price
          font-weight: 700
          line-height: 24px
          .now
            margin-right: 8px
            font-size: 14px
            color: rgb(240, 20, 20)
          .old
            font-size: 10px
            text-decoration: line-through
            color: rgb(147,153,159)
        .cartcontrol-wrapper
          position: absolute
          right: 12px
          bottom: 12px
        .buy
          position: absolute
          right: 18px
          bottom: 18px
          z-index: 10
          height: 24px
          line-height: 24px
          padding: 0 12px
          box-sizing: border-box
          font-size: 10px
          border-radius: 12px
          color: #fff
          background: rgb(0, 160, 220)
          &.fade-enter-active, &.fade-leave-active
            transition: all 0.2s
          &.fade-enter-to, &.fade-leave
            opacity: 1
          &.fade-enter, &.fade-leave-to
            opacity: 0
      .info
        padding: 18px
        .title
          line-height: 14px
          margin-bottom: 6px
          font-size: 14px
          color: rgb(7, 17, 27)
        .text
          line-height: 24px
          padding: 0 8px
          font-size: 12px
          color: rgb(77, 85, 93)
      .rating
        padding-top: 18px
        .title
          line-height: 14px
          margin-left: 18px
          font-size: 14px
          color: rgb(7, 17, 27)
      .rating-wrapper
        padding: 0 18px
        .rating-item
          position: relative
          padding: 16px 0
          border-1px: (rgba(7, 17, 27, .1))
          .user
            position: absolute
            right: 0
            top: 16px
            line-height: 12px
            font-size: 0
            .name
              display: inline-block
              vertical-align: top
              margin-right: 6px
              font-size: 10px
              color: rgb(147, 153, 159)
            .avatar
              border-radius: 50%
          .time
            margin-bottom: 6px
            line-height: 12px
            font-size: 10px
            color: rgb(147, 153, 159)
          .text
            line-height: 16px
            font-size: 0px
            .icon
              display: inline-block
              margin-right: 4px
              font-size: 12px
              &.icon-thumb_up
                color: rgb(0, 160, 220)
              &.icon-thumb_down
                color: rgb(147, 153, 159)
            p
              display: inline-block
              font-size: 12px
              color: rgb(7, 17, 27)
        .no-rating
          padding: 16px 0
          font-size: 12px
          color: rgb(147, 153, 159)
</style>
