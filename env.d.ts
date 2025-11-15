/// <reference types="vite/client" />

// 声明 .vue 模块，避免导入 vue 文件报错
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明 @ 别名的模块解析（如果别名配置正确仍报错，添加这行）
declare module '@/*' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
