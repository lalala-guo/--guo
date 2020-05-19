<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAdd">添加</el-button>

    <el-table :data="trademarks" border stripe>
      <!-- 序号列 -->
      <el-table-column label="序号" type="index" width="80" align="center">
      </el-table-column>

      <el-table-column prop="tmName" label="品牌名称">
      </el-table-column>
      <el-table-column label="姓名">
        <template slot-scope="{row}">
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 60px;">
        </template>
      </el-table-column>
      <!-- 如果列表列的内容是指定指定的结构: 使用作用域插槽 -->
      <el-table-column prop="address" label="操作">
        <template slot-scope="{row, $index}">
          <el-button type="warning" icon="el-icon-edit" @click="showUpdate(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteTrademark(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background style="text-align: center; margin-top: 20px;" :current-page="page"
      :page-sizes="[3, 6, 9, 12]" :page-size="limit" layout="prev, pager, next, jumper, ->, sizes, total" :total="total"
      @size-change="handleSizeChange" @current-change="getTrademarkes">
    </el-pagination>
    <!-- 添加的弹框 -->
    <el-dialog :title="form.id ? '更新' : '添加'" :visible.sync="isShowDialog">
      <el-form :model="form" style="width:80%;">
        <el-form-item label="品牌名称" :label-width="formLabelWidth">
          <el-input v-model="form.tmName" autocomplete="off" placeholder="请输入品牌名称"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="formLabelWidth">
          <!-- action:"http://182.92.128.115/admin/product/fileUpload"   后台获取图片的路径   跨域   利用代理服务器 /dev-api -->
          <el-upload class="avatar-uploader" action="/dev-api/admin/product/fileUpload" :show-file-list="false"
            :on-success="handleLogoSuccess" :before-upload="beforeLogoUpload">
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'TrademarkList',

    data() {
      return {
        trademarks: [],
        limit: 3,
        page: 1,
        total: 0,
        isShowDialog: false,
        form: {
          tmName: '',
          logoUrl: ''
        },
        formLabelWidth: '100px',
      }

    },
    methods: {
      deleteTrademark(trademark){
         this.$confirm( `确定删除${trademark.tmName}吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const result = await this.$API.trademark.remove(trademark.id)
          if(result.code === 200){
            this.$message.success('删除成功!');
            // 删除成功显示哪个页面, 如果是最后一个就显示上一页,否则显示当前页
            const page = this.trademarks.length === 1 ? this.page - 1 : page
            this.getTrademarkes(page)
          }else{
            this.$message.error('删除品牌失败!')
          }
        }).catch(() => {
          this.$message.info('已取消删除');
        });
      },
      showUpdate(trademark){
        this.form = trademark
        // 显示
        this.isShowDialog = true
      },
      async addOrUpdateTrademark(){
        const trademark = this.form
        let result
        if(trademark.id){
           result = await this.$API.trademark.update(trademark)
        }else{
           result = await this.$API.trademark.add(trademark)
        }
        if(result.code === 200){
          this.$message.success(`${trademark.id ? '更新' : '添加'} 品牌成功`)
          this.isShowDialog = false
          this.getTrademarkes(trademark.id ? this.page : 1)
          // 清除数据
          this.form = {
            tmName: '',
            logoUrl: ''
          }
        }else{
          this.$message.error(`${trademark.id ? '更新' : '添加'}品牌失败`)
        }

      },
      beforeLogoUpload(file){
        const isJPG = ['image/jpeg', 'image/png'].indexOf(file.type) >= 0;
        const isLt500KB = file.size / 1024 < 500;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
        }
        if (!isLt500KB) {
          this.$message.error('上传头像图片大小不能超过 500KB!');
        }
        return isJPG && isLt500KB;

      },
      handleLogoSuccess(res, file){
        // this.imageUrl = URL.createObjectURL(file.raw);
        const logoUrl = res.data
        this.form.logoUrl = logoUrl
      },

      // 添加
      showAdd() {
        //   重置数据
          this.from = {
            tmName: '',
            logoUrl: ''
          }
        this.isShowDialog = true
      },
      // 每页数量改变的回调函数
      handleSizeChange(pageSize) {
        this.limit = pageSize
        this.getTrademarkes()
      },
      // 获取异步指定页码列表数据
      async getTrademarkes(page = 1) {
        this.page = page
        const result = await this.$API.trademark.getList(page, this.limit)
        if (result.code === 200) {
          const {
            records,
            total
          } = result.data
          this.trademarks = records
          this.total = total
        }
      }
    },
    mounted() {
      this.getTrademarkes()
    }
  }
</script>

<style>
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
