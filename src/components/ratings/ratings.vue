<template>
  <div class="ratings" ref="ratings">
    <div classs="scroll">
      <div class="ratings-content">
        <div class="overview">
          <div class="overview-left">
            <h1 class="score">{{seller.score}}</h1>
            <div class="title">综合评分</div>
            <div class="rank">高于周边商家{{seller.rankRate}}</div>
          </div>
          <div class="overview-right">
            <div class="score-wrapper">
              <span class="title">服务态度</span>
              <star :size="36" :score="seller.serviceScore"></star> <!--将尺寸和评分都传入star-->
              <span class="score">{{seller.serviceScore}}</span>
            </div>
            <div class="score-wrapper">
              <span class="title">商品评分</span>
              <star :size="36" :score="seller.foodScore"></star> <!--将尺寸和评分都传入star-->
              <span class="score">{{seller.foodScore}}</span>
            </div>
            <div class="delivery-wrapper">
              <span class="title">送达时间</span>
              <span class="delivery">{{seller.deliveryTime}}分钟</span>
            </div>
          </div>
        </div>
      </div>
      <split></split>
      <ratingselect v-on:content-toggle="contentToggle" v-on:ratingtype-select="ratingTypeSelect" :select-Type="selectType" :only-content="onlyContent" :ratings="ratings"></ratingselect>
      <div class="rating-content">
        <ul>
          <li v-for="(rating, index) in ratings" :key="index" class="rating-item border-1px" v-show="needShow(rating.rateType, rating.text)">
            <div class="avatar">
              <img :src="rating.avatar" width="28" height="28">
            </div>
            <div class="content-wrapper">
              <div class="name">{{rating.username}}</div>
              <div class="star-wrapper">
                <star :size="24" :score="rating.score"></star>
                <span class="time" v-show="rating.deliveryTime">{{rating.deliveryTime}}分钟送达</span>
              </div>
              <div class="text">{{rating.text}}</div>
              <div class="recommend" v-show="rating.recommend">
                <span class="icon-thumb_up" v-show="rating.recommend && rating.recommend.length"></span>
                <span  v-for="(item, idx) in rating.recommend" :key="idx" class="recommend-item">{{item}}</span>
              </div>
              <div class="rate-time">{{rating.rateTime | formatDate}}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import star from '../star/star.vue'
import split from '../split/split.vue'
import BScroll from 'better-scroll' // 实现一个滚动的效果，且没有系统的滚动条
import ratingselect from '../ratingselect/ratingselect.vue'
import {formatDate} from '../../common/js/date'
import data from '../../../data.json'
const ALL = 2
const ERR_OK = 0
export default {
  props: {
    seller: {
      type: Object
    }
  },
  data () {
    return {
      ratings: [],
      selectType: ALL,
      onlyContent: true
    }
  },
  created () {
    this.ratings = data.ratings
    this.selectType = ALL
    this.onlyContent = true // 在这里可以改变被选择的状态
    this.$http.get('/api/ratings').then((response) => {
      response = response.body
      if (response.errno === ERR_OK) {
        this.ratings = response.data
        // better-scroll区滚动部分
        this.$nextTick(() => {
          if (!this.scroll) {
            this.scroll = new BScroll(this.$refs.ratings, { // 访问到dom并传给Betterscroll
              click: true
            })
          } else {
            this.scroll.refresh()
            // 重新计算视口和内容的高度差
          }
        })
      }
    })
  },
  methods: {
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
    star,
    split,
    ratingselect
  }
}
</script>

<style lang="stylus"  rel="stylesheet/stylus">
@import "../../common/stylus/mixin.styl"
  
  .ratings
    position: absolute // 为了固定视口的高度
    top: 174px
    bottom: 0
    left: 0
    width: 100%
    overflow: hidden
    .ratings-content
      .overview
        display: flex
        padding: 18px 0
        .overview-left
          flex: 0 0 137px
          padding: 6px 0
          width: 137px
          border-right: 1px solid rgba(7, 17, 27, .1)
          text-align: center
          @media only screen and (max-width: 320px)
            flex: 0 0 120px
            width: 120px
          .score
            margin-bottom: 6px
            line-height: 28px
            font-size: 24px
            color: rgb(255, 153, 0)
          .title
            margin-bottom: 10px
            line-height: 12px
            font-size: 12px
            color: rgb(7, 17, 27)
          .rank
            line-height: 10px
            font-size: 10px
            color: rgb(147, 153, 159)
        .overview-right
          flex: 1
          padding: 6px 0 6px 24px
          @media only screen and (max-width: 320px)
            padding-left: 6px        
          .score-wrapper
            line-height: 18px
            margin-bottom: 8px
            font-size: 0
            .title
              display: inline-block
              line-height: 18px
              vertical-align: top
              font-size: 12px
              color: rgb(7, 17, 27)
            .star
              display: inline-block
              vertical-align: top
              margin: 0 12px
            .score
              display: inline-block
              line-height: 18px
              vertical-align: top
              font-size: 12px
              color: rgb(255, 153, 0)
          .delivery-wrapper
            font-size: 0
            .title
              line-height: 18px
              font-size: 12px
              color: rgb(7, 17, 27)
            .delivery
              margin-left: 12px
              font-size: 12px
              color: rgb(147, 153, 159)
    .split
      height: 16px
      border-top: 1px solid rgba(7,17,27,0.1)
      border-bottom: 1px solid rgba(7,17,27,0.1)
      background: #f3f5f7
    .ratingselect
      padding: 18px 18px 12px 18px
      border-bottom: 1px solid rgba(7,17,27,.1)
    .rating-content
      padding: 0 18px
      .rating-item
        position: relative
        display: flex
        padding: 18px 0
        border-1px(rgba(7,17,27,.1))
        .avatar
          flex: 0 0 28px
          width: 28px
          margin-right: 12px
          img
            border-radius: 50%
        .content-wrapper
          flex: 1
          .name
            font-size: 10px
            line-height: 12px
            color: rgb(7,17,27)
            margin-bottom: 4px
          .star-wrapper
            font-size: 0
            margin-bottom: 6px
            .star
              display: inline-block
              margin-right: 6px
            .time
              font-size: 10px
              font-weight: 200
              line-height: 12px
              color: rgb(147,153,159)
          .text
            font-size: 12px
            line-height: 18px
            color: rgb(7,17,27)
            margin-bottom: 8px
          .recommend
            font-size: 0
            .icon-thumb_up
              display: inline-block
              font-size: 12px
              color: rgb(0,160,220)
              line-height: 16px
            .recommend-item
              display: inline-block
              padding: 0 6px
              font-size: 9px
              line-height: 16px
              color: rgb(147,153,159)
              border: 1px solid rgba(7,17,27,.1)
              margin: 0 0 4px 8px
          .rate-time
            position: absolute
            right: 18px
            top: 18px
            font-size: 10px
            line-height: 12px
            color: rgb(147,153,159)
   
</style>
