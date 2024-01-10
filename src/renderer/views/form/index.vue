<template>
  <div class="app-container">
    <div style="margin-left:1%; margin-right:1%;">
        <div style="height: 40px;">
            <el-button type="primary" @click="centerDialogVisible = true" style="float: right; margin-right: 170px;">创建项目</el-button>
        </div>
        <el-row>
            <el-col :span="4" v-for="(item) in tabledata" :key="item.classId" :offset="1" style="width: 250px; ">
              <div style="margin-top:30px">
                  <el-card :body-style="{ padding: '0px'}" shadow="hover"> 
                    <!-- <img :src=item.imgSrc class="image"> -->
                    <el-image
                        :src="'data:image/png;base64,'+item.buffer"
                        class="image"
                    />
                    <div>
                      <span>{{item.name}}</span><br>
                      <div class="bottom clearfix">
                          <!-- <time class="time"><strong>创建时间:</strong>{{item.classCreatetime}}</time>-->
                          <el-button type="text" class="button" @click="toSessions(item)">&nbsp;场次&nbsp;</el-button>
                          <el-button type="text" class="button" @click="toAssets(item)">&nbsp;资产&nbsp;</el-button>
                          <el-button type="text" class="button" @click="toShots(item)">&nbsp;镜头&nbsp;</el-button>
                      </div>
                    </div>
                  </el-card>
              </div>
            </el-col>
        </el-row>
    </div>
    <el-dialog
      title="创建项目"
      :visible.sync="centerDialogVisible"
      width="30%"
      center>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="项目介绍" prop="desc">
          <el-input v-model="ruleForm.desc"></el-input>
        </el-form-item>
        <el-form-item label="人员" prop="users">
          <el-select v-model="ruleForm.users" multiple>
            <el-option v-for="item in usersList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图片" prop="file">
          <el-upload
            class="upload-demo"
            ref="upload"
            action="http://localhost:3000/api/media/uploadMedia"
            multiple
            show-file-list
            accept="image/png, image/jpeg, image/gif, video/mp4, video/quicktime"
            :file-list="ruleForm.file"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :on-success="successUp"
            :auto-upload="false">
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
          </el-upload>
        </el-form-item>
      </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitAddProjectForm('ruleForm')">创建</el-button>
          <el-button @click="resetAddProjectForm('ruleForm')">重置</el-button>
        </span>
    </el-dialog>
  </div>  
</template>

<script>
import axios from "axios";
import {mapGetters} from "vuex";
import store from "../../store"
import { fi, th } from "date-fns/locale";
const cst = require("../../../main/config/const");

