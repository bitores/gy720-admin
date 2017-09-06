import { errorHandler } from '@/utils'

export default {
  methods: {
    showError(reason) {
      const h = this.$createElement
      this.$msgbox({
        type: 'error',
        title: '提交错误',
        message: h(
          'ol',
          null,
          Object.keys(reason).map(key => h('li', null, reason[key])),
        ),
        confirmButtonText: '确定',
      })
    },

    errorHandler(errors) {
      const error = errorHandler(errors)
      const h = this.$createElement
      this.$notify.error({
        duration: error.length * 2000,
        message: h('ol',
          error.map(val => h('p', val)),
        ),
      })
    },
  },
}
