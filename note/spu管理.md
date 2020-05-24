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
    
    - 父组件更新子组件的数据
        - props
        - ref
        - $children
    
    - 显示修改SPU的界面发送的请求
      - 根据SPU的id获取SPU的详情信息    => spu.get(skuId)
      - 根据SPU的id获取SPU的图片列表    => sku.getSpuImageList(skuId)
      - 获取所有品牌的列表              => trademark.getList(skuId)
      - 获取所有销售属性(id/name)列表   => spu.getSaleList(skuId)
    
    - 父组件通知子组件发请求
      - 利用ref技术: 通过ref得到子组件对象, 进而调用其方法同时传递数据
    
    - 显示修改SPU的界面发送哪些请求:
      - 根据SPU的id获取SPU的详情信息
      - 根据SPU的id获取SPU的图片列表
      - 获取所有品牌的列表
      - 获取所有销售属性(id/name)列表
    - 显示初始请求的数据
        - 品牌列表: trademarkList 和 spuInfo.tmId   ==> 简单
        - SPU图片列表: spuImageList
            - 现有数据结构:
                ```js
                  {
                      id:1224
                      imgName:"O1CN01N5IsrF29zFm3vQZpT_!!1714128138.jpg"
                      imgUrl:"http://182.92.128.115:8080/xxx.jpg"
                      spuId:154
                  }
                ```
            - 要求的数据结构:
                ```js
                  {
                     name: 'food.jpg', 
                     url: 'https://xxx.cdn.com/xxx.jpg'
                  }
                ```
            - 需要对数据进行整理:给数组元素对象添加name和url属性
              - 注意: 开发中请求获取的数据不能直接显示, 而需要进行特定处理/整理之后才能显示
      - spu销售属性列表: spuInfo.spuSaleAttrList数组
          ```js
            {
                "id": 133,
                "spuId": 26,
                "baseSaleAttrId": 2,
                "saleAttrName": "选择版本",
                "spuSaleAttrValueList": [
                    {
                        "id": 225,
                        "spuId": 26,
                        "baseSaleAttrId": 2,
                        "saleAttrValueName": "aa",
                        "saleAttrName": "选择版本",
                        "isChecked": null
                    },
                ],
                // 添加的属性
                edit: false/true,
                saleAttrValueName: 'xxx'
            }
          ```
      - 还没使用的销售属性名列表: saleAttrList 与 spuInfo.spuSaleAttrList
        - 根据这2个计算产生: 过滤saleAttrList, 找出所有在spuSaleAttrList中还没有用到的
      - 收集数据
        - 图片数据收集: spuImageList
          - 已有图片对象
            ```js
            {
                id:1224
                imgName:"O1CN01N5IsrF29zFm3vQZpT_!!1714128138.jpg"
                imgUrl:"http://182.92.128.115:8080/xxx.jpg"
                spuId:154,
                name: 'O1CN01N5IsrF29zFm3vQZpT_!!1714128138.jpg',
                url: 'http://182.92.128.115:8080/xxx.jpg'
            }
            ```
          - 新上传图片的结构:
            ```js
            {
                name: 'fa6e854a56ff9b46.png',
                url: 'blob:http://localhost:9529/0b11fe66-1f6a-432d-b327-e48745825a8c',
                response: {
                    data: 'http://182.92.128.115:8080/xxx.png'
                }
            }
            ```

      - 销售属性数据收集:
        - 添加spu销售属性: 
            - 向数组中添加数据: spuInfo.spuSaleAttrList
            - 添加的数据的结构: 
                ```js
                {
                    "baseSaleAttrId": "1",
                    "saleAttrName": "选择颜色",
                    "spuSaleAttrValueList": []
                }
                ```
        - 添加spu销售属性值: 
            - 最终目标: 向spuSaleAttr.spuSaleAttrValueList中添加一个spu销售属性值对象
                ```js
                {
                    "saleAttrValueName": "a",  // 输入的
                    "baseSaleAttrId": "1" // 销售属性的id
                }
                ```
            - 查看模式与编辑模式:
                - 标识: edit: true/false
                - 输入的属性值名称: saleAttrValueName
                - 将这2个数据保存在spu的销售属性对象(row)上
            - 从查看模式切换到编辑械
                - 给当前行的属性对象添加edit属性: $set()
                - 输入框自动获得焦点: $nextTick()
            - 确定添加spu销售属性值对象
                - 必须输入的内容
                - 不能与已有的重复

        - 删除spu销售属性值
        - 删除spu销售属性

      - 提交添加/更新SPU的请求
          - 收集整理请求参数数据
              - 整理1: spu图片列表中图片对象的结构不对, 利用map方法生成满足要求的图片数据对象
              - 整理2: spu销售属性列表中的属性对象包含一些没必要的属性, 没有一个属性值名称的属性应该过滤掉
              - 发送ajax请求
