<template>
  <el-main>

    <img alt="Vue logo" src="../assets/logo2.png" >

    <el-row type="flex" justify="center" style="margin-top: 60px">
      <el-col :span="8">
        <!--设置keyup 按enter键也能触发搜索 -->
        <el-input v-model="keyWord" @keyup.enter.native="search" type="text"></el-input>
      </el-col>
      <el-col :span="1">
        <el-button type="primary" class="el-icon-search" @click="search" >搜索</el-button>
      </el-col>
    </el-row>


    <el-radio-group v-model="searchEngine" class="search-group">
      <el-radio-button label="google">谷歌</el-radio-button>
      <el-radio-button label="baidu">百度</el-radio-button>
      <el-radio-button label="doge">Doge</el-radio-button>
    </el-radio-group>


    <div class="tabs">


      <el-button class="el-icon-edit edit-button" @click="switchEditMode" type="primary">{{editString}}</el-button>
      <el-button class="edit-button" v-if="isEdit" @click="addTag">添加分类</el-button>
      <el-button class="edit-button" v-if="isEdit" @click="addWebsite(activeTag)">添加网站</el-button>


      <el-tabs type="card" v-model="activeTag" >

        <!-- tag.tid + ''  是为了将数字转为字符串 -->
        <el-tab-pane
            v-model="websites"
            v-for="tag in websites"
            :name="tag.torder + ''"
            :key="tag.tid">

          <!-- tab 自定义 按钮 包括 删除和修改 -->
          <span slot="label" class="my-tag">
            <i class="el-icon-edit " v-if="isEdit" @click="updateTag(tag.tid, tag.tname, tag.torder)">{{tag.torder}}</i>
            {{ tag.tname }}
            <i class="el-icon-delete "  v-if="isEdit" @click="removeTag(tag.tid, tag.tname, tag.torder)"></i>
          </span>


          <div  class="btn-box">

            <div
                v-for="web in tag.websiteList"
                :key="web.id"
            >
              <!--由于 v-for 和 v-if 不能同级使用，将v-if 放入v-for 的循环中-->
              <!-- 由于后台接口的问题，如果某个分类没有网站，也会对应一个 id = 0 的空值，所以当 id = 0 时要排除-->
              <div class="my-button" v-if="web.id !== 0">

              <span class="el-icon-edit edit-site" @click="editSite(web.id,web.name, web.url, web.order)" v-if="isEdit">{{web.order}}</span>

              <el-link
                  :href="web.url"
                  target="_blank"
                  style="font-size: 20px"
                  :disabled="isEdit"
              >
                {{ web.name }}
              </el-link>

              <span class="el-icon-delete delete-site" @click="deleteSite(web.id, web.name)" v-if="isEdit"></span>

              </div>
            </div>
          </div>


        </el-tab-pane>

      </el-tabs>


      <el-dialog
          title="请输入网站信息"
          :visible.sync="dialogVisible"
          width="30%">

        <el-form ref="ruleForm" status-icon :model="form" :rules="rules" label-width="80px">
          <el-form-item label="网站名" prop="name">
            <el-input type="text" v-model="form.name" spellcheck="false"></el-input>
          </el-form-item>
          <el-form-item label="网站地址" prop="url">
            <el-input type="text" v-model="form.url" spellcheck="false"></el-input>
          </el-form-item>
          <el-form-item label="网站顺序" prop="order" v-if="!isAdd">
            <el-input type="number" v-model="form.order" spellcheck="false"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>

            <!--isAdd 用于判断是否是添加模式 还是修改模式-->
            <el-button type="primary" @click="submitModification('ruleForm')" v-if="!isAdd">确 定</el-button>
            <el-button type="primary" @click="submitAdd('ruleForm')" v-if="isAdd">确 定</el-button>
        </span>
      </el-dialog>

      <!--分类信息弹窗-->
      <el-dialog
          title="请输入分类信息"
          :visible.sync="dialogTagVisible"
          width="25%">

        <el-form  status-icon :model="tagForm"  label-width="80px" >
          <el-form-item label="分类名" >
            <el-input type="text" v-model="tagForm.tname" spellcheck="false"></el-input>
          </el-form-item>

          <el-form-item label="顺序" v-if="!isAddTag">
            <el-input type="number" v-model="tagForm.torder" spellcheck="false"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogTagVisible = false">取 消</el-button>
          <!--isAddTag 用于判断是否是添加模式 还是修改模式-->
            <el-button type="primary" @click="submitModificationTag" v-if="!isAddTag">确 定</el-button>
            <el-button type="primary" @click="submitAddTag" v-if="isAddTag">确 定</el-button>
        </span>

      </el-dialog>

    </div>
  </el-main>
</template>



<script>
import Axios from 'axios'
import qs from 'qs'

