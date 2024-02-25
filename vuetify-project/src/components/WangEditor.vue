<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
    />
    <Editor
      style="height: 500px; overflow-y: hidden;"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onDestroyed="handleDestroyed"
      @onFocus="handleFocus"
      @onBlur="handleBlur"
      @customAlert="customAlert"
      @customPaste="customPaste"
    />
  </div>
</template>

<script setup>
import { defineEmits, onBeforeUnmount, ref, shallowRef, onMounted, watchEffect, watch } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

// 編輯器回傳表單
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
// 定義事件消息
// ts:
// const emits = defineEmits<{
//   (e:"update:modelValue", value: string) : void
// }>()
const emits = defineEmits(['update:modelValue'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('<p>hello</p>')
// ts:
// 當屬性變化時，自動賦植給 valueHtml
watchEffect(() => {
  valueHtml.value = props.modelValue
})
// 當valueHtml變化時，自動告訴父組件
watch(valueHtml, (newHtml) => {
  emits('update:modelValue', newHtml)
})

// 模拟 ajax 异步获取内容
// onMounted(() => {
//   setTimeout(() => {
//     valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
//   }, 1500)
// })

const toolbarConfig = {} // 這裡是工具欄配置
const editorConfig = {
  placeholder: '請輸入內容...',
  MENU_CONF: {
    uploadImage: {
      // https://www.youtube.com/watch?v=WDybLPjWJFg&list=PL_vrngOaamYsIovhZ3Cd9M2vPhm3yRTnG&index=104
      server: 'http://localhost:3000/articleUpload', // 封裝接口 可能需要修改 20:34
      fieldName: 'file',
      customInsert: (res, insertFn) => {
        console.log(res.data.name)
        if (res.code === '000000') {
          insertFn(res.data.name)
        } else {
          alert('wang失敗')
          throw new Error('wang失敗')
        }
      }
    }
  }
} // 這裡是編輯器配置

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const mode = 'default' // 或 'simple'
</script>

<script>
export default {
  components: { Editor, Toolbar }
}
</script>

<!-- <script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

export default {
  components: { Editor, Toolbar },
  setup () {
    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()

    // 内容 HTML
    const valueHtml = ref('<p>hello</p>')

    // 模拟 ajax 异步获取内容
    onMounted(() => {
      setTimeout(() => {
        valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
      }, 1500)
    })

    const toolbarConfig = {} // 這裡是工具欄配置
    const editorConfig = { placeholder: '請輸入內容...' } // 這裡是編輯列配置

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const handleCreated = (editor) => {
      editorRef.value = editor // 记录 editor 实例，重要！
    }

    return {
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated
    }
  }
}

</script> -->
