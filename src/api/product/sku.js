// sku几口请求函数

import request from '@/utils/request'
export default {

  //下架sku
  // GET /admin/product/cancelSale/{skuId}
  cancelSale(skuId){
    return request(`/admin/product/cancelSale/${skuId}`)
  },

  // 上架sku
  // GET /admin/product/onSale/{skuId}
  onSale(skuId){
    return request(`/admin/product/onSale/${skuId}`)
  },

  //删除指定id的sku数据
  // DELETE /admin/product/deleteSku/{skuId}
  remove(skuId){
    return request.delete(`/admin/product/deleteSku/${skuId}`)
  },

  // 查找指定id的sku列表
  // GET /admin/product/findBySpuId/{spuId}
  getListBySpuId(spuId){
    return request(`/admin/product/findBySpuId/${spuId}`)
  },
  // 根据id获取sku的详细信息
  // GET /admin/product/getSkuById/{skuId}
  get(skuId){
    return request(`/admin/product/getSkuById/${skuId}`)
  },

  //
  // GET /admin/product/list/{page}/{limit}
  getList(page, limit){
    return request(`/admin/product/list/${page}/${limit}`)
  },
  // 保存或更新skuInfo
  // POST /admin/product/updateSkuInfo
  // POST /admin/product/saveSkuInfo
  addUpdate(skuInfo){
    return request(`/admin/product/${skuInfo.id?'update':'save'}SkuInfo`)
  },
  //获取指定id的图片列表
  // GET /admin/product/spuImageList/{spuId}
  getSpuImageList (spuId) {
    return request.get(`/admin/product/spuImageList/${spuId}`)
  },

  //获取指定id的spu销售属性
  // GET /admin/product/spuSaleAttrList/{spuId}
  getSpuSaleAttrList(spuId){
    return request(`/admin/product/spuSaleAttrList/${spuId}`)
  }

}

