<template>
  <div>
    <el-card>
      <template>
        <el-table
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column
            prop="date"
            label="序号"
            align="center"
            type="index"
            width="80">
          </el-table-column>
          <el-table-column
            prop="skuName"
            label="名称"
            width="180">
          </el-table-column>
          <el-table-column
            prop="skuDesc"
            label="描述">
          </el-table-column>
          <el-table-column

            label="默认图片"
            width="120">
            <template slot-scope="{row,$index}">
              <img :src="row.skuDefaultImg" style="width: 100px"/>
            </template>
          </el-table-column>
          <el-table-column
            prop="weight"
            label="重量(KG)">
          </el-table-column>
          <el-table-column
            prop="price"
            label="价格"
            width="80">
          </el-table-column>
          <el-table-column
            prop="address"
            label="操作">
            <template>
              <hint-button title="上架" type="warning" icon="el-icon-top" size="mini"></hint-button>
              <hint-button title="修改" type="primary" icon="el-icon-edit" size="mini"></hint-button>
              <hint-button  title="查看详情" type="primary" icon="el-icon-info" size="mini"
              @click="drawer = true"></hint-button>
              <!-- <el-radio-group v-model="direction">
                <el-radio label="rtl"></el-radio>
              </el-radio-group> -->
                <el-drawer
                  title="我是标题"
                  :visible.sync="drawer"
                  :direction="direction"
                  :before-close="handleClose">
                  <span>我来啦!</span>
                </el-drawer>
              <hint-button title="删除" type="danger" icon="el-icon-delete" size="mini"></hint-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'SkuList',
    data() {
      return {
        drawer: false,
        direction: 'rtl',

        tableData: [],
        isShowSkuInfo:false,
        limit:10,
        loading:false,
        page: 1,
        skuInfo:{},
        skuList:[],
        total:0
      }
    },
    mounted(){
      this.getSkuList()
    },
    methods:{
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      async getSkuList(){
        const { page, limit } = this
        const result = await this.$API.sku.getList(page, limit)
        if(result.code === 200){
          this.tableData = result.data.records
        }
      }
    }
}
</script>

