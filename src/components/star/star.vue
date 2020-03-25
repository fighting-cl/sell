<template>
    <div class="star" :class="starType">
        <!--starType和itemClass记录的是它的尺寸（因为每颗星星的尺寸都是不一样的）和 得分（因为是要给每个span都创立一个自己的class,所以这里是class数组）-->
        <!--<span v-for="itemClass in itemClasses" :class="start-item" track-by="$index"></span>   这种写法在vue2.x版本是不行的-->
        <!-- 2.2.0+ 的版本里，当在组件中使用 v-for 遍历对象时，key 现在是必须的 -->
        <span v-for="(itemClass,idx) in itemClasses" :class="itemClass" class="star-item" :key="idx"></span>
    </div>
</template>

<script type="text/ecmascript-6">
// 设置常量
const LENGTH = 5
const CLS_ON = 'on'
const CLS_HALF = 'half'
const CLS_OFF = 'off'

export default{
  props: {
    size: { // 传入的size变量
      type: Number // 设置变量类型
    },
    score: { // 传入的score变量
      type: Number
    }
  },
  computed: {
    starType () { // 通过计算属性,返回组装过的类型,用来对应class类型
      return 'star-' + this.size
    },
    itemClasses () {
      let result = []// 返回的是一个数组,用来遍历输出星星
      let score = Math.floor(this.score * 2) / 2// 计算所有星星的数量
      let hasDecimal = score % 1 !== 0// 非整数星星判断
      let integer = Math.floor(score)// 整数星星判断
      for (let i = 0; i < integer; i++) { // 整数星星使用on
        result.push(CLS_ON)// 一个整数星星就push一个CLS_ON到数组
      }
      if (hasDecimal) { // 非整数星星使用half
        result.push(CLS_HALF)// 类似
      }
      while (result.length < LENGTH) { // 余下的用无星星补全,使用off
        result.push(CLS_OFF)// 类似
      }
      return result
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin.styl"
  .star
    .star-item
      display: inline-block
      background-repeat: no-repeat
    &.star-24 // 48尺寸的星星
      .star-item // 每一个星星的基本css信息
        width: 10px
        height: 10px
        margin-right: 3px // 每一个星星dom都有外边距
        background-size: 10px 10px
        &:last-child // 最后一个的外边距就是0
          margin-right: 0
        &.on // 全星状态的class
          bg-image('star24_on')
        &.half // 半星状态的class
          bg-image('star24_half')
        &.off // 无星状态的class
          bg-image('star24_off')
    &.star-36 // 48尺寸的星星
      .star-item // 每一个星星的基本css信息
        width: 15px
        height: 15px
        margin-right: 6px // 每一个星星dom都有外边距
        background-size: 15px 15px
        &:last-child // 最后一个的外边距就是0
          margin-right: 0
        &.on // 全星状态的class
          bg-image('star48_on')
        &.half // 半星状态的class
          bg-image('star48_half')
        &.off // 无星状态的class
          bg-image('star48_off')
    &.star-48 // 48尺寸的星星
      .star-item // 每一个星星的基本css信息
        width: 20px
        height: 20px
        margin-right: 22px // 每一个星星dom都有外边距
        background-size: 20px 20px
        &:last-child // 最后一个的外边距就是0
          margin-right: 0
        &.on // 全星状态的class
          bg-image('star48_on')
        &.half // 半星状态的class
          bg-image('star48_half')
        &.off // 无星状态的class
          bg-image('star48_off')
</style>
