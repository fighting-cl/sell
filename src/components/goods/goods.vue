<template>
  <div class="goods">
    <!--菜单栏-->
    <div class="menu-wrapper" ref="menuWrapper">
      <ul>
        <li v-for="(item,idx3) in goods" :key="idx3" class="menu-item" :class="{'current': currentIndex === idx3}" @click="selectMenu(idx3,$event)">
          <span class="text  border-1px">
            <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
          </span>
        </li>
      </ul>
    </div>
    <!--商品栏-->
    <div class="foods-wrapper" ref="foodsWrapper">
      <ul>
        <li v-for="(item,idx4) in goods" :key="idx4" class="food-List food-list-hook">
          <!--这里的点击事件是为了food组件而设的 ， 这里加一个hook只是表明了他是被js选择了，但没有实质性作用。这里加这个是为了高亮部分获得子元素的dom的高度-->
          <h1 class="title" >{{item.name}}</h1>
          <ul>
            <li v-for="(food,idx4) in item.foods" :key="idx4" class="food-item border-1px">
              <div class="icon"  @click="selectFood(food, $event)" >
                <img width="57" height="57" :src="food.icon">
              </div>
              <div class="content">
                <h2 class="name"  @click="selectFood(food, $event)" >{{food.name}}</h2>
                <p class="desc">{{food.description}}</p>
                <div class="extra">
                  <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                </div>
                <div class="price">
                  <!--span中间会有空隙，将两个span放一起是一种解决方法-->
                  <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.price}}</span>
                </div>
                <!--加减商品-->
                <div class="cartcontrol-wrapper">
                  <cartcontrol :food="food" v-on:cart-add="_drop"></cartcontrol><!--从cartcontrol里接收来的car-add  小球部分 -->
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <shopcart :select-foods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice" ref="shopcart"></shopcart>
    <food :food="selectedFood" ref="food"></food>
    <!--食物详情界面，并且传入了food的信息，并在food组件用props接收-->
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import shopcart from '../shopcart/shopcart.vue'
import cartcontrol from '../cartcontrol/cartcontrol.vue'
import food from '../food/food.vue'
const ERR_OK = 0
export default {
  props: {
    seller: {
      type: Object
    }
  },
  data () {
    return {
      goods: [],
      listHeight: [], // 储存每个区间的高度
      scrollY: 0,
      selectedFood: {} // 储存选中的食物  变量和@click的selectFood不一样，那是function
    }
  },
  computed: {
    currentIndex () {
      for (let i = 0; i < this.listHeight.length; i++) {
        let height1 = this.listHeight[i]
        let height2 = this.listHeight[i + 1]
        if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
          return i
        }
      }
      return 0
    },
    selectFoods () { // 找到所有被选择的foods 让购物车和加减号联动起来
      let foods = []
      this.goods.forEach((good) => {
        good.foods.forEach((food) => {
          if (food.count) {
            foods.push(food)
          }
        })
      })
      return foods
    }
  },
  created () {
    this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']
    this.$http.get('/api/goods').then((response) => {
      response = response.body
      if (response.errno === ERR_OK) {
        this.goods = response.data
        // better-scroll区滚动部分
        this.$nextTick(() => { // 操作dom时要调用这个接口 $nextTick()
          this._initScroll()
          this._calculateHeight()
        // better-scroll区高亮部分
        })
      }
    })
  },
  // mounted () {
  //   setTimeout(() => {
  //     this._initScroll()
  //     this._calculateHeight()
  //   }, 20)
  // },   这样写也行
  methods: { // 这里的methods不是方法是object   better-scroll区滚动部分
    // 点击事件。点击左侧右侧会滚动
    selectMenu (index, event) {
      if (!event._constructed) { // 这样写可以让点击事件多次点击时不多次触发
        return
      }
      let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
      let ref = foodList[index]
      this.foodsScroll.scrollToElement(ref, 300)
    },
    _initScroll () {
      this.menuScroll = new BScroll(this.$refs.menuWrapper, {
        click: true // 点击事件
      }) // 取到这个dom
      this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
        click: true, // 这个click: true是为了了carcontrol里的food.count可以被点击二设置的
        probeType: 3 // 为了高亮能实时检测位置
      })
      // 高亮
      this.foodsScroll.on('scroll', (pos) => {
        this.scrollY = Math.abs(Math.round(pos.y)) // 为了将他转变为一个正整数
      })
    },
    // better-scroll区高亮部分  利用y轴
    _calculateHeight () {
      let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < foodList.length; i++) {
        let item = foodList[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    _drop (target) { // 过程：在cartcontrol里获得了dom,传递给了父组件，父组件再调用了子组件的方法，然后再传递给子组件
      this.$nextTick(() => { // 体验优化，异步执行下落动画
        this.$refs.shopcart.drop(target) // 访问子组件并使用了drop方法且传入了target
      })
    },
    selectFood (food, event) {
      if (!event._constructed) { // 这样写可以让点击事件多次点击时不多次触发
        return
      }
      this.selectedFood = food
      this.$refs.food.show()
    }
  },
  components: {
    shopcart,
    cartcontrol,
    food
  },
  events: {
    'cart-add' (target) { // 在carcontrol里获得了target
      this._drop(target)
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/mixin.styl"
  .goods
    display: flex
    position: absolute
    top: 174px
    bottom: 46px
    width: 100%
    overflow: hidden
     // 菜单栏
    .menu-wrapper
      flex: 0 0 80px // 等分 缩放 占位
      width: 80px // 不写这个宽度在安卓上会出问题
      background: #f3f5f7
      .menu-item
        width: 56px
        height: 54px
        display: table
        font-size: 12px
        line-height: 14px
        padding: 0 12px
        font-weight: 200
        &.current
          position: relative
          z-index: 10
          margin-top: -1px
          background: #fff
          font-weight: 700
          .text
            border-none()

        // 图标
        .icon
          display: inline-block
          width: 16px
          height: 16px
          vertical-align: top
          margin-right: 2px
          background-size: 16px 16px
          background-repeat: no-repeat
          &.decrease
            bg-image('decrease_3')
          &.discount
            bg-image('discount_3')
          &.guarantee
            bg-image('guarantee_3')
          &.invoice
            bg-image('invoice_3')
          &.special
            bg-image('special_3')
        // 文字
        .text
          display: table-cell
          vertical-align: middle
          font-size: 12px
          font-weight: 200
          border-1px(rgba(7, 17, 27, 0.1))
       // 商品栏
    .foods-wrapper
      flex: 1
      .title
        padding-left: 14px
        height: 26px
        line-height: 26px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147, 153, 159)
        background: #f3f5f7
      .food-item
        display: flex
        margin: 18px
        padding-bottom: 18px
        border-1px(rgba(7, 17, 27, 0.1))
        &:last-child
          border-none()
          margin-bottom: 0
        .icon
          flex: 0 0 57px
          margin-right: 10px
        .content
          flex: 1
          .name
            display: inline-block
            margin: 2px 0 8px 0
            height: 14px
            line-height: 14px
            font-size: 14px
            color: rgb(7, 17, 27)
          .desc,.extra
            font-size: 10px
            color: rgb(147, 153, 159)
          .desc // 这里本来是10px，但是因为浏览器不支持12以下,所以将行高改为12px了，如果用rem为单位可以
            line-height: 12px
            margin-bottom: 8px
          .extra
            .count
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
            right: 0
            bottom: 12px
</style>
