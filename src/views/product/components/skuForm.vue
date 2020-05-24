<template>
  <div>
    <el-form ref="form"  label-width="120px">
      <el-form-item label="SPU名称"></el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称"></el-input>
      </el-form-item>
      <el-form-item label="价格">
        <el-input placeholder="SKU价格"></el-input>
      </el-form-item>
      <el-form-item label="重量(KG)">
        <el-input placeholder="SKU重量"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input type="textarea" rows="4" placeholder="SKU规格描述"></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form>
          <el-form-item >
            <el-select  value="" multiple placeholder="请选择">
              <el-option value=""></el-option>
            </el-select>

            <el-select value="" multiple collapse-tags style="margin-left: 20px;" placeholder="请选择">
              <el-option value=""></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form>
          <el-form-item  label="选择颜色">
            <el-select  value="" multiple placeholder="请选择">
              <el-option value=""></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item  label="图片列表">
        <template>
          <el-table
            border
            ref="multipleTable"
            tooltip-effect="dark"
            style="width: 100%"
            >
            <!-- :data="tableData" -->
            <!-- @selection-change="handleSelectionChange" -->
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              label="图片"
             >
              <template slot-scope="scope">{{ scope.row.date }}</template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              >
            </el-table-column>
            <el-table-column
              prop="address"
              label="操作"
              show-overflow-tooltip>
              <hint-button type="primary" icon="el-icon-edit"></hint-button>
            </el-table-column>
          </el-table>
        </template>
      </el-form-item>
      <el-form-item >
        <el-button type='primary'>保存</el-button>
        <el-button @click="back">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  methods:{
    back(){
      this.$emit('update:visible', false)
    },
  }
}
</script>

<style>

</style>
