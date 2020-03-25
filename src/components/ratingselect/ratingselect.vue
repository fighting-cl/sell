<template>
  <div class="ratingselect" v-if="ratings">
    <!--评价类型区-->
    <div class="rating-type border-1px">
      <span @click="select(2,$event)" class="block positive" :class="{'active':typeSelect===2}">{{desc.all}} <!--当selectyupe为2时，active就会生效，下面写了active的样式-->
        <span class="count">{{ratings.length}}</span>
      </span>
      <span @click="select(0,$event)" class="block positive" :class="{'active':typeSelect===0}">{{desc.positive}}
        <span class="count">{{positives.length}}</span>
      </span>
      <span @click="select(1,$event)" class="block negative" :class="{'active':typeSelect===1}">{{desc.negative}}
        <span class="count">{{negatives.length}}</span>
      </span>
    </div>
    <!--评价选择区-->
    <div @click="toggleContent()" class="switch" :class="{'on':this.contentOnly}"> <!--当为onlyContent为true时 （在food.vue的show 里设置 ）on样式生效-->
      <span class="icon-check_circle"></span>
      <span class="text">只看有内容的评价</span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
const POSITIVE = 0 // 正向评价
const NEGATIVE = 1 // 负面评价
const ALL = 2 // 所有评价
export default {
  props: {
    ratings: {
      type: Array,
      defaule () {
        return []
      }
    },
    selectType: {
      type: Number,
      default: ALL // 可以在这里改变而改变选中的是哪个
    },
    onlyContent: {
      type: Boolean,
      default: false
    },
    desc: {
      type: Object,
      default () {
        return {
          all: '全部',
          positive: '满意',
          negative: '不满意'
        }
      }
    }
  },
  data () {
    return {
      typeSelect: this.selectType,
      contentOnly: this.onlyContent
    }
  },
  methods: {
    select (type, event) {
      if (!event._constructed) {
        return
      }
      this.typeSelect = type
      this.$emit('ratingtype-select', type)
    },
    toggleContent () {
      if (!event._constructed) {
        return
      }
      this.contentOnly = !this.contentOnly
      this.$emit('content-toggle', this.contentOnly)
    }
  },
  computed: {
    positives () {
      return this.ratings.filter((rating) => { // 用filter方法过滤 让data.json里值等于POSITIVE的rateType被选出来
        return rating.rateType === POSITIVE // rateType是在data.json里定义了的
      })
    },
    negatives () {
      return this.ratings.filter((rating) => { // 用filter方法过滤 让data.json里值等于POSITIVE的rateType被选出来
        return rating.rateType === NEGATIVE // rateType是在data.json里定义了的
      })
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/mixin.styl"
  .ratingselect
    font-size: 0px
    .rating-type
      padding: 18px 0
      margin: 0 18px
      border-1px(rgba(7, 17, 27, .1))
      .block
        display: inline
        padding: 8px 12px
        margin-right: 8px
        line-height: 16px
        porder-radius: 1px
        font-size: 12px
        color: rgb(77, 85, 93)
        &.active
          color: #fff
        .count
          margin-left: 2px
          font-size: 8px
        &.positive
          background: rgba(0,160, 220, .2)
          &.active
            background: rgb(0,160, 220)
        &.negative
          background: rgba(77, 85, 93, .2)
          &.active
            background: rgb(77, 85, 93)
    .switch
      padding: 12px
      line-height: 24px
      border-bottom: 1px solid rgba(7, 17, 27, .1)
      color: rgb(147, 153, 159)
      font-size: 0
      &.on
        .icon-check_circle
          color: #00c850
      .icon-check_circle
        vertical-align: top
        display: inline-block
        margin-right: 4px
        font-size: 24px
      .text
        vertical-align: top
        display: inline-block
        font-size: 12px
</style>
