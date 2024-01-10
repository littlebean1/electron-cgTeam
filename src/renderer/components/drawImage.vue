<template>
  <div id="draw">
    <section id="content">
      <div id="box">
        <canvas id="can" style="background: transparent"></canvas>
      </div>
    </section>
    <div class="drawTop" ref="drawTop" v-show="role !== 'Student'">
      <div>
        <el-button @click="clearAll()" class="drawTopButton" size="small">清空</el-button>
        <el-button @click="back()" class="drawTopButton" size="small" id="back">撤销</el-button>
        <el-button @click="clearSome2()" class="drawTopButton" size="small">橡皮</el-button>
        <el-button @click="save()" class="drawTopButton" size="small" v-if="isExist">保存</el-button>
        <el-button @click="updateTagging()" class="drawTopButton" size="small" v-if="!isExist">修改</el-button>
        <el-button @click="deleteTagging()" class="drawTopButton" size="small">删除</el-button>
      </div>
      <div class="yanse">
        线条颜色:
        <el-color-picker v-model="strokeStyle" @change="changeStrokeStyle()" size="small"></el-color-picker>
      </div>
      <div>
        <p style="color: #fff;font-size: 14px">画笔/橡皮擦粗细:</p>
        <input type="range" max="20" min="1" @change="changeWidth()" value="5" id="rangeIpt">
        <input type="text" id="rangeValue" value="5">
      </div>
    </div>
  </div>
</template>

<script>
import back from "../assets/logo.png";
import axios from "axios";
// import {mapGetters} from "vuex";

