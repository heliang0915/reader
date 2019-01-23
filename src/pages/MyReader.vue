<template>
  <div>
      <reader :source="source" ></reader>
  </div>
</template>
<script>
   import Reader from '@/components/Reader';
   export default {
     data(){
       return {
          source:'',
          title:''
       }
     },
    components:{
      Reader
    },
    mounted(){
      this.getChapterContent();
    },
    methods:{
       //加载章节信息
       getChapterContent(){
         let chapterURL = "https://novel.juhe.im/chapters/http%3A%2F%2Fvip.zhuishushenqi.com%2Fchapter%2F56f8da0a176d03ac1983f6fd%3Fcv%3D15271418534811";
         let _this=this;
         axios.get(chapterURL)
           .then(function (response) {
             let source = response.data.chapter.cpContent;
             let title = response.data.chapter.title;
            _this.source=title+"\r\n"+source;
           }).catch(function (error) {
           console.log(error);
         });
       }
    }
   }
</script>
