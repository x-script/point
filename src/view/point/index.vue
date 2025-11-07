<script lang="ts" setup>
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

type Option = {
  areaId: number
  id: number
  name: string
  position: string[]
}

const value = ref<Option>()
// let zz = [116.166215, 40.525038]
// let gr = reactive()

let map: any = null

var communityData = [
  {
    areaId: 1,
    id: 1,
    name: '左所屯',
    position: [116.162014, 40.532986],
    // zooms: [10, 20],
    // opacity: 1,
    // zIndex: 10,
    // icon,
  },
]

let areaData = [
  {
    id: 1,
    name: '永宁镇',
    position: [116.166215, 40.525038],
  },
]

// console.log(value)

var pointData = [
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
    // short: "BJ",
    // areacode: "010",
    // adcode: "110000",
    name: '5-2',
    x: '116.155415',
    y: '40.525596',

    // label: "北京市",
  },
]

onMounted(() => {
  AMapLoader.load({
    key: '7aa765f8c7dfa0f01370cb359283562e', // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      map = new AMap.Map('container', {
        // 设置地图容器id
        viewMode: '3D', // 是否为3D地图模式
        zoom: 16,
        center: [115.976807, 40.458338],
        showIndoorMap: false,
        showLabel: false,
        mapStyle: 'amap://styles/fresh',
      })

      var markers = []
      var layer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false,
        allowCollision: false,
      })

      map.add(layer)

      var textStyle = {
        fontSize: 12,
        fontWeight: 'normal',
        fillColor: '#fff',
        // fillColor: 'rgb(255, 215, 0)',
        // strokeColor: '#fff',
        // strokeWidth: 2,
        // fold: true,
        padding: '2, 5',
        backgroundColor: 'rgb(246,137,38)',
        borderColor: '#fff',
        borderWidth: 1,
      }

      for (var a of pointData) {
        console.log(1, a)
        var marker = new AMap.LabelMarker({
          name: a.name,
          position: [a.x, a.y],
          // zIndex: number,
          text: {
            content: a.name,
            direction: 'center',
            style: textStyle,
          },
        })
        markers.push(marker)
      }

      layer.add(markers)
    })
    .catch((e) => {
      console.log(e)
    })
})

onUnmounted(() => {
  map?.destroy()
})

let handleSelect = (val: any) => {
  map.setCenter(val.position, true)
}

const options = ref(communityData)
</script>

<template>
  <div class="container">
    444444444444444
    <el-select @change="handleSelect" v-model="value" placeholder="Select" class="select" style="width: 240px">
      <el-option v-for="(item, index) in options" :key="index" :label="item.name" :value="item" />
    </el-select>
    <div id="container" />
  </div>
</template>

<style>
#container {
  width: 100vw;
  height: 100vh;
}

.container {
  position: relative;
}

.select {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 999;
}
</style>
