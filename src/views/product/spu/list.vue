<template>
  <div>
    <el-card>
      <CategorySelector ref="cs" @categoryChange="handleCategoryChange"></CategorySelector>
    </el-card>
    <el-card style="margin-top:20px">
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button type="primary" icon="el-icon-plus" style="margin-bottom: 20px" @click="showAddSpu">添加SPU</el-button>
        <el-table v-loading="loading" border style="margin: 20px 0" :data="spuList">
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column label="SPU名称" prop="spuName"></el-table-column>
          <el-table-column label="SPU描述" prop="description" ></el-table-column>
          <el-table-column label="操作" width="350">
            <template slot-scope="{row,$index}">
              <HintButton title="添加SKU" type="primary" icon="el-icon-plus" size="mini" @click="addSku"></HintButton>
              <HintButton title="修改SKU" type="primary" icon="el-icon-edit" size="mini" @click="showUpdateSpu(row.id)" ></HintButton>
              <HintButton title="查看所有SKU" type="info" icon="el-icon-info" size="mini" @click="showSkuList(row.id)" ></HintButton>
              <!-- 查看已有的SKU -->
              <!-- <el-button type="text" @click="dialogTableVisible = true">打开嵌套表格的 Dialog</el-button> -->
              <el-dialog :visible.sync="dialogTableVisible">
                <el-table :data="gridData">
                  <el-table-column property="skuName" label="名称" width="150"></el-table-column>
                  <el-table-column property="price" label="价格(元)" width="200"></el-table-column>
                  <el-table-column property="weight" label="重量(KG)"></el-table-column>
                  <el-table-column  label="默认图片">
                    <template slot-scope="{row,$index}">
                      <img :src="row.skuDefaultImg" style="width:100px"/>
                    </template>
                  </el-table-column>
                </el-table>
              </el-dialog>
              <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="remove(row.id)" >
                <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini"
                  >删除</el-button>
              </el-popconfirm>
              <!-- <HintButton title="删除" type="danger" icon="el-icon-delete" size="mini" ></HintButton> -->
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          style="text-align: center; margin-top: 20px;"
          :current-page="page"
          :page-sizes="[3, 6, 9, 12]"
          :page-size="limit"
          layout="prev, pager, next, jumper, ->, sizes, total"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="getSpuList">
        </el-pagination>
      </div>
      <!-- 子组件想父组件传递信息   :visibal.sync="isShowSpuForm"  相当于@update:visible=" isShowSpuForm = $event"     -->
      <SpuForm ref="spuForm" v-show="isShowSpuForm" :visible.sync="isShowSpuForm" />
      <!-- @saveScucess="onSaveSuccess" -->
      <SkuForm ref="skuForm" v-show="isShowSkuForm" :visible.sync="isShowSkuForm"/>
    </el-card>
  </div>
</template>

<script>
import SpuForm from '../components/spuForm'
import SkuForm from '../components/skuForm'
  export default {
    name: 'SpuList',
    data(){
      return {
        loading: false,
        page: 1,
        limit:3,
        total: 0,
        spuList: [],
        category1Id: '',
        category2Id: '',
        category3Id: '',
        // isShowList: true,
        isShowSpuForm: false,
        isShowSkuForm: false,

        dialogTableVisible: false,

        gridData: [],

        // isShowSkuAdd: false
      }
    },
    mounted(){
      this.category3Id = 61
      this.getSpuList()
    },
  //   watch: {
  //   // 当isShowList发生改变时执行处理: 更新cs组件的disabled状态数据
  //   isShowList (value) {
  //     this.$refs.cs.disabled = !value
  //   }
  // },
    methods:{
      // onSaveSuccess(){
      //   // 如果spuId有值, 说明是更新
      //   if (this.spuId) {
      //     // 获取当前页列表显示
      //     this.getSpuList(this.page)
      //     // 重置spuId
      //     this.spuId = ''
      //   } else {// 是添加, 获取第1页显示
      //     this.getSpuList()
      //   }
      // },
      async remove(id){
        const result = await this.$API.spu.remove(id)
        this.getSpuList()
        // this.spuList.splice($index,1)
      },
      addSku(){
        this.isShowSkuForm = true
      },
      async showSkuList(id){
        this.dialogTableVisible = true
        const result = await this.$API.sku.getListBySpuId(id)
        if(result.code === 200){
          this.gridData = result.data
        }
      },

      showSkuAdd(){
        this.isShowSpuForm = true
      },
      showAddSpu(){
        this.isShowSpuForm = true
        this.$refs.spuForm.initLoadAddData()
      },
      showUpdateSpu(id){
        // 显示spuForm的页面
        this.isShowSpuForm = true
        //通知spuForm根据传入的id显示需要的数据
        // 因为是使用的v-show进行隐藏的,不需要用$nextTick
        this.$refs.spuForm.initLoadUpdateData(id)
      },
      handleCategoryChange({categoryId, level}){
        if(level === 1){
          // 将二级三级分类列表都清空
          this.category1Id = categoryId
          this.category2Id = ''
          this.category3Id = ''
          this.spuList = []
          this.total = 0
        }else if(level === 2){
          this.category2Id = categoryId
          this.category3Id = ''
          this.spuList = []
          this.total = 0
        }else{
          this.category3Id = categoryId
          // 获取数据列表
          this.getSpuList()
        }
      },
      // 异步获取数据列表
      async getSpuList(page=1){
        this.page = page
        const {limit, category3Id} = this
        const result = await this.$API.spu.getList(page, limit,category3Id)
        if(result.code === 200){
          // 解构赋值
          const {records, total} = result.data
          this.spuList = records
          this.total = total
        }
      },
      // 每页显示的数量变化回调函数
      handleSizeChange(pageSize){
        this.limit = pageSize
        this.getSpuList()
      }
    },

    components:{
      SpuForm,
      SkuForm
    }

  }
</script>
