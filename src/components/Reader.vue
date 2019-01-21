<template>
  <div id="container">
    <!--<h3>标题</h3>-->
    <div
         :style="{height:pageHeight+'px',transform:'translateX('+translateX+'px)',transition:'transform '+transformDelay+'s ease-in-out'}"
         id="inner"
         class="inner">
      <p v-for="row in listRows">{{row}}</p>
    </div>
    <!--底部分页-->
    <div class="page">
      <span>{{cur}}</span>
      <span>/</span>
      <span>{{total}}</span>
    </div>
  </div>
</template>
<style>
  * {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  body, div, h3, p {
    margin: 0;
    padding: 0;
  }

  body {
    overflow: hidden;
    background: rgba(234, 199, 141, .8);
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
  }

  #container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    overflow: hidden;
  }

  #inner {
    margin: .2rem 0;
    /*display: flex;*/
    columns: 7.3rem 1;
    column-gap: 0;
    column-break-inside: avoid;
  }

  /*#inner div {*/
  /*flex: 1;*/
  /*padding: 0 .3rem;*/
  /*!* float: left; *!*/
  /*}*/

  p {
    text-align: justify;
    padding: 0 .3rem;
    line-height: .6rem;
    font-size: .34rem;
    margin: 0 auto;
  }

  h3 {
    font-size: .4rem;
    text-align: left;
    position: fixed;
    top: .4rem;
    left: .3rem;
    width: 100%;
    margin-top: .1rem;
  }

  .page {
    position: fixed;
    bottom: .2rem;
    right: .3rem;
    color: #999;
    height: .4rem;
    font-size: .3rem;
  }

  span {
    font-size: .3rem;
    display: block;
    float: left;
  }
</style>
<script>
  import UtilReaderHelper from '@/utils/UtilReaderHelper';

  let helper = null;
  let chapterURL = "https://novel.juhe.im/chapters/http%3A%2F%2Fvip.zhuishushenqi.com%2Fchapter%2F56f8da0a176d03ac1983f6fd%3Fcv%3D15271418534811";
  export default {
    data() {
      return {
        translateX: 0, //位移
        transformDelay: .25,//动画时长
        pageHeight: 0, //容器高度
        cur: 1, //当前页
        total: 1, //总页数
        listRows: [],//产生p标签使用
        curPos: 0,//记录最后一次滑动的位置
        isMoving: false,
        totalX: 0,
        startX: 0,
        startY: 0,
        moveX: 0,
        moveY: 0
      }
    },
    mounted() {
      this.init();
    },
    methods: {
      initReader(source) {
        helper = new UtilReaderHelper(source);
        let totalPage = helper.getTotalPage();
        this.renderRow();
        this.setShowPage(1, totalPage);
        this.addListener();
      },
      //添加监听
      addListener(){
        let _this=this;
        document.addEventListener('touchstart', function (e) {
          e = e.changedTouches[0];
          _this.startX = e.pageX;
          _this.startY = e.pageY;
          _this.isMoving = false;
        }, {passive: false});

        document.addEventListener('touchmove', function (e) {
          e.preventDefault();
          // e.stopPropagation();
          e = e.changedTouches[0];
          _this.moveX = e.pageX;
          _this.moveY = e.pageY;
          _this.isMoving = true;
          if (Math.abs(_this.startY - _this.moveY) < Math.abs(_this.startX - _this.moveX)) {
            _this.updatePosition(_this.startX, _this.moveX);
          }else{
            // alert(1);
            // e.preventDefault();
            // e.stopPropagation();
          }
        }, {passive: false});

        document.addEventListener('touchend', function () {
          _this.isMoving = false;
          if (_this.totalX) {
            _this.revisePosition(_this.totalX);//修正位置
            _this.curPos = _this.totalX;
          }
        }, {passive: false})
      },
      init() {
        let _this = this;
        axios.get(chapterURL)
          .then(function (response) {
            let source = response.data.chapter.cpContent;
            _this.initReader(source);
          }).catch(function (error) {
          console.log(error);
        });
      },
      //渲染一行
      renderRow() {
        this.pageHeight = helper.getPageHeight();
        let ary = helper.formatSource();
        let reg = /\@/g;
        let _this = this;
        ary.forEach(function (p) {
          _this.listRows.push(p.replace(reg, ''));
        })
      },
      //更新位置
      updatePosition(startPos, endPos, target) {
        let diff = startPos - endPos;
        let dir = helper.getDirection(startPos, endPos);
        diff = (dir === "left" ? -1 : -1) * diff;
        let translateX = this.curPos + diff ;
        if(translateX<=0){
          this.setPosition(translateX);
        }
      },
      //修正位置
      revisePosition(translateX) {
        let w = helper.getPageWidth();
        let dir = helper.getDirection(this.startX, this.moveX);
        let curPage = Math.abs(translateX / w);
        if (dir === "right") { //向右移动向上进位   1->2 =2
          translateX = Math.ceil(-curPage) * w;
        } else { //向左移动向下进位   2->1 = 1
          translateX = Math.ceil(curPage) * -w;
        }
        this.setPosition(translateX);
        curPage = Math.abs(translateX / w); //重新计算
        curPage = Math.ceil(curPage) + 1;
        console.log("修正位置:::" + translateX);
        console.log("curPage:::" + curPage);
        this.setShowPage(curPage, helper.getTotalPage());
      },
      //显示分页信息
      setShowPage(curPage, totalPage) {
        this.cur = curPage;
        this.total = totalPage;
      },
      //设置过渡位置
      setPosition(translateX) {
        let max = helper.computeMax();
        // if(this.translateX>0){
        //   return;
        // }
        if (this.translateX > 0) { //判断左边的边界
          translateX = 0;
        } else if (Math.abs(translateX) >= max) { //判断右边的边界
          translateX = -max;
        }
        this.translateX=translateX;
        if (this.isMoving) {
          this.transformDelay = 0;
        } else {
          this.transformDelay = .25;
        }
        this.totalX = this.translateX;
      }
    }
  }
</script>
