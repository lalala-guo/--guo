<template>
  <el-form  label-width="80px" v-show="visible">
      <!-- SPU名称 -->
    <el-form-item label="SPU名称" >
      <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
    </el-form-item>

      <!-- 品牌 -->
    <el-form-item label="品牌">
      <el-select placeholder="请选择品牌" v-model="spuInfo.tmId" >
        <el-option :label="item.tmName" :value="item.id" v-for="item in trademarkList" :key="item.id"></el-option>
      </el-select>
    </el-form-item>

      <!-- SPU描述 -->
    <el-form-item label="SPU描述">
      <el-input type="textarea" rows="4"  placeholder="SPU描述" v-model="spuInfo.description"></el-input>
    </el-form-item>

      <!-- SPU图片 multiple 一次上传多个   -->
    <el-form-item label="SPU图片">
      <el-upload
        multiple
        :file-list="spuImageList"
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        >
        <!-- :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove" -->
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <!-- :visible.sync="dialogVisible" -->
        <img width="100%" :src="dialogImageUrl" alt="">
        <!-- :src="dialogImageUrl" -->
      </el-dialog>
    </el-form-item>

      <!-- 销售属性 -->
    <el-form-item label="销售属性">
      <el-select value="" :placeholder="unUsedSaleAttrList.length > 0 ? `还有${unUsedSaleAttrList.length}个可以使用` : '没有啦'" v-model="attrIdAttrName">
        <el-option  :label="item.name" :value="item.id + ':' + item.name" v-for="item in unUsedSaleAttrList" :key="item.id"></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-plus" :disabled="!attrIdAttrName" @click="addSpuSaleAttr">添加销售属性</el-button>
    </el-form-item>

    <el-form-item >
        <template>
          <el-table border :data="spuInfo.spuSaleAttrList" >

            <el-table-column type="index" label="序号" width="80" align="center" ></el-table-column>

            <el-table-column prop="saleAttrName" label="属性名"></el-table-column>

            <el-table-column prop="name" label="属性值" >
              <template slot-scope="{row, $index}">
                <!-- edit  编辑模式下有edit属性 -->
                <el-tag
                  v-for="(item, index) in row.spuSaleAttrValueList"
                  :key="item.id"
                  closable
                  :disable-transitions="false"
                  @close="row.spuSaleAttrValueList.splice(index, 1)">{{item.saleAttrValueName}}</el-tag>
                <el-input
                  ref="input"
                  v-if="row.edit"
                  v-model="row.saleAttrValueName"
                  placeholder="请输入名称" size="small" style="width:100px;"
                  @keyup.enter="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"></el-input>
                <el-button v-else icon="el-icon-plus" size="mini" @click="showInput(row)">添加</el-button>
              </template>
            </el-table-column>

            <el-table-column label="操作">
              <template slot-scope="{row, $index}">
                <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="spuInfo.spuSaleAttrList.splice($index, 1)">
                  <!-- <el-button slot="reference">删除</el-button> -->
                  <hint-button slot="reference" type="danger" icon="el-icon-delete">删除</hint-button>
                </el-popconfirm>
                </template>
            </el-table-column>

          </el-table>
        </template>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="back">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name:"SpuForm",
  props:{
    visible:Boolean
  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,

      spuInfo:{
        category3Id:'',
        description:"",
        spuImageList: [],
        spuName:"",
        spuSaleAttrList: [], // 添加的销售属性列表
        tmId:""
      },
      attrIdAttrName:'', //销售属性选择的id和name 通过:连接

      trademarkList:[], // 品牌数据列表
      spuImageList:[], // spu的图片列表
      saleAttrList:[], //销售属性列表
    }
  },

  computed:{
    // 计算销售属性的显示个数
    unUsedSaleAttrList(){
      // 过滤销售属性列表 saleAttrList 中的属性  并与spuInfo.spuSaleAttrList里面的值进行对比是否一样
      return this.saleAttrList.filter(attr => this.spuInfo.spuSaleAttrList.every(
        spuAttr => spuAttr.saleAttrName!==attr.name
      ))
    }
  },
  methods:{
     // 保存
      async save(){
        // 将获取的spuInfo的数据以及spuImageList的数据取出
        const { spuInfo, spuImageList} = this
        // 保存spuImageList的数据  因为原有的数据和要提交的数据不同,所以要整理
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

        spuInfo.spuImageList = spuImageList.map(item => ({
            imgName: item.name,
            imgUrl: item.response.data
        }))
        // 处理spuSaleAttrList属性  删除不必要的参数数据(edit saleAttrValueName), 过滤掉没有一个属性值对象的属性
        spuInfo.spuSaleAttrList = spuInfo.spuSaleAttrList.filter(item => {
          delete item.edit
          delete item.saleAttrValueName
          return item.spuSaleAttrValueList.length>0
        })

        // 发送异步请求 保存数据
        const result = await this.$API.spu.addUpdate(spuInfo)
        if(result.code === 200){
          // 成功提示
          this.$message.success('保存成功')
          // 重置当前组件的数据
          this.resetData()
          // 回到列表页面
          this.$emit('update:visible', false)
          // 通知父组件保存成功
          this.$emit('saveSuccess')
        }
      },
      resetData(){
        this.dialogImageUrl =  '',
        this.dialogVisible = false,

        this.spuInfo = {
          category3Id:'',
          description:"",
          spuImageList: [],
          spuName:"",
          spuSaleAttrList: [], // 添加的销售属性列表
          tmId:""
        },
        this.attrIdAttrName = '', //销售属性选择的id和name 通过:连接

        this.trademarkList = [], // 品牌数据列表
        this.spuImageList = [], // spu的图片列表
        this.saleAttrList = [] //销售属性列表
      },

      // spuSaleAttrList
      handleInputConfirm(spuSaleAttr){
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
      showInput(spuSaleAttr){
        // 判断spuSaleAttr是否有edit属性  有就更改为true 没有就添加
        if(spuSaleAttr.hasOwnProperty('edit')){
          spuSaleAttr.edit = true
        }else{
          this.$set(spuSaleAttr, 'edit', true)
        }
        // 自动获取焦点
        this.$nextTick(() => this.$refs.input.focus())
      },

      // 添加销售属性列表
      addSpuSaleAttr(){
        // 将选择的销售属性的id和name通过:拆分,并解构赋值获取
        // 并添加  push到spuInfo的spuSaleAttrList中  并将获取的attrIdAttrName置成空串
        const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split(':')
        this.spuInfo.spuSaleAttrList.push({
          baseSaleAttrId,
          saleAttrName,
          spuSaleAttrValueList: []  //添加属性的数组
        })
        this.attrIdAttrName = ''
      },

      // 异步获取trademarkList
      async getTrademarkList(){
        const result = await this.$API.trademark.getList()
        if(result.code === 200){
          this.trademarkList = result.data
        } else {
          this.$message.error('获取trademarkList失败')
        }
      },
      async getSaleAttrList(){
        const result = await this.$API.spu.getSaleList()
        if(result.code === 200){
          this.saleAttrList = result.data
        }
      },

      async getSpuImageList(){
        const result = await this.$API.sku.getSpuImageList(this.spuId)
        const spuImageList = result.data
        // 遍历 将里面的属性关联
        spuImageList.forEach(item => {
          item.name = item.imgName
          item.url = item.imgUrl
        })
        // 保存spuImageList
        this.spuImageList = spuImageList
      },

      async getSpuInfo(){
        const result = await this.$API.spu.get(this.spuId)
        this.spuInfo = result.data
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

      // 点击添加属性 调用方法 发送请求
      initLoadAddData(category3Id){ //接收参数category3Id
        // 保存
        this.spuInfo.category3Id = category3Id
        // getTrademarList
        this.getTrademarkList()
        // baseSaleAttrList
        this.getSaleAttrList()

      },
      // 显示大图
      handlePictureCardPreview(file) {
          // 保存要显示大图的url
          this.dialogImageUrl = file.url
          // 显示大图dialog
          this.dialogVisible = true
        },
      handleSuccess (response, file, fileList) {
          // console.log('handleSuccess', response, file, fileList)
          // 将已上传图片对象的列表保存起来
          this.spuImageList = fileList
        },
        handleRemove(file, fileList) {
          console.log(file, fileList)
          // 将已上传图片对象的列表保存起来
          this.spuImageList = fileList
        },

      back(){
        this.$emit("update:visible", false)
      }
  }
}
</script>

<style lang="less" scoped>

</style>
