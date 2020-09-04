<template>


  <el-main>


    <img alt="Vue logo" src="../assets/logo2.png">

    <el-row type="flex" justify="center" style="margin-top: 30px">
      <el-col :span="8">
        <!--设置keyup 按enter键也能触发搜索 -->
        <el-input v-model="keyWord" @keyup.enter.native="search" type="text"></el-input>
      </el-col>

    </el-row>


    <!--change 时也会触发搜索-->
    <el-radio-group v-model="searchEngine" class="search-group" @change="search">
      <el-radio-button label="google">谷歌</el-radio-button>
      <el-radio-button label="baidu">百度</el-radio-button>
      <el-radio-button label="doge">Doge</el-radio-button>
    </el-radio-group>


    <div class="tabs">

      <el-button class="el-icon-user edit-button" @click="login" v-if="!isAdmin">登录</el-button>
      <el-button class="el-icon-user edit-button" @click="logout" v-if="isAdmin">登出</el-button>
      <el-button class="el-icon-edit edit-button" @click="switchEditMode" type="primary" v-if="isAdmin">
        {{ editString }}
      </el-button>
      <el-button class="edit-button" v-if="isEdit" @click="addTag">添加分类</el-button>
      <el-button class="edit-button" v-if="isEdit" @click="addWebsite(activeTag)">添加网站</el-button>


      <!--active Tag 实际上是 当前选中分类的 tid转字符串 -->
      <el-tabs type="card" v-model="activeTag">

        <!-- tag.tid + ''  是为了将数字转为字符串 -->
        <el-tab-pane
            v-model="websites"
            v-for="tag in websites"
            :name="tag.tid + ''"
            :key="tag.tid"
            >

          <!-- tab 自定义 按钮 包括 删除和修改 -->
          <span slot="label" class="my-tag">
            <i class="el-icon-edit " v-if="isEdit" @click="updateTag(tag.tid, tag.tname, tag.torder, tag.secret)">
              <span style="color: #C0C4CC; font-size: 15px ">{{ tag.torder }}</span>
            </i>
            {{ tag.tname }}
            <i class="el-icon-delete " v-if="isEdit" @click="removeTag(tag.tid, tag.tname)"></i>
          </span>


          <div class="btn-box">

            <div
                v-for="web in tag.websiteList"
                :key="web.id"
            >
              <!--由于 v-for 和 v-if 不能同级使用，将v-if 放入v-for 的循环中-->
              <!-- 由于后台接口的问题，如果某个分类没有网站，也会对应一个 id = 0 的空值，所以当 id = 0 时要排除-->
              <div class="my-button" v-if="web.id !== 0">

              <span class="el-icon-edit edit-site" @click="editSite(web.id,web.name, web.url, web.order, web.tagId)" v-if="isEdit">
                <span style="color: #C0C4CC; font-size: 15px">{{ web.order }}</span>
              </span>

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


      <!--网站信息弹窗-->
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


          <!-- 网站所属的分类 -->
          <el-form-item label="网站分类"  v-if="!isAdd">

            <el-select v-model="form.tagId" placeholder="请选择">
              <el-option
                  v-for="item in tagsOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>

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
          width="30%">

        <el-form status-icon :model="tagForm" label-width="80px">
          <el-form-item label="分类名">
            <el-input type="text" v-model="tagForm.tname" spellcheck="false"></el-input>
          </el-form-item>

          <el-form-item label="顺序" v-if="!isAddTag">
            <el-input type="number" v-model="tagForm.torder" spellcheck="false"></el-input>
          </el-form-item>

          <el-form-item label="范围" >
            <el-radio-group v-model="tagForm.secret" >

              <el-radio :label = 0>公开</el-radio>
              <el-radio :label = 1>私密</el-radio>
            </el-radio-group>

          </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogTagVisible = false">取 消</el-button>
          <!--isAddTag 用于判断是否是添加模式 还是修改模式-->
            <el-button type="primary" @click="submitModificationTag" v-if="!isAddTag">确 定</el-button>
            <el-button type="primary" @click="submitAddTag" v-if="isAddTag">确 定</el-button>
        </span>

      </el-dialog>

      <!--用户登录弹窗-->
      <el-dialog
          title="用户登录"
          :visible.sync="dialogLoginVisible"
          width="30%"
      >
        <el-form status-icon :model="loginForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input type="text" v-model="loginForm.name" spellcheck="false"></el-input>
          </el-form-item>

          <el-form-item label="密码">
            <el-input type="password" v-model="loginForm.pwd" spellcheck="false"></el-input>
          </el-form-item>


        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="dialogLoginVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitLogin">确 定</el-button>
          </span>

      </el-dialog>


    </div>
  </el-main>
