

function UtilReaderHelper(source,fontSize) {
    this.source=source;
    this.columnMaxNum=this.getColumns(fontSize);
    this.rows=this.getRows(fontSize);

}
UtilReaderHelper.prop=UtilReaderHelper.prototype;

//执行窗口变换回调
UtilReaderHelper.prop.resizeListener=function(fn) {
  let resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
  let callBack = function () {
    if (fn && typeof fn === "function") {
      fn()
    }
  };
  window.addEventListener(resizeEvt, callBack, false);
};

//将rem转换为px
UtilReaderHelper.prop.rem2px=function(remVal) {
  let clientWidth=this.getPageWidth();
  let pix=100 * (clientWidth / 640);
  return Math.floor(remVal*pix);
};
//获取页面高度
UtilReaderHelper.prop.getPageHeight=function() {
  let clientHeight=document.documentElement.clientHeight;
  clientHeight=clientHeight-this.rem2px(0.4);
  console.log(clientHeight);
  return clientHeight;
};
//获取页面宽度
UtilReaderHelper.prop.getPageWidth=function() {
  let docEl = document.documentElement;
  return  docEl.clientWidth;
};

//处理回车等不足一行的防止直接计算出现误差
//如 一行就一个 句号 但是上这行是被占满的多余的用@符替换所有页面填满时的真实字数
UtilReaderHelper.prop.parseSource2Ary=function(){
  let ary = [];
  let counter = 0;
  let group = 0;
  let str = "";
  let columnMaxNum=this.columnMaxNum;
  let source=this.source;
  while (source) {
    if (counter === columnMaxNum) { //一行完毕
      counter = 0;
      ary[group++] = str;
      str = "";
    } else {
      let c = source.charAt(0);
      counter++;
      if (c == "\n") {
        let s = "";
        if (columnMaxNum - counter + 1 == columnMaxNum) { //这一行是一个回车并且回车占满全行 使用columnMaxNum的值占位
          s = columnMaxNum;
        } else {
          for (let i = 0; i < columnMaxNum - counter + 1; i++) {
            s += '@';
          }
        }
        str += s;
        counter = columnMaxNum;
      } else {
        str += c;
      }
      //每次移动1位置 递归调用直到遍历完毕后整个source信息
      source = source.substring(1);
    }
  }
  return ary;
};
//格式化去掉无用回车符重新格式化源
UtilReaderHelper.prop.formatSource=function() {
  let columnMaxNum=this.columnMaxNum;
  let source=this.source;
  let ary = this.parseSource2Ary(source, columnMaxNum);
  // console.log(ary);
  ary = ary.filter(function (item) {
    return item != columnMaxNum;
  });
  return ary;
};

UtilReaderHelper.prop.getTotalPage=function(){
    let rows=this.rows;
    let total=this.formatSource(this.source,this.columnMaxNum).length;
    let totalPage=Math.ceil( Math.floor((total/rows)*10)/10 ); //截取小数点1位后再向上取整
    return totalPage;
};
//计算列数
UtilReaderHelper.prop. getColumns=function(fontSize){
  fontSize=fontSize==null?0.34:fontSize;
  //页面宽度
  let clientWidth=this.getPageWidth();
  //字体宽度 .34rem 宽度5.8
  let columns=Math.floor(this.rem2px(5.8)/this.rem2px(fontSize));
  return columns;
};
//计算行数
UtilReaderHelper.prop.getRows=function(){
  let fontSize=this.fontSize==null?0.34:this.fontSize;
  let lineHeightRem=fontSize+0.259; //行高 和字体差0.259rem
  //页面高度
  let clientHeight=this.getPageHeight();
  let rows= Math.floor((clientHeight-this.rem2px(0))/ this.rem2px(lineHeightRem));
  return rows;
};

//获取方向
UtilReaderHelper.prop.getDirection=function(startPos, endPos) {
  var diff = startPos - endPos;
  return diff > 0 ? "left" : "right";
};

//计算最大宽度
UtilReaderHelper.prop.computeMax=function() {
  let width = this.getPageWidth();
  let totalPage=this.getTotalPage();
  return width * (totalPage - 1);
};

UtilReaderHelper.prop.toFixed=function(num,w){
  w=w==null?2:w;
  var newNum=num.toString();
  if(newNum.indexOf('.')>-1){
    var startNum=newNum.substr(0,newNum.indexOf('.'));
    var endNum=newNum.substr(newNum.indexOf('.'),w+1);
    newNum=parseFloat(startNum+''+endNum);
  }else{
    newNum=parseFloat(startNum+''+endNum);
  }
  return newNum;
}



export default UtilReaderHelper;
