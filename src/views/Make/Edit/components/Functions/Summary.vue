<template>
  <el-dialog
    title="设置（作品简介）"
    :visible="active.summary"
    :before-close="close"
  >
    <el-form
      class="edit-setting__form"
      :model="form"
      ref="form"
      :rules="formRules"
    >
      <el-form-item prop="pano_remark">
        <el-input
          v-model="form.pano_remark"
          type="textarea"
          :rows="6"
          placeholder="请输入作品简介（1000个字符内）"
        ></el-input>
      </el-form-item>

      <el-form-item label="是否显示简介按钮">
        <el-switch
          v-model="form.show_remark"
          on-text="显示" off-text="隐藏"
          :on-value="20" :off-value="10"
        ></el-switch>
      </el-form-item>
    </el-form>

    <div slot="footer" class="edit-setting__footer">
      <el-button type="primary" @click="submit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  /**
   * 设置简介
   * @author chenliangshan
   * @version 2017/09/29
   */

  import { mapState } from 'vuex'
  import { EDIT } from '@/store/mutationTypes'
  import modal from '../../mixins/modal'

  export default {
    name: 'edit-functions-summary',

    mixins: [modal],

    data() {
      return {
        form: {
          pano_remark: '',
          show_remark: 10,
        },

        formRules: {
          pano_remark: [
            { type: 'string', max: 1000, message: '不能超过1000个字符' },
          ],
        },
      }
    },

    computed: {
      ...mapState({
        panoInfo: state => state.edit.panoInfo,
      }),
    },

    watch: {
      panoInfo(val) {
        const { pano_remark, show_remark } = val
        this.form = { pano_remark, show_remark }
      },
    },

    methods: {
      close() {
        this.closeModal('summary')
      },

      submit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.$store.dispatch(EDIT.PANO.UPDATE, this.form)
              .then(({ status: { reason } }) => {
                this.$message.success(reason)
                this.close()
              })
          }
        })
      },
    },
  }
</script>
