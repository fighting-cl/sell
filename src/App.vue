<template>
  <div id="app">
    <v-header :seller="seller"></v-header>
    <div class="tab" border-1px>
      <div class="tab-item">
        <router-link to="/goods">
          <a>商品</a>
        </router-link>
      </div>
      <div class="tab-item">
        <router-link to="/ratings">
          <a>评论</a>
        </router-link>
      </div>
      <div class="tab-item">
        <router-link to="/seller">
          <a>商户</a>
        </router-link>
      </div>
    </div>
    <router-view :seller="seller"></router-view>
  </div>
</template>

<script type="text/ecamascript-6">
import header from './components/header/header.vue'
const ERR_OK = 0
export default {
  data () {
    return {
      seller: {}
    }
  },
  created () {
    this.$http.get('/api/seller').then((response) => {
      response = response.body
      if (response.errno === ERR_OK) {
        this.seller = response.data
      }
    })
  },
  components: {
    'v-header': header
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "./common/stylus/mixin.styl"
    .tab{
      height: 40px;
      width: 100%;
      display: flex;
      line-height: 40px
      }
    .tab-item{
          flex: 1;
          text-align: center;
          border-1px(rgba(7,17,27,0.1))
    }
    .tab-item a{
      display: block;
      font-size: 14px;
      color:rgb(77,85,93);
    }
   .router-link-active a{
     color:rgb(240,20,20)
   }
</style>
