<template>
  <div>
    <el-card style="margin-bottom: 20px" v-show="!isShowSkuForm">
      <CategorySelector ref="cs" @categoryChange="handleCategoryChange"></CategorySelector>
    </el-card>
    <el-card>
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button type="primary"  icon="el-icon-plus" style="margin-bottom: 20px"
          @click="showAddSpu" :disabled="!category3Id">添加SPU</el-button>
        <el-table
          v-loading="loading"
          :data="spuList"
          border
          stripe>
          <el-table-column
           label="序号"
           type="index"
           width="80"
           align="center">
           </el-table-column>
          <el-table-column label="SPU名称" prop="spuName">
          </el-table-column>
          <el-table-column label="SPU描述" prop="description">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row, $index}">
              <hint-button title="添加SKU" type="primary" icon="el-icon-plus" size="mini"
                @click="showSkuAdd(row)"></hint-button>
              <HintButton title="修改SPU" type="primary" icon="el-icon-edit" size="mini"
               @click="showUpdateSpu(row.id)" ></HintButton>
              <HintButton title="查看所有SKU" type="info" icon="el-icon-info" size="mini"
               @click="showSkuList(row)" ></HintButton>
              <!-- 查看已有的SKU -->
              <!-- <el-button type="text" @click="dialogTableVisible = true">打开嵌套表格的 Dialog</el-button> -->
              <el-dialog :visible.sync="dialogTableVisible">
                <el-table :data="skuList" border>
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
          @current-change="getSpuList"
          @size-change="handleSizeChange"
        />
      </div>
      <!-- 子组件想父组件传递信息   :visibal.sync="isShowSpuForm"  相当于@update:visible=" isShowSpuForm = $event"     -->
      <SpuForm ref="spuForm" :visible.sync="isShowSpuForm" @saveSuccess="handleSaveSuccess" @cancel="handleCancel"/>
      <!-- @saveScucess="onSaveSuccess" -->
      <SkuForm ref="skuForm" v-show="isShowSkuForm"
       @cancel="isShowSkuForm=false"/>
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

        skuList: [],

      }
    },
    mounted(){
      // this.category1Id = 2
      // this.category2Id = 13
      // this.category3Id = 61
      // this.getSpuList()
    },
    watch: {
    // 当isShowList发生改变时执行处理: 更新cs组件的disabled状态数据
    isShowSpuForm (value) {
      this.$refs.cs.disabled = value
    }
  },
    methods:{

      async showSkuList(spu){
        this.dialogTableVisible = true
        this.spu = spu
        const result = await this.$API.sku.getListBySpuId(spu.id)
        if(result.code === 200){
          this.skuList = result.data
        }
      },

      handleSaveSuccess(){
        // 重新获取分页列表
        // 如果是添加, 显示第一页, 如果是更新显示当前页
        this.getSpuList(this.spuId ? this.page : 1)

        // 重置更新的标识
        this.spuId = null
      },
      handleCancel () {
        // 重置更新的标识
        this.spuId = null
      },

      showSkuAdd(spu){
        console.log("cccccccccccc",this.category1Id,this.category2Id)
        this.isShowSkuForm = true
        // 浅拷贝spu内的数据, 防止更新列表中的数据
        spu = { ...spu }
        // 将category1Id,category2Id重新赋值
        spu.category1Id = this.category1Id
        spu.category2Id = this.category2Id
        // 让skuForm去请求加载初始显示需要的数据
        this.$refs.skuForm.initLoadAddData(spu)
      },

      showAddSpu(){
        this.isShowSpuForm = true
        this.$refs.spuForm.initLoadAddData(this.category3Id)
      },

      async remove(id){
        const result = await this.$API.spu.remove(id)
        this.getSpuList()
        // this.spuList.splice($index,1)
      },

      showUpdateSpu(id){
        this.spuId = id
        // 显示spuForm的页面
        this.isShowSpuForm = true
        //通知spuForm根据传入的id显示需要的数据
        // 因为是使用的v-show进行隐藏的,不需要用$nextTick
        this.$refs.spuForm.initLoadUpdateData(id)
      },
      handleCategoryChange ({categoryId, level}) {
        if (level===1) {
          this.category1Id = categoryId
          this.category2Id = ''
          this.category3Id = ''
          this.spuList = [],
          this.total = 0
        } else if (level===2) {
          this.category2Id = categoryId
          this.category3Id = ''
          this.spuList = [],
          this.total = 0
        } else {
          this.category3Id = categoryId
          // 请求获取分页列表数据
          this.getSpuList()
        }
      },
      // 异步获取数据列表
      async getSpuList(page=1){
        this.page = page
        const {limit, category3Id} = this
        const result = await this.$API.spu.getList (page, limit, category3Id)
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
        this.getSpuList(1)
      }
    },

    components: {
      SpuForm,
      SkuForm
    }
  }
</script>
