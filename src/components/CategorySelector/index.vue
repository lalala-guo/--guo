<template>
  <div>
    <el-form :inline="true" :model="cForm" class="demo-form-inline">
      <el-form-item label="一级分类">
        <el-select :disabled="disabled" v-model="cForm.category1Id" placeholder="选择一级分类" @change="handleChange1">
          <el-option :label="item.name" :value="item.id" v-for="item in category1List" :key='item.id'></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="二级分类">
        <el-select :disabled="disabled" v-model="cForm.category2Id" placeholder="选择二级分类" @change="handleChange2">
          <el-option :label="item.name" :value="item.id" v-for="item in category2List" :key="item.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="三级分类">
        <el-select :disabled="disabled" v-model="cForm.category3Id" placeholder="选择三级分类" @change="handleChange3">
          <el-option :label="item.name" :value="item.id" v-for="item in category3List" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'CategorySelector',
    data(){
      return {
        disabled: false, // 下拉列表是否禁用
        cForm:{
          category1Id: '',
          category2Id: '',
          category3Id: '',
        },
        category1List:[],  //一级分类列表
        category2List:[],  //二级分类列表
        category3List:[],  //三级分类列表
      }
    },
    mounted(){
      this.getCategory1List()
    },
    methods:{
      // 首先获取以及数据列表
      async getCategory1List(){

        const result = await this.$API.category.getCategorys1()
        // if(result.code===200){
          this.category1List = result.data
        // }
      },
      async handleChange1(category1Id){
        this.cForm.category2Id = ''
        this.cForm.category3Id = ''
        this.cForm.category2List = []
        this.cForm.category3List = []

        // 分发事件  通知父组件
        // this.$emit('categoryChange',{categoryId: category1Id, level: 1})
        const result = await this.$API.category.getCategorys2(category1Id)
        this.category2List = result.data
        this.$emit('categoryChange', {categoryId: category1Id, level: 1})
      },
      async handleChange2(category2Id){
        this.cForm.category3Id = ''
        this.cForm.category3List = []
        // 分发事件  通知父组件
        // this.$emit('categoryChange',{categoryId: category2Id, level: 2})
        const result = await this.$API.category.getCategorys3(category2Id)
          this.category3List = result.data
          this.$emit('categoryChange', {categoryId: category2Id, level: 2})
      },
      handleChange3(category3Id){
        // 分发事件  通知父组件
        this.$emit('categoryChange',{categoryId: category3Id, level: 3})
      },

    }

  }
</script>

<style>

</style>
