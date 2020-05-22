<template>
  <div>
    <el-card>
      <CategorySelector ref="cs" @categoryChange="handleCategoryChange"/>
    </el-card>
    <el-card>
      <div v-show="isShowList">
        <el-button type="primary" icon="el-icon-plus" style="margin-bottom: 20px"
          @click="showAdd" :disabled="!category3Id">添加属性</el-button>
        <!-- 将数据传递过来  :data="attrs"   -->
        <el-table border :data="attrs">
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column label="属性名称" width="150" prop="attrName"></el-table-column>

          <el-table-column label="属性值列表">
            <template slot-scope="{row, $index}">
              <el-tag style="margin: 2px" type="info" v-for="value in row.attrValueList" :key="value.id">{{value.valueName}}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150">
            <template slot-scope="{row, $index}">
              <HintButton title="修改" type="primary" icon="el-icon-edit" size="mini"
                @click="showUpdate(row)"></HintButton>
              <el-popconfirm
              :title="`确定删除属性 ${row.attrName} 吗?`"
              @onConfirm="deleteAttr(row.id)">
                <HintButton slot="reference" title="删除" type="danger" icon="el-icon-delete" size="mini"></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-show="!isShowList">
        <el-form inline :model="attr">
          <el-form-item label="属性名">
            <el-input type="text" v-model="attr.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus"
        :disabled="!attr.attrName" @click="addAttrValue">添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>

        <el-table border style="margin: 20px 0" :data="attr.attrValueList">
          <el-table-column label="序号"  type="index" width="80" align="center"></el-table-column>
          <el-table-column label="属性值名称">
            <template slot-scope="{row, $index}">
              <!-- keyup.enter  是自定义事件  要使用原生的事件  添加.native -->
              <el-input :ref="$index" v-if='row.edit' placeholder="输入属性值按enter键添加" v-model="row.valueName" size="mini"
                @blur="toShow(row)" @keyup.enter.native="toShow(row)"></el-input>
              <span v-else @click="toEdit(row,$index)" style="display: inline-block; width: 100%;">{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row, $index}">
              <el-popconfirm
                :title="`确定删除 '${row.valueName}' 吗`"
                @onConfirm="attr.attrValueList.splice($index, 1)">
                <HintButton slot="reference" title="删除" type="danger" icon="el-icon-delete" size="mini"></HintButton>
              </el-popconfirm>

            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="preserve"  :disabled="!attr.attrName || attr.attrValueList.length === 0" >保存</el-button>
        <el-button @click="isShowList=true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
  import cloneDeep from 'lodash/cloneDeep'
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
      // this.getAttrs()
    },
    watch: {
    // 当isShowList发生改变时执行处理: 更新cs组件的disabled状态数据
    isShowList (value) {
      this.$refs.cs.disabled = !value
    }
  },
    methods: {
      /*
    删除指定的属性
    */
    deleteAttr (id) {
      // 请求删除
      this.$API.attr.remove(id).then(result => {
        // 重新获取列表显示
        this.getAttrs()
      }).catch(error => {
        this.$message.error('删除属性失败')
      })
    },
      async preserve() {
        const attr = this.attr
        // 添加的属性值不能为空
        attr.attrValueList = attr.attrValueList.filter(value => {
          if(value.valueName !== ''){
            delete value.edit
            return true
          }
        })
        // 属性值至少要有一个
        if(attr.attrValueList.length === 0){
          this.$message.warning('至少指定一个属性值名称')
          return
        }
        const result = await this.$API.attr.addOrUpdate(attr)
        if(result.code === 200){
          this.$message.success('保存属性成功')
          this.isShowList = true
          this.getAttrs()
        }else{
          this.$message.error('保存属性失败')
        }
      },
      toEdit(value,index) {
        // 如果value已经有edit属性, 该为true
        if (value.hasOwnProperty('edit')) {
          value.edit = true
        } else {
          // 如果没有,通过$set添加一个edit属性, 并为true
          this.$set(value, 'edit', true)
        }
        this.$nextTick(() => {
          this.$refs[index].focus()
        })
      },
      toShow(value) {
        // 判断输入框是否已经输入了属性值 才可以添加
        if (value.valueName) {
          //在属性值列表中查找没有此属性值的项才可以
          const isRepeat = this.attr.attrValueList.some(item => {
            if (item !== value) {
              return item.valueName === value.valueName
            }
          })
          if (!isRepeat) {
            // 如果没有就添加edit为false
            value.edit = false
          } else {
            // 如果有就清除输入  并提示
            value.valueName = ''
            this.$message.warning('输入的名称已存在')
          }
        }
      },

      // 显示添加的页面
      showAdd() {
        // 重置attr对象
        this.attr = {
          attrName: '',
          attrValueList: [],
          categoryId: this.category3Id,
          categoryLevel: 3,
        }
          this.isShowList = false
      },
      // 修改
      showUpdate(attr) {
        //保存要修改的属性对象
        // this.attr = attr
        // 此时指向的是同一个对象   当更改时,会将原本的attr里面的属性也更改,即使取消也不行
        // 要使用浅拷贝解决  即
        // this.attr = {
        //   ...attr
        // }
        //  因为attr是含有引用数据类型的对象,使用浅拷贝只能拷贝到第一层数据结构,里面的attrValueList拷贝到的值为地址
        // 所以在更改attrValueList里面的属性时,即属性值列表时, 也会将原本的数据更改,并不能取消,此时要使用深拷贝,将数据全部拷贝一份,此时更改的就为拷贝的数据,不会改变原来的数据, 也就可以取消
        // 利用lodash的cloneDeep进行深拷贝
        this.attr = cloneDeep(attr)
        // 显示更新的界面
        this.isShowList = false
      },
      addAttrValue() {
        this.attr.attrValueList.push({
          attrId: this.attr.id, // 如果是修改属性有值, 如果是添加属性就是undefined
          valueName: '',
          edit: true // 添加的新属性值是编辑模式的
        })
        this.$nextTick(() => {
          this.$refs[this.attr.attrValueList.length - 1].focus()
        })
      },

      handleCategoryChange({
        categoryId,
        level
      }) {
        if (level === 1) {
          this.category1Id = categoryId
          this.category2Id = ''
          this.category3Id = ''
          this.attrs = []
        } else if (level === 2) {
          this.category2Id = categoryId
          this.category3Id = ''
          this.attrs = []
        } else {
          this.category3Id = categoryId
          this.getAttrs()
        }
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
