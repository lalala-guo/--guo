<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange" />
    </el-card>
    <el-card>
      <div v-show="isShowList">
        <el-button type="primary" icon="el-icon-plus" style="margin-bottom: 20px" @click="showAdd"> 添加属性</el-button>
        <!-- 将数据传递过来  :data="attrs"   -->
        <el-table border :data="attrs">
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column label="属性名称" width="150" prop="attrName"></el-table-column>

          <el-table-column label="属性值列表">
            <template slot-scope="{row,$index}">
              <el-tag type="info" v-for="value in row.attrValueList" :key="value.id">{{value.valueName}}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150">
            <template slot-scope="{row,$index}">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-show="!isShowList">
        <el-form :inline="true" :model="attr" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input v-model="attr.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus">添加属性值</el-button>
        <el-button @click="isShowList=true">取消</el-button>

        <el-table border style="margin: 20px 0">
          <el-table-column label="序号" width="180">
          </el-table-column>
          <el-table-column  label="属性值名称" width="180">
          </el-table-column>
          <el-table-column label="操作">
          </el-table-column>
        </el-table>
        <el-button type="primary">保存</el-button>
        <el-button @click="isShowList=true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'AttrList',
    data() {
      return {
        category1Id: '',
        category2Id: '',
        category3Id: '',
        attrs: [],
        isShowList: true, //  是否显示属性列表页面   true: 列表页面, false: 添加或更新页面
        attr: { // 要添加或者修改的平台属性对象
          attrName: '', // 属性名
          attrValueList: [], //属性值的列表
          categoryId: '', // 3级的分类ID
          categoryLevel: 3, // 只能是3级
        }
      }
    },
    mounted() {
      this.category1Id = 2
      this.category2Id = 13
      this.category3Id = 61
      this.getAttrs()
      // this.$API.attr.getList(2,13,61)
    },
    methods: {
      // 显示添加的页面
      showAdd() {
        this.isShowList = false
      },
      handleCategoryChange({
        categoryId,
        level
      }) {
        if (level === 1) {
          this.category1Id = categoryId
        } else if (level === 2) {
          this.category2Id = categoryId
        } else {
          this.category3Id = categoryId
        }
        this.getAttrs()
      },
      // 获取数据列表
      async getAttrs() {
        // 获取数据
        const {
          category1Id,
          category2Id,
          category3Id
        } = this
        const result = await this.$API.attr.getList(category1Id, category2Id, category3Id)
        this.attrs = result.data
      }
    }
  }
</script>

<style scoped>
  .edit-input {
    padding-right: 60px;
  }

  .save-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }
</style>
