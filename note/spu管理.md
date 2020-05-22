## SPU与SKU
  1. SPU: 某个商品所有相关信息的集合, 包括所有可选择的图片, 可选择的平台属性与销售属性
  2. SKU: SPU下确定了图片列表/平台属性与销售属性数据的信息集合, 商品唯一标识
  - 一个SPU可以对应多个SKU

## 平台属性与销售属性
  1. 平台属性: 用于(出现)商品搜索的商品描述信息, 包含属性名与一系列的属性值
  2. 销售属性: 出现在商品详情界面的商品描述信息, 包含属性名与一系列的属性值

## SPU管理
  - 定义接口请求函数
  - 静态页面使用了element-ui的card, button, table, pagination  还用到了封装的categorySelector
  - 交互
    - spuForm 和 skuForm组件作为spu管理的子组件, 通过isShowSpuForm以及isShowSkuForm来控制spuForm和skuForm的显示与隐藏, 在点击返回按钮时, 需要通过子组件向父组件通信来更改isShowSpuForm的值, 用到了.sync
      - 例: ==>  :visible.sync="isShowSpuForm" 相当于 @update:visible = "isShowSpuForm = $evnent"
      - 当不用强制数据绑定,即不加:时 ==> visible.sync="isShowSpuForm" 传入的就是个字符串, 不加sync时会报错,因为在接收时visible指定的是Boolean类型的值, 但是加上.sync就不会报错,并自动将字符串转为false,因为.sync默认右侧是传入的布尔值, 
    - 子组件向父组件通信 / 子组件更新父组件的数据
        - 函数属性
        - vue自定义事件
        - v-model
        - .sync
        - $parent
    
    - 显示修改SPU的界面发送的请求
      - 根据SPU的id获取SPU的详情信息    => spu.get(skuId)
      - 根据SPU的id获取SPU的图片列表    => sku.getSpuImageList(skuId)
      - 获取所有品牌的列表              => trademark.getList(skuId)
      - 获取所有销售属性(id/name)列表   => spu.getSaleList(skuId)
    
    - 父组件通知子组件发请求
      - 利用ref技术: 通过ref得到子组件对象, 进而调用其方法同时传递数据 