</template>


<script>
import Axios from 'axios'
import qs from 'qs'

// 全局 axios 请求都会加上这个token
Axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.token = token
  }
  return config
})

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
      isAdmin: false,
      dialogVisible: false,
      dialogTagVisible: false,
      dialogLoginVisible: false,
      form: {
        name: '',
        url: '',
        id: undefined,
        tagId: undefined,
        order: undefined,
      },
      isAdd: false,
      isAddTag: false,
      editString: '编辑',
      rules: {
        name: [
          { required: true, message: '请输入网站名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入网站地址', trigger: 'blur' },
          { type: 'url', message: '网站地址不合法', trigger: 'blur' }
        ],
        order: [
          { required: true, message: '请输入顺序', trigger: 'blur' }
        ]
      },
      tagForm: {
        tid: undefined,
        tname: '',
        torder: undefined,
        secret: 0,
      },
      loginForm: {
        name: '',
        pwd: '',
      },

      tagsOption: []
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
        if (response.data.success === false) {
          console.log('请求管理员数据失败')
          this.isAdmin = false;
        }
        console.log('请求管理员数据成功')
        this.websites = response.data.result
        this.isAdmin = true;
      })

    },

    // 网站小编辑按钮
    editSite (id, name, url, order, tagId) {
      this.isAdd = false
      this.dialogVisible = true
      this.form.id = id
      this.form.name = name
      this.form.url = url
      this.form.order = order
      this.form.tagId = tagId

      this.updateTagsOption();
    },

    // 按下提交修改按钮，提交修改表单
    submitModification (formName) {
      // 先对表单进行校验
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let api = '/api/website'
          let params = qs.stringify({
            name: this.form.name,
            url: this.form.url,
            id: this.form.id,
            order: this.form.order,
            tagId: this.form.tagId
          })
          Axios.put(api, params).then(this.getData)
          this.dialogVisible = false
          this.$message('修改成功')
        } else {
          // 表单不合法
          this.$message('参数不合法，修改失败')
          return false
        }
      })

    },

    // 删除网站 按钮（后面还需要一次确认）
    deleteSite (id, webName) {

      this.$confirm('此操作将删除网站 [' + webName + '] , 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        let api = '/api/website?id='
        // 由于是异步请求，所以使用.then来等待执行
        Axios.delete(api + id).then(this.getData)

        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })

    },

    // 切换编辑模式 --- 进入编辑模式 退出编辑模式
    switchEditMode () {

      this.isEdit = !this.isEdit
      if (this.isEdit) {
        this.editString = '退出编辑'
      } else {
        this.editString = '编辑'
      }
    },

    // 添加网站
    addWebsite (tidString) {
      this.isAdd = true
      this.dialogVisible = true
      // 注意这里的tid 是字符串格式的
      this.form.tagId = parseInt(tidString)
      this.form.name = ''
      this.form.url = ''
      this.form.order = undefined
    },

    // 添加网站 提交
    submitAdd (formName) {
      this.$refs[formName].validate((valid) => {
            if (valid) {
              let api = '/api/website'
              let params = qs.stringify({
                name: this.form.name,
                url: this.form.url,
                tagId: this.form.tagId
              })
              Axios.post(api, params).then(this.getData)

              this.isAdd = false
              this.dialogVisible = false
              this.$message('添加新网站成功')
            } else {
              this.$message('参数不合法，添加失败')
              return false
            }
          }
      )
    },

    // 删除分类 tagId
    removeTag (tagId, tagName) {

      this.$confirm('此操作将删除分类 [' + tagName + '] 下所有网站, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.displayTag();

        let api = '/api/tag?tid=';

        Axios.delete(api + tagId).then((response) => {
          this.websites = response.data.result
        })

        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    // 添加分类
    addTag () {
      this.dialogTagVisible = true
      this.isAddTag = true

      // 将表单清空
      this.tagForm.torder = undefined
      this.tagForm.tid = undefined
      this.tagForm.tname = ''
      this.tagForm.secret = 0
    },

    // 添加分类提交
    submitAddTag () {
      let api = '/api/tag'
      let params = qs.stringify({
        tname: this.tagForm.tname,
        secret: this.tagForm.secret,
      })
      Axios.post(api, params).then((response) => {
        this.websites = response.data.result
      })

      this.isAddTag = false
      this.dialogTagVisible = false
      this.$message('添加新网站成功')
    },

    updateTag (tid, tname, torder, secret) {
      this.dialogTagVisible = true
      this.isAddTag = false
      this.tagForm.tid = tid
      this.tagForm.tname = tname
      this.tagForm.torder = torder
      this.tagForm.secret = secret
    },

    // 修改分类提交
    submitModificationTag () {
      let api = '/api/tag'
      let params = qs.stringify({
        tname: this.tagForm.tname,
        tid: this.tagForm.tid,
        torder: this.tagForm.torder,
        secret: this.tagForm.secret,
      })
      Axios.put(api, params).then((response) => {
        this.websites = response.data.result
      })
      this.dialogTagVisible = false
      this.$message('修改成功')

    },

    login () {
      // alert("已经登陆")
      this.dialogLoginVisible = true
    },

    submitLogin () {
      let api = '/api/login'
      let params = qs.stringify({
        name: this.loginForm.name,
        pwd: this.loginForm.pwd
      })
      Axios.post(api, params).then((response) => {

        if (response.data.success === false) {
          this.$message("密码错误，登录失败")
          return
        }

        this.token = response.data.result

        // 将token 保存在localStorage
        localStorage.setItem('token', this.token)

        this.getData()
        this.dialogLoginVisible = false
        this.isAdmin = true
      })
    },

    logout () {
      this.$message("登出")
      localStorage.clear()
      this.getGuestData()
      this.isEdit = false
      this.isAdmin = false
    },

    autoLogin () {

      // 如果localstorage 有token 就取出来验证是否是真的
      if (localStorage.getItem('token')) {

        let api = '/api/tag'
        Axios.get(api).then((response) => {
          if (response.data.success === false) {
            console.log('请求管理员数据失败')
            this.isAdmin = false;
            localStorage.clear();
            this.getGuestData();
          }
          console.log('请求管理员数据成功')
          this.websites = response.data.result;
          this.isAdmin = true;
          this.displayTag();
        }).catch(err =>{
          console.log(err)
        })



      }else{
        this.isAdmin = false;
        localStorage.clear();
        this.getGuestData();
      }

    },

    getGuestData () {
      // 获取公开网站。
      let api = '/api/openTag'
      Axios.get(api).then((response) => {
        this.websites = response.data.result
      }).catch(
          err =>{
            console.log(err)
          }
      ).then(
          // 处理显示初次显示的tab问题
          () => {
        this.displayTag();
        console.log(this.activeTag);
      }

    )

    },

    // 优化显示，初始显示的 动态设置当前显示的第一个 分类的tid
    displayTag(){

      if (localStorage.getItem('activeTag') == null) {
        this.activeTag = this.websites[0].tid.toString();
      }else{
        this.activeTag = localStorage.getItem('activeTag')
      }
    },


    // 更新 tagsOption 该数组对应 网站修改分类时候对应的 各个分类名 以及内部对应的 tid
    // 每次进入修改网站，都会调用该函数
    updateTagsOption(){
      this.tagsOption = [];
      this.websites.forEach((res) =>{
        this.tagsOption.push({
          value: res.tid,
          label: res.tname
        })
      })
    }

  },



  mounted () {
    this.autoLogin()
  },

  // 侦听 activeTag
  watch: {
    activeTag(newActiveTag) {
      localStorage.setItem('activeTag', newActiveTag)
    }
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