export default {
  name: "DataCard",
  data() {    
    return {
        flag: true,
        list: {},
        form: {},
				img: '',
        response: '',
        picture:'http://192.168.5.40:8082/image-api/',
        usersList: [],
        centerDialogVisible: false,
        //循环卡片列表的数据源     
        tabledata: [],
        ruleForm: {
          name: '',
          desc: '',
          creatorId: '',
          users: [],
          file: [],
        },
        rules: {
          name: [
            { required: true, message: '请输入项目名称', trigger: 'blur' },
          ],
          desc: [
            { required: true, message: '请填写活动形式', trigger: 'blur' }
          ],
          users: [
            { required: true, message: '请选择项目参与人员', trigger: 'blur' }
          ],
          // file: [
          //   { required: true, message: '请选择上传的文件', trigger: 'change' }
          // ],
        }      
    }
  },
  computed: {
      ...mapGetters([
          'projectName', 'projectId', 'currentUser', 'currentTeam', 'teamProjectsList'
      ])
  },
  mounted() {
      this.getTeams()
      this.getAllUsers().then(data => {
          let tempUsers = []
          data.forEach(item=>{
              let opt = { label: item.name, value: item.name}
              tempUsers.push(opt)
          })
          this.usersList = tempUsers
      })
  },
  methods: {
      getAllUsers() {
          console.log("start getAllUsers")
          return new Promise((resolve, reject) => {
              axios.get(
                  "http://localhost:3000/api/user/getAllUsers", {}
              ).then((res) => {
                  resolve(res.data);
              }).catch(err => reject(err.data));
          })
      },
      submitAddProjectForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$refs.upload.submit();
            this.centerDialogVisible = false
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetAddProjectForm(formName) {
        this.$refs[formName].resetFields();
      },
      toSessions(item) {
        console.log("toSessions item: ", item);
        store.commit("setProjectName", item.name)
        store.commit("setProjectId", item._id)
        this.$router.push({path: '/mySessions/index'});
      },  
      toAssets(item) {
        console.log("toAssets item: ", item);
        store.commit("setProjectName", item.name)
        store.commit("setProjectId", item._id)
        axios.get(
            "http://localhost:3000/api/session/getSessionsByProjectId", {
                params: {projectId: item._id},
            }).then((res) => {
                store.commit("setCurrentSession", res.data.length > 0 ? res.data[0] : null)
        }).catch(err => console.log(err));
        this.$router.push({path: '/myAssets/index'});
      },  
      toShots(item) {
        console.log("toShots item: ", item);
        store.commit("setProjectName", item.name)
        store.commit("setProjectId", item._id)
        axios.get(
            "http://localhost:3000/api/session/getSessionsByProjectId", {
                params: {projectId: item._id},
            }).then((res) => {
                store.commit("setCurrentSession", res.data.length > 0 ? res.data[0] : null)
        }).catch(err => console.log(err));
        this.$router.push({path: '/myShots/index'});
      },  
      handleChange(file, fileList) {
          console.log("handleChange: ", file, fileList[0])
          if (file.size / 1024 / 1024 > 500) {
              this.$baseMessage('文件大小不能大于500M', 'error')
          }
          if (fileList.length > 0) {
              this.form.file = fileList
          }
      },      
      handleRemove(file, fileList) {
          if (fileList.length == 0) {
              this.form.file = []
          }
        console.log('移除文件', file, fileList)
      },
      handlePreview(file) {
          console.log("handlePreview", file);
      },
      successUp(response, file, fileList) {
        if (response != 0) {
            axios.post(
                "http://localhost:3000/api/project/addProject",{
                "name": this.ruleForm.name,
                "userIds": [1,2,3],
                "creatorId": this.currentUser._id,
                "desc": this.ruleForm.desc,
                "teamId": this.currentTeam._id,
                "fileId": response,
            }).then((res) => {
                axios.get(
                    "http://localhost:3000/api/project/getProjectsByTeam", {
                    params: {teamId: this.currentTeam._id},
                }).then((res) => {
                    console.log(res.data)
                    this.tabledata = res.data
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
            this.$message({
              showClose: true,
              message: file.name + "上传成功",
              type: "success"
            })
        } else {
            this.form.file = []
            this.$baseMessage(res.error.message, 'error')
        }
        this.$refs.upload.clearFiles()
      },
      submitUpload() {
        this.$refs.upload.submit();
        if (this.role === 'Student'){
          axios.post(
              "/api/review/getReview", {"reviewId": this.reviewId,},
          ).then((res) => {
            axios.post("/api/cgTask/submitStatus", {
              "remote_task_id": this.reviewId,
              "action": "upload",
              "score": -1,
              "url": res.data.callbackUrl
            })
          }).catch(err => {
            // console.log(err)
            this.$message({
              message: err,
              type: 'error'
            });
          });
        }
      },
      getTeams() {
        axios.get(
              "http://localhost:3000/api/team/getTeams", {
        }).then((res) => {
            store.commit("setTeams", res.data)
            store.commit("setCurrentTeam", res.data[0])
            axios.get(
                "http://localhost:3000/api/project/getProjectsByTeam", {
                    params: {teamId: res.data[0]._id},
                }
            ).then((res) => {
                this.tabledata = res.data
                store.commit("setTeamProjectsList", res.data)
                store.commit("setProjectName", res.data[0].name)
                store.commit("setProjectId", res.data[0]._id)
                axios.get(
                    "http://localhost:3000/api/session/getSessionsByProjectId", {
                        params: {projectId: res.data[0]._id},
                    }).then((res) => {
                      store.commit("setCurrentSession", res.data.length > 0 ? res.data[0] : null)
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
      }
    },
}
</script>
 

<style scoped>
.time {    
font-size: 13px;    
color: #999;  
}    
.bottom {    
margin-top: 13px;    
line-height: 12px;  
}
  .button {   
   margin-left: 3px;
   padding: 0;    
   float: right;  
   border: 1px solid black;
   border-radius: 4px;
   }
  .image {    
  width: 100%;    
  display: block;  
  height: 150px;
  }
  .clearfix:before,  
  .clearfix:after {      
  display: table;     
   content: "";  
   }    
   .clearfix:after {      
   clear: both  }
</style>