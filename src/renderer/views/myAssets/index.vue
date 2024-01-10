<template>
    <div>
        <div style="height: 40px;">
            <div style="float: left; margin: 30px 0 0 0; font-size:26px">我的资产({{ this.projectName }}: {{ assetNum }})</div>
            <el-dropdown>
                <el-button type="primary"  style="float: left; margin: 30px 0 0 80px; border-radius: 50px">
                    {{ this.projectName }}
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item, index) in this.teamProjectsList" :key="index" @click.native="handleSelect(item)">
                        {{ item.name }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-button type="primary" @click="addAssetDialogVisible = true" style="float: right; margin: 30px 100px 30px 0;">创建资产</el-button>
        </div>
        <el-table :data="tableData" border tooltip-effect="dark" style="width: 100%;">
            <el-table-column prop="id" label="序号" width="50"/>
            <el-table-column prop="image" width="70">
                <template slot-scope="scope">
                    <el-image :src="'data:image/png;base64,'+scope.row.buffer" class="image" />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" width="150"/>
            <el-table-column prop="type" label="类别" width="50"/>
            <el-table-column type="expand">
                <template slot-scope="props">
                    <el-table :data="props.row.gridData" style="width: 100%" row-key="guid">
                        <!-- <el-table-column :column-key="guid" fixed align="center"/> -->
                        <el-table-column width="330" />
                        <el-table-column prop="stage" label="阶段" min-width="10%"/>
                        <el-table-column prop="state" label="状态"  min-width="10%"/>
                        <el-table-column prop="designerName" label="设计师"  min-width="15%"/>
                        <el-table-column prop="reviewerName" label="审验人"  min-width="15%"/>
                        <el-table-column prop="degree" label="难度"  min-width="10%"/>
                        <el-table-column prop="dataSize" label="数据量"  min-width="10%"/>
                        <el-table-column label="操作"  min-width="10%">
                            <template slot-scope="scope">
                                <el-button type="text" @click="handleEditTask(scope.$index, scope.row)">编辑</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column width="800"/>
                    </el-table>
                </template>
            </el-table-column>
            <el-table-column prop="task" label="任务" min-width="50%"/>
            <el-table-column prop="createTime" label="创建日期" width="250"/>
            <el-table-column label="操作" width="550">
                <template slot-scope="scope">
                    <el-button type="text" @click="addTask(scope.row)">新任务</el-button>
                    <el-button type="text" @click="getShotsByAssetId(scope.row)">镜头</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog
            title="编辑任务"
            :visible.sync="editTaskDialogVisible"
            width="30%"
            center>
            <el-form label-width="80px" label-position="left" >
                <el-form-item label="状态">
                    <el-select v-model="editTask.state" placeholder="请选择">
                        <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="设计师">
                    <el-select v-model="editTask.designerName" placeholder="请选择">
                        <el-option v-for="item in designerOptions" :key="item.value" :label="item.label" :value="item.value" @click.native="clickDesignerOption(item)" />
                    </el-select>
                </el-form-item>
                <el-form-item label="审验人">
                    <el-select v-model="editTask.reviewerName" placeholder="请选择">
                        <el-option v-for="item in reviewerOptions" :key="item.value" :label="item.label" :value="item.value" @click.native="clickReviewerOption(item)" />
                    </el-select>
                </el-form-item>     
                <el-form-item label="难度">
                    <el-select v-model="editTask.degree" placeholder="请选择">
                        <el-option v-for="item in degreeOptions" :key="item.value" :label="item.label" :value="item.value"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="图片" prop="image">
                    <el-upload
                        class="upload-demo"
                        ref="upload"
                        action="http://localhost:3000/api/media/uploadMedia"
                        multiple
                        show-file-list
                        accept="image/png, image/jpeg, image/gif, video/mp4, video/quicktime"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        :on-change="handleChange"
                        :on-success="editTaskSuccessUp"
                        :auto-upload="false">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                    </el-upload>
                </el-form-item> 
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitEditTaskForm()">提交</el-button>
                <el-button @click="resetEditTaskForm('ruleForm')">重置</el-button>
            </span>
        </el-dialog>
        <el-dialog
            title="创建任务"
            :visible.sync="addTaskDialogVisible"
            width="30%"
            center>
            <el-form label-width="60px" class="demo-ruleForm" label-position="left">
                <el-form-item label="阶段">
                    <el-select v-model="newTask.stage" placeholder="请选择">
                        <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="newTask.state" placeholder="请选择">
                        <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="设计师">
                    <el-select v-model="newTask.designerName" placeholder="请选择">
                        <el-option v-for="item in designerOptions" :key="item.value" :label="item.label" :value="item.value" @click.native="clickDesignerOption(item)" />
                    </el-select>
                </el-form-item>
                <el-form-item label="审验人">
                    <el-select v-model="newTask.reviewerName" placeholder="请选择">
                        <el-option v-for="item in reviewerOptions" :key="item.value" :label="item.label" :value="item.value" @click.native="clickReviewerOption(item)" />
                    </el-select>
                </el-form-item>     
                <el-form-item label="难度">
                    <el-select v-model="newTask.degree" placeholder="请选择">
                        <el-option v-for="item in degreeOptions" :key="item.value" :label="item.label" :value="item.value"/>
                    </el-select>
                </el-form-item>       
                <el-form-item label="图片" prop="image">
                    <el-upload
                        class="upload-demo"
                        ref="upload"
                        action="http://localhost:3000/api/media/uploadMedia"
                        multiple
                        show-file-list
                        accept="image/png, image/jpeg, image/gif, video/mp4, video/quicktime"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        :on-change="handleChange"
                        :on-success="addTaskSuccessUp"
                        :auto-upload="false">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                    </el-upload>
                </el-form-item> 
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitAddTaskForm()">创建</el-button>
                <el-button @click="resetTaskForm()">重置</el-button>
            </span>
        </el-dialog>
        <el-dialog
            title="创建资产"
            :visible.sync="addAssetDialogVisible"
            width="30%"
            center>
            <el-form label-width="100px" class="demo-ruleForm" label-position="left">
                <el-form-item label="资产名称">
                    <el-input v-model="newAsset.name" style="width: 80%"></el-input>
                </el-form-item>
                <el-form-item label="类别">
                    <el-select v-model="newAsset.type" placeholder="请选择"  style="width:  80%">
                        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="任务">
                    <el-select v-model="newAsset.stage" placeholder="请选择"  style="width:  80%">
                        <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value"/>
                    </el-select> 
                </el-form-item>    
                <el-form-item label="图片" prop="image">
                    <el-upload
                        class="upload-demo"
                        ref="upload"
                        action="http://localhost:3000/api/media/uploadMedia"
                        multiple
                        show-file-list
                        accept="image/png, image/jpeg, image/gif, video/mp4, video/quicktime"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        :on-change="handleChange"
                        :on-success="addAssetSuccessUp"
                        :auto-upload="false">
                    <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                    <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
                    </el-upload>
                </el-form-item> 
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitAddAssetForm()">创建</el-button>
                <el-button @click="resetAssetForm()">重置</el-button>
            </span>
        </el-dialog>
        <el-dialog
            title="sessionNameLabel"
            :visible.sync="getShotsByAssetIdDialogVisible"
            width="30%"
            center>
            <el-table
                :data="sessionTableData"
                style="width: 100%">
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <el-table :data="props.row.shotList" style="width: 100%" row-key="guid" :show-header="false">
                            <el-table-column min-width="22%"/>
                            <el-table-column prop="name" min-width="78%"/>
                        </el-table>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="sessionName"
                    label="场次名称"
                    min-width="40%"
                    align="center">
                </el-table-column>
                <el-table-column
                    prop="shotNum"
                    :label= shotNumLabel
                    min-width="50%"
                    align="center">
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>
  
<script>
import {mapGetters} from "vuex";
import store from "../../store";
import axios from "axios";
import { th } from "date-fns/locale";
import { it } from "node:test";

  export default {
    name: "myAssets",
    store,
    data() {
      return {
        degreeOptions: [{
          value: 'A',
          label: 'A'
        }, {
          value: 'B',
          label: 'B'
        }, {
          value: 'C',
          label: 'C'
        }, {
          value: 'D',
          label: 'D'
        }, {
          value: 'E',
          label: 'E'
        }],
        reviewerOptions: [{
          value: '同学A',
          label: '同学A'
        }, {
          value: '同学B',
          label: '同学B'
        }],
        designerOptions: [{
          value: '同学A',
          label: '同学A'
        }, {
          value: '同学B',
          label: '同学B'
        }],
        stateOptions: [{
          value: '审验',
          label: '审验'
        }, {
          value: '设计',
          label: '设计'
        }],
        stageOptions: [{
          value: '模型',
          label: '模型'
        }, {
          value: '贴图',
          label: '贴图'
        }, {
          value: '标准光',
          label: '标准光'
        }, {
          value: '绑定',
          label: '绑定'
        }],
        typeOptions: [{
          value: '角色',
          label: '角色'
        }, {
          value: '道具',
          label: '道具'
        }, {
          value: '场景',
          label: '场景'
        }, {
          value: '灯光',
          label: '灯光'
        }, {
          value: '其他',
          label: '其他'
        }],
        editTask: {},
        newTask: {},
        newAsset: {},
        assetNum: 0,
        list: {},
        file: [],
        reviewerId: "",
        designerId: "",
        shotAllNum: 0,
        shotNumLabel: "",
        sessionNameLabel: "",
        editTaskDialogVisible: false,
        addTaskDialogVisible: false,
        addAssetDialogVisible: false,
        getShotsByAssetIdDialogVisible: false,
        sessionTableData: [],
        tableData: []
      };
    },
    computed: {
        ...mapGetters([
            'projectName', 'projectId', 'currentTeam', 'currentUser', 'teamProjectsList'
        ])
    },
    mounted() {
        this.getAssetsByProjectId()
        this.getAllUsers().then(data => {
            let tempUsers = []
            data.forEach(item=>{
                let opt = { label: item.name, value: item._id}
                tempUsers.push(opt)
            })
            this.reviewerOptions = tempUsers
            this.designerOptions = tempUsers
        })
    },
    methods: {
        clickDesignerOption(item) {
            this.currentDesignerId = item.value
            this.editTask.designerName = item.label
        },
        clickReviewerOption(item) {
            this.currentReviewerId = item.value
            this.editTask.reviewerName = item.label
        },
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
        getShotsByAssetId(item) {
            this.getShotsByAssetIdDialogVisible = true
            axios.get(
                "http://localhost:3000/api/asset/getSessionIdListByAssetId", {
                params: { assetId: item._id }
            }).then((res) => {
                let sessionTableDataTemp = []
                let shotAllNumTemp = 0
                if (res.data.length > 0) {
                    res.data.forEach(sessionId=>{
                        let sessionTableRow = {}
                        axios.get(
                            "http://localhost:3000/api/session/getSession", {
                                params: { sessionId: sessionId }
                            }).then((res) => {
                                sessionTableRow.sessionName = res.data.name
                        }).catch(err => console.log(err));
                        axios.get(
                            "http://localhost:3000/api/shot/getShotsBySessionId", {
                                params: { sessionId: sessionId }
                            }).then((res) => {
                                sessionTableRow.shotNum = res.data.length
                                sessionTableRow.shotList = res.data
                                sessionTableDataTemp.push(sessionTableRow)
                                shotAllNumTemp += res.data.length
                                this.sessionTableData = sessionTableDataTemp
                                this.shotAllNum = shotAllNumTemp
                                this.shotNumLabel = "镜头数(" + this.shotAllNum + ")"
                        }).catch(err => console.log(err));
                    })
                } else {
                    this.sessionTableData = []
                    this.shotAllNum = 0
                    this.shotNumLabel = "镜头数(" + 0 + ")"
                }
            }).catch(err => console.log(err));
        },
        handleSelect(item) {
            store.commit("setProjectName", item.name)
            store.commit("setProjectId", item._id)
            this.getAssetsByProjectId()
        },
        getAssetsByProjectId() {
            let projectId = this.projectId
            if (projectId == null || projectId == "")
                projectId = "658fb386c4c1a4038867232f"
            console.log("start getAssetsByProjectId, projectId: ", projectId)
            axios.get(
            "http://localhost:3000/api/asset/getAssetsByProjectId", {
                params: {projectId: projectId},
            }
            ).then((res) => {
                console.log("getAssetsByProjectId result: ", res.data)
                this.assetNum = res.data.length
                res.data.forEach((item, index)=>{
                    item.id = index + 1
                    item.task = "321"
                })
                res.data.forEach((item, index)=>{
                    axios.get(
                        "http://localhost:3000/api/asset/getTasksByAssetId", {
                        params: { assetId: item._id }
                    }).then((res) => {
                        item.gridData = res.data
                        let task = ""
                            if (res.data.length != 0) {
                                res.data.forEach(elem=>{
                                    task += elem.stage + ","
                                })
                                task = task.substring(0, task.length-1)
                            }
                        item.task = task
                    }).catch(err => console.log(err));
                })
                this.tableData = res.data
            }).catch(err => console.log(err));
        },
        handleEditTask(index, row) {
            this.editTaskDialogVisible = true
            this.editTask = row
        },
        submitEditTaskForm() {
            this.editTaskDialogVisible = false
            console.log("更改后的内容: ", this.editTask)
            if (this.file != null && this.file.length > 0) {
                this.$refs.upload.submit()
            } else {
                axios.post(
                    "http://localhost:3000/api/asset/updateAssetTask", {
                        "_id": this.editTask._id,
                        "reviewerId": this.currentReviewerId,
                        "designerId": this.currentDesignerId,
                        "state": this.editTask.state,
                        "degree": this.editTask.degree,
                }).then((res) => {
                    this.file = []
                    this.getAssetsByProjectId()
                    this.$message({
                        showClose: true,
                        message: "修改成功",
                        type: "success"
                    })
                }).catch(err => console.log(err));
            }
        },
        editTaskSuccessUp(response, file, fileList) {
            let fileSize = (file.size / 1024).toFixed(2); // 转换为KB并保留两位小数
            if (fileSize > 1024) {
                fileSize = (fileSize / 1024).toFixed(2); // 转换为MB并保留两位小数
                fileSize = fileSize + "MB"
            } else {
                fileSize = fileSize + "KB"
            }
            console.log("currentReviewerId,currentDesignerId: ", this.currentReviewerId, this.currentDesignerId)
            axios.post(
                "http://localhost:3000/api/asset/updateAssetTask", {
                    "_id": this.editTask._id,
                    "reviewerId": this.currentReviewerId,
                    "designerId": this.currentDesignerId,
                    "state": this.editTask.state,
                    "degree": this.editTask.degree,
                    "fileId": response,
                    "dataSize": fileSize
                }).then((res) => {
                    this.getAssetsByProjectId()
                    this.$message({
                        showClose: true,
                        message: file.name + "上传成功",
                        type: "success"
                    })
            }).catch(err => console.log(err));
        },
        resetEditTaskForm() {

        },
        addTask(row) {
            console.log(row)
            this.newTask.assetId = row._id
            this.addTaskDialogVisible = true
        },
        submitAddTaskForm() {
            this.addTaskDialogVisible = false
            this.$refs.upload.submit();
            console.log("提交新任务，要添加的任务: ", this.newTask)
        },
        addTaskSuccessUp(response, file, fileList) {
            let fileSize = (file.size / 1024).toFixed(2); // 转换为KB并保留两位小数
            if (fileSize > 1024) {
                fileSize = (fileSize / 1024).toFixed(2); // 转换为MB并保留两位小数
                fileSize = fileSize + "MB"
            } else {
                fileSize = fileSize + "KB"
            }
            axios.post(
                "http://localhost:3000/api/asset/addTask", {
                    "assetId": this.newTask.assetId,
                    "reviewerId": this.currentReviewerId,
                    "designerId": this.currentDesignerId,
                    "state": this.newTask.state,
                    "stage": this.newTask.stage,
                    "degree": this.newTask.degree,
                    "fileId": response,
                    "dataSize": fileSize
                }).then((res) => {
                    this.getAssetsByProjectId()
                    this.$message({
                        showClose: true,
                        message: file.name + "上传成功",
                        type: "success"
                    })
            }).catch(err => console.log(err));
        },

        submitAddAssetForm() {
            this.addAssetDialogVisible = false
            console.log("提交新资产，要添加的资产: ", this.newAsset)
            this.$refs.upload.submit();
        },
        addAssetSuccessUp(response, file, fileList) {
            axios.post(
                "http://localhost:3000/api/asset/addAsset", {
                "projectId": this.projectId,
                "type": this.newAsset.type,
                "name": this.newAsset.name,
                "fileId": response,
            }).then((res) => {
                axios.post(
                    "http://localhost:3000/api/asset/addTask", {
                    "assetId": res.data.info.id,
                    "stage": this.newAsset.stage,
                }).then((res) => {
                    this.getAssetsByProjectId()
                    this.$message({
                        showClose: true,
                        message: file.name + "上传成功",
                        type: "success"
                    })
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        },
        handleChange(file, fileList) {
            console.log("handleChange: ", file, fileList[0])
            if (file.size / 1024 / 1024 > 500) {
                this.$baseMessage('文件大小不能大于500M', 'error')
            }
            if (fileList.length > 0) {
                this.file = fileList
            }
        },      
        handleRemove(file, fileList) {
            if (fileList.length == 0) {
                this.file = []
            }
            console.log('移除文件', file, fileList)
        },
        handlePreview(file) {
            console.log("handlePreview", file);
        },
    },
  }
  </script>
  
  <style scoped>
    .image {    
        width: 50px;    
        display: block;  
        height: 50px;
    } 
    .el-form .el-form-item {
        margin-left: 100px
    }
  </style>
  