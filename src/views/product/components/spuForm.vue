<template>
  <div>
    <el-form label-width="100px" v-show="visible">
      <el-form-item label="SPU名称">
        <el-input type="text" placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <!-- 收集商品id  跟trademarkList关联 -->
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option :label="tm.tmName" :value="tm.id" v-for="tm in trademarkList" :key="tm.id"></el-option>
          <!-- <el-option label="B" value='2' ></el-option> -->
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述">
        <el-input type="textarea" placeholder="SPU描述" rows="4" v-model="spuInfo.description"></el-input>
      </el-form-item>

      <el-form-item label="SPU图片">
         <!-- multiple  支持一次上传多个 -->
        <el-upload
           multiple
          :file-list="spuImageList"
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess">
          <i class="el-icon-plus"></i>
          <!-- <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select v-model="attrIdAttrName" :placeholder="unUsedSaleAttrList.length > 0 ? `还有${unUsedSaleAttrList.length}个可以使用` : '没有啦'" value="">
          <el-option :label="item.name" :value="item.id + ':' + item.name" v-for="item in unUsedSaleAttrList" :key="item.id"></el-option>
          <!-- <el-option label="B" value='2' ></el-option> -->
        </el-select>
        <el-button type="primary" icon="el-icon-plus" @click="addSpuSaleAttr"
        :disabled="!attrIdAttrName">添加销售属性</el-button>

        <el-table
          style="margin-top: 20px"
          border
          :data="spuInfo.spuSaleAttrList"
          >
        <!-- 序号列 -->
        <el-table-column
          label="序号"
          type="index"
          width="80"
          align="center">
        </el-table-column>

        <el-table-column label="属性名" prop="saleAttrName" width="150px">
        </el-table-column>
        <el-table-column label="属性值名称列表">
          <template slot-scope="{row, $index}">
            <el-tag
              v-for=" (value, index) in row.spuSaleAttrValueList"
              :key="value.id"
              closable
              :disable-transitions="false"
              @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
              {{value.saleAttrValueName}}
            </el-tag>
            <el-input
              style="width: 100px"
              placeholder="请输入名称"
              v-if="row.edit"
              v-model="row.saleAttrValueName"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm(row)"
              @blur="handleInputConfirm(row)"
            >
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ 添加</el-button>
          </template>
        </el-table-column>

        <el-table-column prop="address" label="操作" width="150px">
          <template slot-scope="{row, $index}">
              <!--  @onConfirm   确认删除事件   -->
              <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="spuInfo.spuSaleAttrList.splice($index,1)" >
                <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini"
                  >删除</el-button>
                  <!-- @click="spuInfo.spuSaleAttrList.splice($index,1)" -->
                <!-- <el-button slot="reference">删除</el-button> -->
              </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="back">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    // prop接收子组件的visible
    props: {
      visible: Boolean
    },
    data () {
      return {
        dialogImageUrl: '',
        dialogVisible: false,

        spuId: '', // 当前要更新的spuInfo的id
        spuInfo: {
          spuName: '',
          description: '',
          tmId: '',
          spuSaleAttrList: [], // 必须有初始空数组   对象形式: { baseSaleAttrId:1, id:686, saleAttrName:"选择颜色", spuId:154 }
          spuImageList: [], // spu销售属性的数组
        }, // 当前SpuInfo对象
        spuImageList: [], // Spu的图片列表
        trademarkList: [], //品牌列表
        saleAttrList: [], //销售属性列表  baseSaleAttrId:1  id:538  isChecked:null saleAttrName:"选择颜色"  saleAttrValueName:"红"  spuId:154
        attrIdAttrName:''  //收集销售属性选框内的值
      }
    },
    computed:{
      // 计算销售属性的显示个数
      unUsedSaleAttrList(){
        // 过滤销售属性列表中的属性  并与里面的值进行对比是否一样
        return this.saleAttrList.filter(
          attr => this.spuInfo.spuSaleAttrList.every(
            spuAttr => spuAttr.saleAttrName!==attr.name
          )
        )
      }
    },
    methods: {

      // 保存
     async save () {
         // 取出请求需要的数据, 并做必要的整理工作
          const {spuInfo, spuImageList} = this

          // 整理1: 处理spuImageList属性   当前: spuInfo中的spuImageList属性值为null
          /*
            已有图片对象
                {
                    id:1224
                    imgName:"O1CN01N5IsrF29zFm3vQZpT_!!1714128138.jpg"
                    imgUrl:"http://182.92.128.115:8080/xxx.jpg"
                    spuId:154,
                    name: 'O1CN01N5IsrF29zFm3vQZpT_!!1714128138.jpg',
                    url: 'http://182.92.128.115:8080/xxx.jpg'
                }
            新上传图片的结构:
                  {
                      name: 'fa6e854a56ff9b46.png',
                      url: 'blob:http://localhost:9529/0b11fe66-1f6a-432d-b327-e48745825a8c',
                      response: {
                          data: 'http://182.92.128.115:8080/xxx.png'
                      }
                  }
            提交请求需要的图片对象的结构:
                  {
                    "imgName": "下载 (1).jpg",
                    "imgUrl": "http://47.93.148.192:8080/xxx.jpg"
                  }
          */
        //  ({})   返回的是一个对象形式
        spuInfo.spuImageList = spuImageList.map(item => ({
          imgName: item.name,
          imgUrl: item.response ? item.response.data : item.url
        }))

         // 整理2: 处理spuSaleAttrList属性
         /*
          1. 删除不必要的参数数据: 数组元素对象(属性对象)很可能有2个不必要的数据
          2. 过滤掉没有一个属性值对象的属性
          */
        spuInfo.spuSaleAttrList = spuInfo.spuSaleAttrList.filter((attr) => {
          // 删除
          delete attr.edit  // 编辑模式
          delete attr.saleAttrValueName
          // return 含有属性值对象的属性
          return attr.spuSaleAttrValueList.length>0
        })

         // 发送保存SPU详情信息的异步ajax请求
          const result = await this.$API.spu.addUpdate(spuInfo)
          if (result.code===200) {
              // const spuInfo = result.data.records
              // 成功  提示
              this.$message.success('保存SPU成功')

              // 重置当前组件的数据
              this.resetData()
              // 回到列表页面
              this.$emit('update:visible', false)
              // 通知父组件保存成功
              this.$emit('saveSuccess')

          } else {
            // 失败提示
            this.$message.error('保存SPU失败')
          }

      },
      /*
      重置当前组件的数据
      */
      resetData () {
        this.dialogImageUrl = ''
        this.dialogVisible = false

        this.spuId = null
        this.spuInfo = {
          category3Id: '',
          spuName: '',
          description: '',
          tmId: '',
          spuImageList: [],
          spuSaleAttrList: []
        }
        this.spuImageList = []
        this.trademarkList = []
        this.saleAttrList = []
        this.attrIdAttrName = ''
      },

      handleInputConfirm (spuSaleAttr) {
        const {saleAttrValueName, baseSaleAttrId} = spuSaleAttr
      // 判断saleAttrValueName是否有值
        if(!saleAttrValueName) {
          // 如果没有值 就变为查看模式  并return
          spuSaleAttr.edit = false
          return
        }
      // 判断新添加的属性是否已存在
        const isRepeat = spuSaleAttr.spuSaleAttrValueList.some(value => value.saleAttrValueName===saleAttrValueName)
        if (isRepeat) {
          // 重复
          this.$message.warning('输入的属性已存在')
          return
        }
        spuSaleAttr.spuSaleAttrValueList.push({
          saleAttrValueName,
          baseSaleAttrId
        })
        spuSaleAttr.edit = false
        spuSaleAttr.saleAttrValueName = ''
      },
      // 显示输入框
      showInput (spuSaleAttr){
        // 判断spuSalieAttr是否含有edit属性
        if (spuSaleAttr.hasOwnProperty('edit')) {
          // 有就改为true
          spuSaleAttr.edit = true
        } else {
          // 没有就通过$set添加edit属性
          this.$set(spuSaleAttr, 'edit', true)
        }
        // 自动获取焦点
        this.$nextTick(() => this.$refs.saveTagInput.focus())
      },

      // 添加新的spu销售属性
      addSpuSaleAttr(){
        // 将attrIdAttrName通过:分隔开并解构赋值
        const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split(':')
        this.spuInfo.spuSaleAttrList.push({
            baseSaleAttrId,
            saleAttrName,
            spuSaleAttrValueList: []
        })
        this.attrIdAttrName = ''
      },

      // 由父组件调用的方法   请求加载相关数据
      initLoadAddData(category3Id){
         // 保存到spuInfo中
        this.spuInfo.category3Id = category3Id
        // 3. 获取所有品牌的列表
        this.getTrademarkList()
        // 4. 获取所有销售属性(id/name)列表
        this.getSaleAttrList()
      },

      // 根据id获取相关数据
      initLoadUpdateData (spuId){
        // 保存skuId
        this.spuId = spuId
        // 1. 根据SPU的id获取SPU的详情信息
        this.getSpuInfo()
        // 2. 根据SPU的id获取SPU的图片列表
        this.getSpuImageList()
        // 3. 获取所有品牌的列表
        this.getTrademarkList()
        // 4. 获取所有销售属性(id/name)列表
        this.getSaleAttrList()
      },
      // 根据SPU的id获取SPU的详情信息
      async getSpuInfo () {
        const result = await this.$API.spu.get(this.spuId)
        this.spuInfo = result.data
      },

      async getSpuImageList () {
        const result = await this.$API.sku.getSpuImageList(this.spuId)
        const spuImageList = result.data
        // 遍历spuImageList  将其内部属性和需要的属性关联 一样
        spuImageList.forEach(item => {
          item.name = item.imgName
          item.url = item.imgUrl
        })
        // 保存图片列表
        this.spuImageList = spuImageList
      },

      async getTrademarkList () {
        const result = await this.$API.trademark.getList()
        this.trademarkList = result.data
      },

      async getSaleAttrList () {
        const result = await this.$API.spu.getSaleList()
        this.saleAttrList = result.data
      },

      /*
      上传图片成功后的回调函数
      response: 响应体数据对象, 对应的是axios中的response.data
      file: 新上传成功的图片对象
      fileList: 所有图片对象的数组
      */
      handleSuccess (response, file, fileList) {
        console.log('handleSuccess', response, file, fileList)
        // 将已上传图片对象的列表保存起来
        this.spuImageList = fileList
      },
      handleRemove(file, fileList) {
        console.log(file, fileList)
        // 将已上传图片对象的列表保存起来
        this.spuImageList = fileList
      },
      /*
      用来显示大图dialog的回调函数
      file: 点击的图片信息对象
      */
      handlePictureCardPreview(file) {
        // 保存要显示大图的url
        this.dialogImageUrl = file.url
        // 显示大图dialog
        this.dialogVisible = true
      },

      // 返回
      back () {
        // 重置数据
        this.resetData()
        // 分发自定义事件,关闭当前spuForm页面
        this.$emit('update:visible', false)
        // 分发自定义事件, 通知父组件当前组件取消了操作
        this.$emit('cancel')
      }
    }
  }
</script>

<style>

</style>