export default {
  name: "drawImage",
  // inject:['reload'],
  data() {
    return {
      role: "Teacher",
      img: back,
      canvas: "",
      box: "",
      ctx: "",
      loading: false,
      fillStyle: "transparent",
      strokeStyle: "#000",
      ellipseR: 0.5,
      cHeight: 0,
      cWidth: 0,

      imgs: [],
      backFlag: false,
      points2: [],
      beginPoint: null,
      points: [],
      isEraser: false,
      isExist: true,
      penIcon: require("../assets/logo.png"),
      eraserIcon: require("../assets/logo.png"),

      x: 0,
      y: 0,
      x1: 0,
      y1: 0,
    };
  },
  mounted() {
    console.log(document.getElementById("content").clientHeight)
    this.cHeight = 800
    this.cWidth = document.getElementById("content").clientWidth

    this.box = document.getElementById('box')
    this.canvas = document.getElementById('can')
    this.ctx = this.canvas.getContext("2d");

    // 撤销按钮的样式状态
    // document.getElementById('back').style.background = '#999'
    document.getElementById('back').disabled = true
    this.changeCanvas(this.fileId);

    this.pen(this.strokeStyle)
  },
  methods: {
    changeStatus() {
      if (this.role === "Teacher") {
        axios.post("/api/cgTask/submitStatus", {
          "remote_task_id": this.reviewId,
          "action": "reject",
          "score": -1,
          "url": this.callbackUrl
        }).then(res => {
          if (res.data.result === 'success')
            this.$message({
              message: '状态修改成功',
              type: 'success'
            });
          else
            this.$message({
              message: '状态修改失败',
              type: 'error'
            });
        }).catch(err => console.log(err.response));
      }
    },
    changeCanvas(fileId) {
      this.getPicture(fileId).then((res1) => {
        let b1 = new Blob([res1.data], {type: 'image/png'});
        let url1 = URL.createObjectURL(b1);
        this.getTagging().then((res2) => {
          let url2 = null;
          // console.log(res2.data.byteLength)
          if (res2.data.byteLength > 1) {
            let b2 = new Blob([res2.data], {type: 'image/png'});
            url2 = URL.createObjectURL(b2);
          }
          this.drawImg(url1, url2)
        }).catch(err2 => console.log(err2));
      }).catch(err1 => console.log(err1));
    },
    drawImg(src1, src2) {
      this.box.style.backgroundImage = "url(" + src1 + ")"
      this.box.style.backgroundRepeat = "no-repeat"
      this.box.style.backgroundPosition = "center center"
      this.box.style.backgroundSize = "auto 100%"

      let image1 = new Image()
      image1.src = src1
      image1.onload = () => {
        let h = image1.height;
        let w = image1.width;
        let dw = this.cWidth / w;
        let dh = this.cHeight / h;
        if (dw > dh) {
          this.canvas.height = this.cHeight
          this.canvas.width = dh * w
          this.canvas.style.width = dh * w + "px";
          this.canvas.style.height = this.cHeight + "px";
        } else {
          this.canvas.height = dw * h
          this.canvas.width = this.cWidth
          this.canvas.style.width = this.cWidth + "px";
          this.canvas.style.height = dw * h + "px";
        }
        if (src2 != null) {
          this.isExist = false
          let image2 = new Image()
          image2.src = src2
          image2.onload = () => {
            this.ctx.drawImage(image2, 0, 0, this.canvas.width, this.canvas.height)
          }
        } else {
          this.isExist = true
          // 先画一个和画布同样大小的矩形，在保存时可有背景颜色
          this.ctx.fillStyle="transparent";
          this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        }
      };
    },
    getPicture(fileId) {
      return new Promise((resolve, reject) => {
        axios.get("http://localhost:3000/api/media/picture/getPicture", {
          params: {
            fileId: "658bf735ccea145e08bdf357",
            type: "png"
          },
          headers: {},
          responseType: 'arraybuffer'
        }).then(res => {
          resolve(res);
        }).catch(err => reject(err));
      })
    },
    getTagging() {
      return new Promise((resolve, reject) => {
        axios.get("http://localhost:3000/api/tagging/getPictureTagging", {
          params: {mediaId: "658bdf2a06b04d7e3442eefc"},
          headers: {},
          responseType: 'arraybuffer'
        }).then(res => {
          resolve(res);
        }).catch(err => reject(err));
      })
    },

    // 画笔动作
    pen(color){
      let that = this
      that.canvas.onmousedown = function (e){
        let x = (e.pageX - that.canvas.offsetLeft) * that.zoom
        let y = (e.pageY - that.canvas.offsetTop) * that.zoom

        that.points2.push({x, y});
        that.beginPoint = {x, y};
        that.backFlag = true
        document.getElementById('back').style.background = '#ccc'

        document.onmousemove = function (e){
          let x = (e.pageX - that.canvas.offsetLeft) * that.zoom
          let y = (e.pageY - that.canvas.offsetTop) * that.zoom

          that.ctx.strokeStyle = color

          // 使用贝塞尔曲线画出圆滑的曲线
          that.points2.push({x,y})
          if (that.points2.length > 3) {
            const lastTwoPoints = that.points2.slice(-2);
            const controlPoint = lastTwoPoints[0];
            const endPoint = {
              x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
              y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
            }
            that.drawLine(that.beginPoint, controlPoint, endPoint);
            that.beginPoint = endPoint;
          }
        }

        // 将每一个画笔动作存入imgs，用于撤销
        let obj = that.ctx.getImageData(0, 0, that.canvas.width, that.canvas.height)
        that.imgs.push(obj)
      }
      document.onmouseup = function () {
        that.ctx.closePath()
        document.onmousemove = null
      }
      document.getElementById('back').disabled = false
    },

    eraser() {
      // document.getElementById("content").style.cursor = "url(" + this.eraserIcon + "), auto"
      let that = this
      that.canvas.onmousedown = function (e){
        let x1 = (e.clientX-that.canvas.offsetLeft) * that.zoom;
        let y1 = (e.clientY-that.canvas.offsetTop) * that.zoom;
        //鼠标第一次点下的时候擦除一个圆形区域，同时记录第一个坐标点
        that.ctx.save()
        that.ctx.beginPath()
        let a = document.getElementById('rangeIpt').value/2
        that.ctx.arc(x1,y1,a,0,2*Math.PI);
        that.ctx.clip()
        that.ctx.clearRect(0,0,that.canvas.width,that.canvas.height);
        that.ctx.restore();

        document.onmousemove = function (e){
          let x2 = (e.clientX-that.canvas.offsetLeft) * that.zoom;
          let y2 = (e.clientY-that.canvas.offsetTop) * that.zoom;
          //获取两个点之间的剪辑区域四个端点
          var asin = a*Math.sin(Math.atan((y2-y1)/(x2-x1)));
          var acos = a*Math.cos(Math.atan((y2-y1)/(x2-x1)))
          var x3 = x1+asin;
          var y3 = y1-acos;
          var x4 = x1-asin;
          var y4 = y1+acos;
          var x5 = x2+asin;
          var y5 = y2-acos;
          var x6 = x2-asin;
          var y6 = y2+acos;
          //保证线条的连贯，所以在矩形一端画圆
          that.ctx.save()
          that.ctx.beginPath()
          that.ctx.arc(x2,y2,a,0,2*Math.PI);
          that.ctx.clip()
          that.ctx.clearRect(0,0,that.canvas.width,that.canvas.height);
          that.ctx.restore();
          //清除矩形剪辑区域里的像素
          that.ctx.save()
          that.ctx.beginPath()
          that.ctx.moveTo(x3,y3);
          that.ctx.lineTo(x5,y5);
          that.ctx.lineTo(x6,y6);
          that.ctx.lineTo(x4,y4);
          that.ctx.clip()
          that.ctx.clearRect(0,0,that.canvas.width,that.canvas.height);
          that.ctx.restore();
          //记录最后坐标
          x1 = x2;
          y1 = y2;
        }
        // 将每一个画笔动作存入imgs，用于撤销
        let obj = that.ctx.getImageData(0, 0, that.canvas.width, that.canvas.height)
        that.imgs.push(obj)
      }
      document.onmouseup = function () {
        that.ctx.closePath()
        document.onmousemove = null
      }
    },
    drawLine(beginPoint, controlPoint, endPoint){
      this.ctx.beginPath();
      this.ctx.moveTo(beginPoint.x, beginPoint.y);
      this.ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
      this.ctx.stroke();
    },
    // 改变画笔/橡皮擦粗细
    changeWidth() {
      this.ctx.lineWidth = document.getElementById('rangeValue').value = document.getElementById('rangeIpt').value
    },
    // 改变画笔颜色
    changeStrokeStyle() {
      // console.log(this.strokeStyle)
      this.pen(this.strokeStyle)
    },
    // 清空画布
    clearAll() {
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
      // 清空画布后重新画一个和画布同样大小的矩形，在保存时可有背景颜色
      this.ctx.fillStyle="transparent";
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      document.getElementById('back').style.background = '#999'
      this.backFlag = false
    },
    // 橡皮擦，将画笔变成白色（背景颜色）
    clearSome() {
      this.pen('#fff')
    },
    clearSome2() {
      console.log("使用橡皮")
      this.isEraser = ! this.isEraser
      // this.pen()
      if (this.isEraser)
        this.eraser()
      else
        this.pen(this.strokeStyle)
    },
    // 撤销按钮，将存入的画笔动作数组删除最后一个，再重新绘制到画布上
    back() {
      if(this.backFlag){
        let img = this.imgs.pop()
        this.ctx.putImageData(img,0,0);
        // 撤销按钮的样式
        if(this.imgs.length > 0){
          document.getElementById('back').style.background = '#181D20'
          this.backFlag = true
        }else{
          document.getElementById('back').style.background = '#999'
          this.backFlag = false
          document.getElementById('back').disabled = true
        }
      }
    },
    // 将画布存储为图片显示在页面
    save() {
      let base64Data = this.canvas.toDataURL("image/png", 1.0)
      let blob = this.dataURItoBlob(base64Data)
      let fd = new FormData()
      fd.append("file", blob)
      fd.append("mediaId", this.mediaId)
      // console.log(fd.get("file"))
      axios.post("/api/tagging/addPictureTagging", fd).then((res) => {
        if (res.data === 1)
          this.$message({
            message: "保存审验成功",
            type: 'success'
          });
        else
          this.$message({
            message: "保存审验失败",
            type: 'error'
          });
      }).catch(err => this.$message({
        message: err,
        type: 'error'
      }));
      if (this.isExist)
        this.isExist = false
      this.changeStatus()
    },
    dataURItoBlob(base64Data) {
      let byteString
      if (base64Data.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(base64Data.split(',')[1])
      else
        byteString = unescape(base64Data.split(',')[1])
      let mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
      let ia = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], {type: mimeString});
    },
    deleteTagging() {
      axios.get("/api/tagging/deletePictureTagging", {
        params: {mediaId: this.mediaId},
      }).then((res) => {
        if (res.data === 1)
          this.$message({
            message: "删除审验成功",
            type: 'success'
          });
        else
          this.$message({
            message: "删除审验失败",
            type: 'error'
          });
      }).catch(err => this.$message({
        message: err,
        type: 'error'
      }));
      this.isExist = true
      this.changeStatus()
    },
    updateTagging() {
      let base64Data = this.canvas.toDataURL("image/png", 1.0)
      let blob = this.dataURItoBlob(base64Data)
      let fd = new FormData()
      fd.append("file", blob)
      fd.append("mediaId", this.mediaId)
      axios.post("/api/tagging/updatePictureTagging", fd).then((res) => {
        if (res.data === 1)
          this.$message({
            message: "修改审验成功",
            type: 'success'
          });
        else
          this.$message({
            message: "修改审验失败",
            type: 'error'
          });
      }).catch(err => this.$message({
        message: err,
        type: 'error'
      }));
      this.changeStatus()
    }
  },
  // computed: {
  //   ...mapGetters([
  //     'mediaId', 'fileId', 'zoom', 'type', 'reviewId', 'role', 'callbackUrl'
  //   ])
  // },
  watch: {
    '$store.state.mediaId': function () {
      this.changeCanvas(this.fileId);
      this.strokeStyle= "#000"
      document.getElementById('rangeValue').value = document.getElementById('rangeIpt').value = 5
    }
  }
};
</script>

<style >
* {
  box-sizing: border-box;
}
#draw {
  height: 100%;
  width: 100%;
  min-width: 420px;
  display: flex;
  flex-direction: column;
  background-color: #191D20;
}

.yanse {
  font-size: small;
  color: #5F6266;
}

#rangeValue{
  width: 60px;
}

#content {
  flex-grow: 1;
  height: 100%;
  width: 100%;
  margin-bottom: 52px;
  padding: 0;
}

#box {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0;
}

.drawTop {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px;
  height: 52px;
  position: absolute;
  bottom: 0;
  color: #7D98A1;
  text-align: center;
}

.drawTopButton {
  background-color: #181D20;
  border: 0;
}

.drawTop > div {
  display: flex;
  align-items: center;
  padding: 5px 5px;
}

div.drawTopController {
  display: none;
}

@media screen and (max-width: 1200px) {
  .drawTop {
    position: absolute;
    background-color: white;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    height: 30px;
    overflow: hidden;
  }

  .drawTopController {
    display: flex !important;
    height: 30px;
    width: 100%;
    justify-content: center;
    align-items: center;
    padding: 0 !important;
  }
}
</style>
