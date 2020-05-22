// SPU接口请求函数
import request from '@/utils/request'
export default {

  // 获取所有销售属性列表
  // GET /admin/product/baseSaleAttrList
  getSaleList(){
    return request('/admin/product/baseSaleAttrList')
  },
  // 删除spu列表
  // DELETE /admin/product/deleteSpu/{spuId}
  remove(spuId){
    return request.delete(`/admin/product/deleteSpu/${spuId}`)
  },
  // 获取指定ID的spu信息
  // GET /admin/product/getSpuById/{spuId}
  get (id) {
    return request.get(`/admin/product/getSpuById/${id}`)
  },
  // 保存或更改spu
  // POST /admin/product/saveSpuInfo
  // POST /admin/product/updateSpuInfo
  addUpdate(spuInfo){
    return request.post(`/admin/product/${spuInfo.id?'update':'save'}SpuInfo`, spuInfo)
  },
  // 获取指定分页的spu列表
  // GET /admin/product/{page}/{limit}
  getList(page, limit, category3Id){
    return request(`/admin/product/${page}/${limit}`, {params: {category3Id}})
  }
}
