<script lang="ts" setup>
import { onMounted, onUnmounted, ref, reactive, watch } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import type { Map, LabelsLayer, LabelMarker } from 'AMap' // 引入高德地图类型

// 1. 类型定义优化：更精准的类型约束，避免any
interface PointItem {
  cId: number
  id: number
  name: string
  x: string // 经纬度后端返回可能是字符串，前端统一转为number
  y: string
}

interface Option {
  areaId: number
  id: number
  name: string
  position: [number, number] // 明确经纬度数组类型 [lng, lat]
}

interface AreaItem {
  id: number
  name: string
  position: [number, number]
}

// 2. 状态管理优化：明确类型，避免隐式赋值
const value = ref<Option | undefined>(undefined) // 初始值明确为undefined
const options = ref<Option[]>(communityData) // 绑定下拉选项
const map = ref<Map | null>(null) // 地图实例用ref管理，更符合Vue规范
const labelLayer = ref<LabelsLayer | null>(null) // 标签层实例，方便后续操作
const markers = ref<LabelMarker[]>([]) // 标记点数组，便于销毁回收

// 3. 数据优化：抽离常量，经纬度统一转为number类型（避免字符串类型问题）
const communityData: Option[] = [
  {
    areaId: 1,
    id: 1,
    name: '左所屯',
    position: [116.162014, 40.532986],
  },
]

const areaData: AreaItem[] = [
  {
    id: 1,
    name: '永宁镇',
    position: [116.166215, 40.525038],
  },
]

const pointData: PointItem[] = [
  {
    cId: 1,
    id: 1,
    name: '5-1',
    x: '116.157566',
    y: '40.52717',
  },
  {
    cId: 1,
    id: 2,
    name: '5-2',
    x: '116.155415',
    y: '40.525596',
  },
]

// 4. 样式常量抽离：便于维护
const TEXT_STYLE = {
  fontSize: 12,
  fontWeight: 'normal' as const, // 明确类型为字符串字面量
  fillColor: '#fff',
  padding: '2, 5',
  backgroundColor: 'rgb(246,137,38)',
  borderColor: '#fff',
  borderWidth: 1,
}

// 5. 地图初始化优化：封装为独立函数，逻辑清晰
const initMap = async () => {
  try {
    const AMap = await AMapLoader.load({
      key: '7aa765f8c7dfa0f01370cb359283562e',
      version: '2.0',
      plugins: [],
    })

    // 创建地图实例
    const mapInstance = new AMap.Map('container', {
      viewMode: '3D',
      zoom: 16,
      center: [115.976807, 40.458338],
      showIndoorMap: false,
      showLabel: false,
      mapStyle: 'amap://styles/fresh',
      showLogo: false, // 直接隐藏Logo，无需额外CSS
      copyright: false, // 隐藏版权信息
    })
    map.value = mapInstance

    // 创建标签层（优化碰撞检测配置）
    const layer = new AMap.LabelsLayer({
      zooms: [3, 20],
      zIndex: 1000,
      collision: true, // 开启碰撞检测，避免标签重叠
      allowCollision: true,
    })
    labelLayer.value = layer
    mapInstance.add(layer)

    // 渲染标记点
    renderMarkers(AMap)

    return mapInstance
  } catch (error) {
    console.error('地图初始化失败：', error)
    throw error // 抛出错误，便于外部捕获处理
  }
}

// 6. 标记点渲染优化：单独封装，便于复用和维护
const renderMarkers = (AMap: typeof window.AMap) => {
  if (!labelLayer.value) return

  // 清空已有标记点（避免重复渲染）
  markers.value.forEach((marker) => marker.remove())
  markers.value = []

  // 处理经纬度：字符串转number，避免类型错误
  const processedPoints = pointData
    .map((point) => ({
      ...point,
      x: Number(point.x),
      y: Number(point.y),
    }))
    .filter((point) => !isNaN(point.x) && !isNaN(point.y)) // 过滤无效经纬度

  // 创建标记点
  const newMarkers = processedPoints.map((point) => {
    const marker = new AMap.LabelMarker({
      name: point.name,
      position: [point.x, point.y],
      text: {
        content: point.name,
        direction: 'center',
        style: TEXT_STYLE,
      },
    })
    // 可选：添加点击事件
    marker.on('click', () => {
      console.log('点击标记点：', point.name)
      map.value?.setCenter([point.x, point.y], true)
    })
    return marker
  })

  markers.value = newMarkers
  labelLayer.value.add(newMarkers)
}

// 7. 下拉选择事件优化：添加类型校验和边界处理
const handleSelect = (val: Option | undefined) => {
  if (!val || !val.position || !map.value) return

  // 校验经纬度有效性
  const [lng, lat] = val.position
  if (isNaN(lng) || isNaN(lat)) {
    console.warn('无效的坐标：', val.position)
    return
  }

  // 平滑移动到目标位置，并调整缩放级别
  map.value.setCenter([lng, lat], true)
  map.value.setZoom(17) // 选中后放大，体验更好
}

// 8. 生命周期优化：完善初始化和销毁逻辑
onMounted(() => {
  initMap()
})

onUnmounted(() => {
  // 彻底销毁地图实例，避免内存泄漏
  if (map.value) {
    map.value.destroy()
    map.value = null
  }
  // 清空标记点
  markers.value.forEach((marker) => marker.remove())
  markers.value = []
})

// 可选：监听下拉选项变化，自动更新地图中心（如果需要）
watch(
  value,
  (newVal) => {
    if (newVal) {
      handleSelect(newVal)
    }
  },
  { immediate: false },
)
</script>

<template>
  <div class="map-container">
    <!-- 下拉选择器：优化语义化和用户体验 -->
    <el-select
      @change="handleSelect"
      v-model="value"
      placeholder="请选择区域"
      class="map-select"
      style="width: 240px"
      clearable>
      <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item" />
    </el-select>
    <!-- 地图容器：优化样式和语义化 -->
    <div id="map-container" class="map-content" />
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.map-select {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 999;
  /* 优化下拉框样式，避免被地图覆盖 */
  --el-select-dropdown-z-index: 1000 !important;
}

.map-content {
  width: 100%;
  height: 100%;
}

/* 兜底隐藏可能未被配置隐藏的元素 */
::v-deep(.amap-copyright),
::v-deep(.amap-logo) {
  display: none !important;
}
</style>
