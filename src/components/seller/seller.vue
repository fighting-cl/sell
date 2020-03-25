<template>
  <div class="seller" ref="seller">
    <div class="seller-content">
      <div class="overview">
        <h1 class="title">{{seller.name}}</h1>
        <div class="desc">
          <star :size="36" :score="seller.score"></star>
            <span class="text">({{seller.ratingCount}})</span>
            <span class="text">月售{{seller.sellCount}}单</span>
        </div>
        <ul class="remark">
          <li class="block">
            <h2>起送价</h2>
            <div class="content">
              <span class="stress">{{seller.minPrice}}元</span>
            </div>
          </li>
          <li class="block">
            <h2>商家配送</h2>
            <div class="content">
              <span class="stress">{{seller.deliveryPrice}}元</span>
            </div>
          </li>
          <li class="block">
            <h2>平均配送时间</h2>
            <div class="content">
              <span class="stress">{{seller.deliveryTime}}分钟</span>
            </div>
          </li>
        </ul>
         <div class="favorite" @click="toggleFavorite">
           <span class="icon-favorite" :class="{'active': favorite}"></span>
           <div class="text">{{favoriteText}}</div>
         </div>
      </div>
      <split></split>
      <div class="bulletin">
        <h1 class="title">公告与活动</h1>
        <div class="content-wrapper border-1px">
          <p class="content">{{seller.bulletin}}</p>
        </div>
        <!--五个优惠-->
         <ul v-if="seller.supports" class="supports">
            <li class="support-item borer-1px" v-for="(item,index) in seller.supports" :key="index">
              <span class="icon" :class="classMap[seller.supports[index].type]"></span>
              <span class="text">{{seller.supports[index].description}}</span>
            </li>
          </ul>
      </div>
      <split></split>
      <div class="pics">
        <h1 class="title">商家实景</h1>
        <div class="pic-wrapper"  ref="picWrapper">
          <ul class="pic-list" ref="pic">
            <li class="pic-item" v-for="(pic,index) in seller.pics" :key="index">
              <img :src="pic" width="120" height="90">
            </li>
          </ul>
        </div>
      </div>
      <split></split>
       <div class="info">
         <h1 class="title border-1px">商家信息</h1>
         <ul class="info-content">
           <li v-for="(info,idx) in seller.infos" :key="idx" class="info-item border-1px">{{info}}</li>
         </ul>
       </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll' // 实现一个滚动的效果，且没有系统的滚动条
import star from '../star/star'
import split from '../split/split'
import data from '../../../data.json'
import {saveToLocal, loadFromLocal} from '../../common/js/store'

const ERR_OK = 0

