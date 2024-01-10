<template>
    <div>
        <div style="height: 40px;">
            <div style="float: left; margin: 30px 0 30px 0; font-size:26px">
                <div class="block">
                    <span class="demonstration">监控信息：</span>
                    <el-date-picker
                        v-model="value"
                        type="datetimerange"
                        :picker-options="pickerOptions"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        @change="dateChange"
                        align="right">
                    </el-date-picker>
                </div>
            </div>
        </div>
        <el-table :data="tableData" border tooltip-effect="dark" style="width: 100%;">
            <el-table-column prop="id" label="序号" width="50"/>
            <el-table-column type="expand" >
                <template slot-scope="props">
                    <el-table :data="props.row.gridData" style="width: 100%" row-key="guid">
                        <el-table-column width="100" />
                        <el-table-column prop="stage" label="项目名" min-width="10%"/>
                        <el-table-column prop="state" label="任务名"  min-width="10%"/>
                        <el-table-column prop="designerName" label="设计时间"  min-width="15%"/>
                        <el-table-column label="操作"  min-width="10%">
                            <template slot-scope="scope">
                                <el-button type="text" @click="handleEditTask(scope.$index, scope.row)">编辑</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column width="800"/>
                    </el-table>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="设计师" width="150"/>
            <el-table-column prop="type" label="完成任务数" width="150"/>
            <el-table-column prop="task" label="动作数" width="100"/>
            <el-table-column label="操作" min-width="50%">
                <template slot-scope="scope">
                    <el-button type="text" @click="addTask(scope.row)">详情</el-button>
                </template>
            </el-table-column>
        </el-table>
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
        reviewTasksList: [],
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        value: '',
        tableData: [{
            gridData: {
                stage: "a"
            }
        }],
      };
    },
    computed: {
        ...mapGetters([
            'projectName', 'projectId', 'currentTeam', 'currentUser', 'teamProjectsList'
        ])
    },
    mounted() {
        this.getTasksByReviewerId()
    },
    methods: {
        getTasksByReviewerId() {
            let userId = "657fdd5e0d372068c4ec37f2"
            axios.get(
                "http://localhost:3000/api/task/getTasksByReviewerId", {
                    params: {reviewerId: "657fdd5e0d372068c4ec37f2"},
                }
            ).then((res) => {
                res.data.forEach((item,index)=>{
                    res.data[index].id = index + 1 
                })
                this.reviewTasksList = res.data
            }).catch(err => console.log(err));
        },
        submitTask(row) {
            console.log(row)
        },
        dateChange(val) {
            console.log("data range: ", val[0], val[1]);

        } 
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
  