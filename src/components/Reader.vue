<template>
  <div id="container">
    <!--  平滑-->
    <div :style="{height:pageHeight+'px',transform:'translateX('+translateX+'px)',transition:'transform '+transformDelay+'s ease-out'}" class="inner" v-if="showType=='smooth'">
      <div :class="index==0?'h3':'p'" :style="{fontSize:fontSize+'rem',lineHeight:(lineHeight+fontSize)+'rem'}" v-for="(row, index)  in listRows">
        {{row}}
      </div>
    </div>

    <!-- 仿真-->
    <div class="freader-viewport" v-if="showType=='simulation'">

    		<div class="freader">
	         <div v-for="(row, i)  in listRows"  >
                <p v-for="(p,index) in row" :class="(i==0&&index==0)?'h3':'p'" :style="{fontSize:fontSize+'rem',lineHeight:(lineHeight+fontSize)+'rem'}">
                  {{p}}
                </p>
            </div>
    		</div>



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

  .inner {
    margin: .2rem 0;
    columns: 7.3rem 1;
    column-gap: 0;
    column-break-inside: avoid;
  }
  .p {
    text-align: justify;
    padding: 0 .3rem;
    line-height: .6rem;
    font-size: .34rem;
    margin: 0 auto;
    color: #777;
  }
  .h3 {
    font-size: .4rem !important;
    text-align: left;
    width: 100%;
    font-weight: 800;
    margin:.15rem 0 .3rem .2rem;
    color: #777;
  }
  .page {
    position: absolute;
    bottom: .2rem;
    right: .3rem;
    color: #999;
    height: .4rem;
    font-size: .3rem;
    z-index: 0;
  }

  span {
    font-size: .3rem;
    display: block;
    float: left;
  }
</style>
<style>
/**
* 仿真模式样式
* @type {[type]}
*/
.freader-viewport .page{
width:410px;
height:668px;
background: rgb(234, 199, 141);
background-repeat:no-repeat;
background-size:100% 100%;
}

.freader .page{
-webkit-box-shadow:0 0 20px rgba(0,0,0,0.2);
-moz-box-shadow:0 0 20px rgba(0,0,0,0.2);
-ms-box-shadow:0 0 20px rgba(0,0,0,0.2);
-o-box-shadow:0 0 20px rgba(0,0,0,0.2);
box-shadow:0 0 20px rgba(0,0,0,0.2);
}

.freader-viewport .page img{
-webkit-touch-callout: none;
-webkit-user-select: none;
-khtml-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
margin:0;
}

.freader-viewport .shadow{
-webkit-transition: -webkit-box-shadow 0.5s;
-moz-transition: -moz-box-shadow 0.5s;
-o-transition: -webkit-box-shadow 0.5s;
-ms-transition: -ms-box-shadow 0.5s;

-webkit-box-shadow:0 0 20px #ccc;
-moz-box-shadow:0 0 20px #ccc;
-o-box-shadow:0 0 20px #ccc;
-ms-box-shadow:0 0 20px #ccc;
box-shadow:0 0 20px #ccc;
}

</style>
<script>
  import UtilReaderHelper from '@/utils/UtilReaderHelper';
  let helper = null;
  export default {
    props:['source','title'],
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
        moveY: 0,
        fontSize:.34,
        titleSize:.4,
        lineHeight:.259,
        rowNum:0,
        showType:'simulation',//'simulation'
      }
    },
    watch:{
        source(newVal,oldVal){
            if(newVal!=oldVal){
                  this.init();
                if(this.showType=='smooth'){}else{
                  // alert(1);
                  var _this=this;
                  _this.$nextTick(function(){
                    _this.initSimulation();
                  })
                  // setTimeout(function(){
                  //   _this.initSimulation();
                  // },1000)

                }
            }
        },
        fontSize(newVal,oldVal){
          if(newVal!=oldVal){
            this.resizeReader();
            // if(this.showType=='smooth'){
            //
            // }else{
            //   this.initSimulation();
            // }
            // this.resizeReader();
          }
        }
    },
    methods: {
      initReader() {
        this.resizeReader();
        if(this.showType=='smooth'){
          this.addListener();
        }
      },

      //初始化仿真
      initSimulation(){
        var clientHeight=document.documentElement.clientHeight;
        var clientWidth=document.documentElement.clientWidth;
        var _this=this;
        $('.freader').turn({
            width:clientWidth,
            height:clientHeight,
            elevation: 50,
            acceleration:true,
            display:'single',
            gradients: true,
            autoCenter: true,
            when:{
    　　　　　turned: function(e, page) {
                _this.setShowPage(page,_this.total)
    　　　　　　}
    　　　　}
        });
      },
      //重新计算
      resizeReader(){
        helper = new UtilReaderHelper(this.source,this.fontSize);
        this.rowNum=helper.getRows();
        let totalPage = helper.getTotalPage();
        this.renderRow();
        this.setShowPage(this.cur, totalPage);
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
          e = e.changedTouches[0];
          _this.moveX = e.pageX;
          _this.moveY = e.pageY;
          _this.isMoving = true;
          if (Math.abs(_this.startY - _this.moveY) < Math.abs(_this.startX - _this.moveX)) {
            _this.updatePosition(_this.startX, _this.moveX);
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
        this.initReader();
      },
      //渲染一行
      renderRow() {
        this.pageHeight = helper.getPageHeight();
        let ary = helper.formatSource();
        let reg = /\@/g;
        let _this = this;
        _this.listRows=[];
        let groupNum=0;
        let tmpAry=[];
        ary.forEach(function (p,index) {
            if(_this.showType=="simulation"){ //仿真模式分组
              if(index>0&&index%_this.rowNum==0){
                _this.listRows[groupNum++]=tmpAry;
                tmpAry=[];
              }else{
                  tmpAry.push(p.replace(reg, ''));
              }
            }else{
              _this.listRows.push(p.replace(reg, ''));
            }

        })
        console.log(_this.listRows);
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
      //改变字体
      changeFontSize(fontSize){
          this.fontSize=fontSize;
      },
      changeBig(){
          this.$emit('changeBig');
          this.fontSize=helper.toFixed(this.fontSize+0.01,2);
          this.resizeReader();
      },
      changeSmail(){
         this.$emit('changeSmail');
         this.fontSize=helper.toFixed(this.fontSize-0.01,2); // parseFloat(Math.floor((this.fontSize-0.01)*100)/100);
         this.resizeReader();
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
            if(this.transformDelay==0.25){
              this.transformDelay = 0;
            }
        } else {
          if(this.transformDelay==0){
            this.transformDelay = .25;
          }
        }
        console.log("translateX::::::"+translateX);
        this.totalX = this.translateX;
      }
    }
  }
</script>