export default {
  props: {
    seller: {
      type: Object
    }
  },
  data () {
    return {
      favorite: (() => {
        // 读取favorate数据
        return loadFromLocal(this.seller.id, 'favorite', false)
      })()
    }
  },
  computed: {
    favoriteText () {
      return this.favorite ? '已收藏' : '收藏'
    }
  },
  created () {
    this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']

    this.$http.get('/api/seller').then((response) => {
      this._initPics()
      response = response.body
      if (response.errno === ERR_OK) {
        this.ratings = response.data
        // better-scroll区滚动部分
        this.$nextTick(() => {
          if (!this.scroll) {
            this.scroll = new BScroll(this.$refs.seller, { // 访问到dom并传给Betterscroll
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
     _initPics () {
      if (this.seller.pics) {
        let picWidth = 120
        let margin = 6
        this.$refs.pic.style.width = (picWidth + margin) * this.seller.pics.length - margin + 'px'
        this.$nextTick(() => {
          if (!this.picWrapperScroll) {            
            this.picWrapperScroll = new BScroll(this.$refs.picWrapper, {           
              scrollX: true,
              eventPassthrough: 'vertical'
            })
          } else {
            this.picWrapperScroll.refresh()
          }
        })
      }
    },
     toggleFavorite () {
      this.favorite = !this.favorite
      console.log(this.favorite)
      // 存储favorate数据
      saveToLocal(this.seller.id, 'favorite', this.favorite)
    }
  },
  components: {
    star,
    split
  }
}
</script>

<style  lang="stylus" rel="stylesheet/sylus">
@import "../../common/stylus/mixin.styl"
  .seller
    position: absolute
    top: 174px
    bottom: 0
    left: 0
    width: 100%
    overflow: hidden
    .overview
      padding: 18px
      .title
        margin-bottom: 8px
        line-height: 14px
        color: rgb(7, 17, 27)
        font-size: 14px
      .desc
        padding-bottom: 18px
        border-1px(rgba(7, 17, 27, .1))
        font-size: 0
        .star
          display: inline-block
          margin-right: 8px
          vertical-align: top
        .text
          display: inline-block
          line-height: 18px
          vertical-align: top
          display: inline-block
          font-size: 10px
          color: rgb(77, 85, 93)
          margin-right: 12px
      .remark
        display: flex
        padding-top: 18px
        .block
          flex: 1
          text-align: center
          border-right: 1px solid rgba(7, 17, 27, .1)
          &.last-child
            border: none
          h2
            margin-bottom: 4px
            line-height: 10px
            font-size: 10px
            color: rgb(147, 153, 159)
          .content
            line-height: 24px
            font-size: 10px
            color: rgb(7, 17, 27)
            .stress
              font-size: 24px
              font-weight: 200
      .favorite
        position: absolute
        width: 50px
        right: 12px
        top: 18px
        text-align: center
        font-size: 0
        .icon-favorite
          display: inline-block
          color: #d4d6d9
          font-size: 24px
          line-height: 24px
          margin-bottom: 4px
          &.active
            color: rgb(240,20,20)
        .text
          font-size: 10px
          line-height: 10px
          color: rgb(77,85,93)
    .bulletin
      padding: 18px 18px 0 18px
      .title
        margin-bottom: 8px
        line-height: 14px
        color: rgb(7, 17, 27)
        font-size: 14px
      .content-wrapper
        padding: 0 12px 16px 12px
        border-1px(rgba(7, 17, 27, .1))
        .content
          line-height: 24px
          font-size: 12px
          font-weight:200
          color: rgb(240, 20, 20)
      .supports
        padding: 0 12px 0
        font-size: 0
        .support-item
          padding: 16px 0
          border-1px(rgba(7, 17, 27, .1))
          &:last-child:after
            border-top: none
          .icon
            vertical-align: top
            display: inline-block
            width: 16px
            height: 16px
            margin-right: 6px
            background-size: 16px 16px
            background-repeat: no-repeat
            &.decrease
              bg-image('decrease_4')
            &.discount
              bg-image('discount_4')
            &.guarantee
              bg-image('guarantee_4')
            &.invoice
              bg-image('invoice_4')
            &.special
              bg-image('special_4')
          .text
            font-size: 12px
            line-height: 16px
            color: rgb(7,17,27)
            font-weight: 200
    .pics
      padding: 18px
      .title
        margin-bottom: 12px
        line-height: 14px
        color: rgb(7, 17, 27)
        font-size: 14px
      .pic-wrapper
        width:100%
        overflow: hidden
        white-space: nowrap // 不折行
        .pic-list
          font-size: 0
          .pic-item
            display: inline-block
            margin-right: 6px
            width: 120px
            height: 90px
            &:last-child
              margin-right: 0
    .info
      padding: 18px 18px 0 18px
      .title
        font-size: 14px
        line-height: 14px
        color: rgb(7,17,27)
        padding-bottom: 12px
        border-1px(rgba(7,17,27,.1))
      .info-content
        .info-item
          padding: 16px 12px
          font-size: 12px
          line-height: 16px
          color: rgb(7,17,27)
          font-weight: 200
          border-1px(rgba(7,17,27,.1))
          &:last-child:after
            border-top: none
</style> 