export default {
  name: 'Home',
  components: {},
  data () {
    return {
      keyWord: '',
      searchEngine: 'google',
      websites: [],
      activeTag: '1',
      isEdit: false,
      dialogVisible: false,
      dialogTagVisible: false,
      form: {
        name : '',
        url: '',
        id: undefined,
        tagId: undefined,
        order: undefined
      },
      isAdd: false,
      isAddTag: false,
      editString: '编辑',
      rules:{
        name:[
          { required: true, message: '请输入网站名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        url:[
          { required: true, message: '请输入网站地址', trigger: 'blur' },
          { type: 'url', message: '网站地址不合法',trigger: 'blur' }
        ],
        order:[
          { required: true, message: '请输入顺序', trigger: 'blur' }
        ]
      },
      tagForm:{
        tid: undefined,
        tname: '',
        torder: undefined
      }
    }
  },
  methods: {
    search () {
      if (this.keyWord === '') {
        return
      }
      if (this.searchEngine === 'google') {
        window.open('https://google.com/search?q=' + this.keyWord, '_blank')
      }

      if (this.searchEngine === 'baidu') {
        window.open('https://baidu.com/s?wd=' + this.keyWord, '_blank')
      }

      if (this.searchEngine === 'doge') {
        window.open('https://dogedoge.com/results?q=' + this.keyWord, '_blank')
      }
    },

    getData () {

      let api = '/api/tag'
      Axios.get(api).then((response) => {
        this.websites = response.data.result
        console.log("更新前端model")
      }).catch((error) => {
        console.log(error)
      })

    },

    // 网站小编辑按钮
    editSite (id,name, url, order) {
      this.isAdd = false
      this.dialogVisible = true
      this.form.id = id;
      this.form.name = name;
      this.form.url = url;
      this.form.order = order;
    },

    // 按下提交修改按钮，提交修改表单
    submitModification(formName){
      // 先对表单进行校验
      this.$refs[formName].validate((valid) =>{
        if (valid){
          let api = '/api/website';
          let params = qs.stringify({
            name: this.form.name,
            url: this.form.url,
            id: this.form.id,
            order: this.form.order
          })
          Axios.put(api,params).then(this.getData)
          this.dialogVisible = false;
          this.$message("修改成功")
          console.log('修改已提交')
        } else{
          // 表单不合法
          this.$message("参数不合法，修改失败")
          console.log('参数不合法，无法提交')
          return false;
        }
      })

    },

    // 删除网站 按钮（后面还需要一次确认）
    deleteSite (id, webName) {

      this.$confirm('此操作将删除网站 [' + webName  + '] , 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        let api = '/api/website?id=';
        // 由于是异步请求，所以使用.then来等待执行
        Axios.delete(api + id).then(this.getData);

        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });

    },


    switchEditMode () {

      this.isEdit = !this.isEdit
      if (this.isEdit){
        this.editString = "退出编辑"
      }else{
        this.editString = "编辑"
      }
    },

    // 添加网站
    addWebsite (tidString) {
      this.isAdd = true
      this.dialogVisible = true
      // 注意这里的tid 是字符串格式的
      this.form.tagId = parseInt(tidString);
      this.form.name = '';
      this.form.url = '';
      this.form.order= undefined;
    },


    submitAdd(formName){
      this.$refs[formName].validate((valid) =>{
            if (valid) {
              let api = '/api/website'
              let params = qs.stringify({
                name: this.form.name,
                url: this.form.url,
                tagId: this.form.tagId
              })
              Axios.post(api, params).then(this.getData)

              this.isAdd = false;
              this.dialogVisible = false;
              this.$message('添加新网站成功')
            }else{
              this.$message("参数不合法，添加失败")
              return false;
            }
          }
      )
    },

    // 删除分类 tagId
    removeTag(tagId, tagName, tagOrder){

      this.$confirm('此操作将删除分类 [' +tagName + '] 下所有网站, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.activeTag = (tagOrder - 1).toString();

        let api = '/api/tag?tid=';

        Axios.delete(api + tagId).then((response) =>{
          this.websites = response.data.result
        })


        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    // 添加分类
    addTag(){
      this.dialogTagVisible = true;
      this.isAddTag = true;

      // 将表单清空
      this.tagForm.torder = undefined;
      this.tagForm.tid = undefined;
      this.tagForm.tname = '';
    },

    // 添加分类提交
    submitAddTag(){
      let api = '/api/tag'
      let params = qs.stringify({
        tname: this.tagForm.tname,
      })
      Axios.post(api, params).then((response) =>{
        this.websites = response.data.result;
      })

      this.isAddTag = false;
      this.dialogTagVisible = false;
      this.$message('添加新网站成功')
    },

    updateTag(tid, tname, torder){
      this.dialogTagVisible = true;
      this.isAddTag = false;
      this.tagForm.tid = tid;
      this.tagForm.tname = tname;
      this.tagForm.torder = torder;
    },

    // 修改分类提交
    submitModificationTag(){
      let api = '/api/tag';
      let params = qs.stringify({
        tname: this.tagForm.tname,
        tid: this.tagForm.tid,
        torder: this.tagForm.torder
      })
      Axios.put(api,params).then((response) =>{
        this.websites = response.data.result;
      })
      this.dialogTagVisible = false;
      this.$message("修改成功")

    },
  },


  mounted () {
    this.getData()
  }

}
</script>


<style>
.search-group {
  margin-top: 30px;
}

.tabs {
  margin-top: 30px;
}

.btn-box {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;

}

.my-tag {

  font-size: 20px !important;
  line-height: 100%;

}

.my-button {
  min-width: 160px;
  height: 35px;
  font-size: 20px !important;
  line-height: 100%;
  border-radius: 0 !important;
  border: solid 1px #DCDFE6 !important;
  /*margin: 0 -1px -1px 0;*/
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.edit-button {
  margin-left: 0 !important;
  float: right;
  position: relative;
  z-index: 1;
}


.edit-site {
  font-size: large;
  cursor: pointer;
  vertical-align: middle;
  line-height: 1.5 !important;

}

.delete-site {
  font-size: large;
  cursor: pointer;
  line-height: 1.5 !important;
}


</style>
