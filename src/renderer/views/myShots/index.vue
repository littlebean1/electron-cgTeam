<template>
    <div>
        <div style="height: 40px;">
            <div style="float: left; margin: 30px 0 0 0; font-size:26px">我的镜头({{ shotNum }})</div>
            <el-dropdown>
                <el-button type="primary"  style="float: left; margin: 30px 0 0 80px; border-radius: 50px">
                    {{ this.projectName }}
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item, index) in this.teamProjectsList" :key="index" @click.native="handleProjectSelect(item)">
                        {{ item.name }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown>
                <el-button type="primary"  style="float: left; margin: 30px 0 0 10px; border-radius: 50px; background-color:green">
                    {{ this.currentSession.name }}
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item, index) in this.sessionsList" :key="index" @click.native="handleSessionSelect(item)">
                        {{ item.name }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-button type="primary" @click="addShotDialogVisible = true" style="float: right; margin: 30px 100px 30px 0;">创建镜头</el-button>
        </div>
        <el-table :data="tableData" border tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="id" label="序号" width="50"/>
            <el-table-column prop="image" width="70">
                <template slot-scope="scope">
                    <el-image :src="'data:image/png;base64,'+scope.row.buffer" class="image" />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" width="150"/>
            <el-table-column type="expand">
                <template slot-scope="props">
                <el-table ref="multipleTable" :data="props.row.gridData" style="width: 100%" row-key="guid">
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
                            <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column width="800"/>
                </el-table>
                </template>
            </el-table-column>
            <el-table-column prop="task" label="任务" min-width="50%"/>
            <el-table-column prop="frameRange" label="帧序列" width="150"/>
            <el-table-column prop="createTime" label="创建日期" width="250"/>
            <el-table-column label="操作" width="400">
                <template slot-scope="scope">
                    <el-button type="text" @click="addTask(scope.row)">新任务</el-button>
                    <el-button type="text" @click="getAssetsByShotId(scope.row)">资产</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog
            title="编辑任务"
            :visible.sync="editTaskDialogVisible"
            width="30%"
            center>
            <el-form label-width="100px">
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
            <el-form label-width="100px" class="demo-ruleForm" label-position="left">
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
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitAddTaskForm()">创建</el-button>
                <el-button @click="resetAddTaskForm()">重置</el-button>
            </span>
        </el-dialog>
        <el-dialog
            title="创建镜头"
            :visible.sync="addShotDialogVisible"
            width="30%"
            center>
            <el-form label-width="100px" class="demo-ruleForm" label-position="left">
                <el-form-item label="镜头名称">
                    <el-input v-model="newShot.name" style="width: 80%"></el-input>
                </el-form-item>   
                <el-form-item label="任务阶段">
                    <el-select v-model="newShot.stage" placeholder="请选择" style="width:  80%">
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
                        :on-success="addShotSuccessUp"
                        :auto-upload="false">
                    <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                    </el-upload>
                </el-form-item> 
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitAddShotForm()">创建</el-button>
                <el-button @click="resetAddAssetForm()">重置</el-button>
            </span>
        </el-dialog>
        <el-dialog
            :title=shotNameLabel
            :visible.sync="getAssetsByShotIdDialogVisible"
            width="30%"
            center>
            <el-table
                :data="assetsInfo"
                style="width: 100%">
                <el-table-column
                    prop="projectName"
                    label="项目名"
                    min-width="50%"
                    align="center">
                </el-table-column>
                <el-table-column
                    prop="assetName"
                    :label= assetSizeLabel
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
                }, {
                value: '完成',
                label: '完成'
                }],
                stageOptions: [{
                value: '布局',
                label: '布局'
                }, {
                value: '动画',
                label: '动画'
                }, {
                value: '特效',
                label: '特效'
                }, {
                value: '灯光',
                label: '灯光'
                }, {
                value: '渲染',
                label: '渲染'
                }, {
                value: '合成',
                label: '合成'
                }],
                projectsList: [],
                sessionsList: [],
                editTask: {},
                newTask: {},
                newShot: {},
                reviewerId: "",
                designerId: "",
                editTaskDialogVisible: false,
                addTaskDialogVisible: false,
                addShotDialogVisible: false,
                getAssetsByShotIdDialogVisible: false,
                assetSizeLabel: "",
                shotNameLabel: "",
                shotNum: 0,
                list: [],
                assetsInfo: [{
                    projectName: "项目A",
                    assetName: "asset-1"
                }, {
                    projectName: "项目A",
                    assetName: "asset-2"
                }],
                users: [],
                tableData: []
            };
        },
        computed: {
            ...mapGetters([
                'projectName', 'projectId', 'currentTeam', 'currentUser', 'teamProjectsList', 'currentSession'
            ])
        },
        mounted() {
            this.getShotsByProjectIdAndSessionId()
            this.getAllUsers().then(data => {
                let tempUsers = []
                data.forEach(item=>{
                    let opt = { label: item.name, value: item._id}
                    tempUsers.push(opt)
                })
                this.reviewerOptions = tempUsers
                this.designerOptions = tempUsers
            })
            this.getSessionsByProjectId()
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
            handleProjectSelect(item) {
                store.commit("setProjectName", item.name)
                store.commit("setProjectId", item._id)
                axios.get(
                    "http://localhost:3000/api/session/getSessionsByProjectId", {
                        params: {projectId: this.projectId},
                    }
                ).then((res) => {
                    this.sessionsList = res.data
                    if (res.data.length > 0) {
                        store.commit("setCurrentSession", res.data[0])
                    }
                    this.getShotsByProjectIdAndSessionId()
                }).catch(err => console.log(err));
            },
            handleSessionSelect(item) {
                store.commit("setCurrentSession", item)
                this.getShotsByProjectIdAndSessionId()
            },
            getSessionsByProjectId() {
                let projectId = this.projectId
                console.log("start getSessionsByProjectId, projectId: ", projectId)
                axios.get(
                    "http://localhost:3000/api/session/getSessionsByProjectId", {
                        params: {projectId: projectId},
                    }
                ).then((res) => {
                    this.sessionsList = res.data
                }).catch(err => console.log(err));
            },
            getShotsByProjectIdAndSessionId() {
                axios.get(
                    "http://localhost:3000/api/shot/getShotsByProjectIdAndSessionId", {
                        params: {projectId: this.projectId, sessionId: this.currentSession._id},
                    }
                ).then((res) => {
                    console.log("getShotsByProjectIdAndSessionId result: ", res.data)
                    this.shotNum = res.data.length
                    res.data.forEach((item, index)=>{
                        item.id = index + 1
                        item.task = "321"
                    })
                    res.data.forEach((item, index)=>{
                        axios.get(
                            "http://localhost:3000/api/shot/getTasksByShotId", {
                            params: { shotId: item._id }
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
            handleEdit(index, row) {
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
                        this.getShotsByProjectIdAndSessionId()
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
                        this.getShotsByProjectIdAndSessionId()
                        this.$message({
                            showClose: true,
                            message: file.name + "上传成功",
                            type: "success"
                        })
                }).catch(err => console.log(err));
            },
            resetAddAssetForm() {

            },
            resetAddTaskForm() {

            },
            resetEditTaskForm() {

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
            addTask(row) {
                console.log(row)
                this.newTask.shotId = row._id
                this.addTaskDialogVisible = true
            },
            submitAddTaskForm() {
                this.addTaskDialogVisible = false
                console.log("提交新任务，要添加的任务: ", this.newTask)
                if (this.file != null && this.file.length > 0) {
                    this.$refs.upload.submit();
                } else {
                    axios.post(
                    "http://localhost:3000/api/shot/addTask", {
                        "shotId": this.newTask.shotId,
                        "reviewerId": this.currentReviewerId,
                        "designerId": this.currentDesignerId,
                        "state": this.newTask.state,
                        "stage": this.newTask.stage,
                        "degree": this.newTask.degree,
                        "projectId": this.projectId,
                        "sessionId": this.currentSession._id,
                        "name": this.currentSession.name + "_001"
                    }).then((res) => {
                        this.getShotsByProjectIdAndSessionId()
                        this.$message({
                            showClose: true,
                            message: "添加成功",
                            type: "success"
                        })
                    }).catch(err => console.log(err));
                }
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
                    "http://localhost:3000/api/shot/addTask", {
                        "shotId": this.newTask.shotId,
                        "reviewerId": this.currentReviewerId,
                        "designerId": this.currentDesignerId,
                        "state": this.newTask.state,
                        "stage": this.newTask.stage,
                        "degree": this.newTask.degree,
                        "fileId": response,
                        "projectId": this.projectId,
                        "sessionId": this.currentSession._id,
                        "name": this.currentSession.name + "_001",
                        "dataSize": fileSize
                    }).then((res) => {
                        this.getShotsByProjectIdAndSessionId()
                        this.$message({
                            showClose: true,
                            message: file.name + "上传成功",
                            type: "success"
                        })
                }).catch(err => console.log(err));
            },
            submitAddShotForm() {
                this.addShotDialogVisible = false
                console.log("提交新镜头，要添加的镜头: ", this.newShot)
                this.$refs.upload.submit();
            },
            addShotSuccessUp(response, file, fileList) {
                axios.post(
                    "http://localhost:3000/api/shot/addShot", {
                    "stage": this.newShot.stage,
                    "name": this.newShot.name,
                    "projectId": this.projectId,
                    "fileId": response,
                    "sessionId": this.currentSession._id
                }).then((res) => {
                    axios.post(
                        "http://localhost:3000/api/shot/addTask", {
                        "shotId": res.data.info.id,
                        "stage": this.newShot.stage,
                    }).then((res) => {
                        this.getShotsByProjectIdAndSessionId()
                        this.$message({
                            showClose: true,
                            message: file.name + "上传成功",
                            type: "success"
                        })
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            },
            getAssetsByShotId(item) {
                this.getAssetsByShotIdDialogVisible = true
                axios.get(
                    "http://localhost:3000/api/shot/getAssetsByShotId", {
                    params: { shotId: item._id }
                }).then((res) => {
                    let assetsInfoTemp = []
                    res.data.forEach(element => {
                        let tempAsset = {
                            projectName: this.projectName,
                            assetName: element.name
                        }
                        assetsInfoTemp.push(tempAsset)
                    });
                    this.assetsInfo = assetsInfoTemp
                    this.assetSizeLabel = "资产数(" + res.data.length + ")"
                    this.shotNameLabel = item.name + ": 包含的资产"
                }).catch(err => console.log(err));
                console.log("invoke getAssetsByShotId, item: ", item)
            },
            getTeams() {
                axios.get(
                    "http://localhost:3000/api/team/getTeams", {
                }).then((res) => {
                    console.log(res.data)
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
  </style>
  