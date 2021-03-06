<template>
  <div class="material-image-text">
    <el-table
      :data="listData.data"
      height="412"
      style="width:100%"
    >
      <el-table-column
        prop="title"
        label="标题"
        align="left"
      ></el-table-column>
      <el-table-column
        prop="created_at"
        label="添加日期"
        width="180"
        align="center"
      ></el-table-column>
      <el-table-column
        label="操作"
        width="280"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            size="small"
            type="info"
            v-if="selectStatus"
            @click="selectMater(scope.row.id, scope.row.title)"
          >选择</el-button>
          <el-button
            size="small"
            type="success"
            @click="openPreView(scope.row)"
          >预览</el-button>
          <el-button
            size="small"
            type="warning"
            @click="editInfo(scope)"
          >修改</el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteData(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :small="isSmallScreen"
      layout="prev, pager, next"
      :page-size="perPage"
      :total="listData.total"
      @current-change="getListData"
      v-if="listData.total"
    >
    </el-pagination>
    <!--添加|修改窗口-->
    <el-dialog
      :visible.sync="active.imageTextEdit"
      :close-on-click-modal="false"
      v-append-to-body
      >
      <image-text-dialog
        :visible="active.imageTextEdit"
        :id="currentEditId"
        :type="dialogType"
        @close="dialogClose"
        @update="dataUpdate"
        v-if="addRendered"
      ></image-text-dialog>
    </el-dialog>

    <!--预览窗口-->
    <el-dialog
      :visible.sync="preShow"
      :close-on-click-modal="false"
      v-append-to-body
    >
      <image-text-preview
        :visible="preShow"
        :id="preViewId"
        v-if="preViewRendered"
      ></image-text-preview>
    </el-dialog>
  </div>
</template>

<script>
  /**
   * 素材库-图文信息
   * @author  chenliangshan
   * @version 2017/08/25
   */

  import { mapState } from 'vuex'
  import { EDIT } from '@/store/mutationTypes'
  import modal from '../../../../../mixins/modal'

  export default {
    name: 'image-text',

    mixins: [modal],

    components: {
      ImageTextDialog: () => import('./ImageTextDialog'),
      ImageTextPreview: () => import('./ImageTextPreview'),
    },

    data: () => ({
      listData: {},
      currentEditId: null,
      dialogType: 'add',
      perPage: 10,
      preViewId: null,
      preShow: false,
      addRendered: false,
      preViewRendered: false,
    }),

    computed: {
      ...mapState({
        isSmallScreen: state => state.edit.material.isSmallScreen,
      }),
      selectStatus() {
        return this.$store.state.edit.material.invoked
      },
      visible() {
        return this.active.imageTextEdit
      },
    },

    watch: {
      // 监听添加窗口打开时渲染内容
      visible(val) {
        if (val) {
          this.addRendered = true
        }
      },
      // 监听预览窗口打开时渲染内容
      preShow(val) {
        if (val) {
          this.preViewRendered = true
        }
      },
    },

    methods: {
      // 获取列表数据
      getListData(page = 1) {
        this.$http.get(`/user/sourcearticle?page=${page}&per_page=${this.perPage}`)
          .then((res) => {
            this.listData = res.result
          })
      },

      // 编辑列表数据
      editInfo(data) {
        this.currentEditId = data.row.id
        this.openDialog('edit')
      },

      // 选择数据
      selectMater(id, title) {
        this.$store.commit(EDIT.MATERIAL.SELECT, { id, title })
      },

      // 打开新增|修改窗口
      openDialog(type = 'add') {
        this.openModal('imageTextEdit')
        this.dialogType = type
      },

      // 关闭修改窗口回调
      dialogClose() {
        this.dialogType = 'add'
        this.closeModal('imageTextEdit')
        this.currentEditId = null
      },

      // 修改列表回调
      dataUpdate() {
        this.getListData()
      },

      // 删除数据
      deleteData(item) {
        this.$confirm('确认删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.$http.delete(`/user/sourcearticle/${item.id}`)
            .then(() => {
              this.$message({
                type: 'success',
                message: '删除成功!',
                onClose: () => {
                  this.getListData()
                },
              })
            })
            .catch((errors) => {
              this.$notify.error({
                title: '删除出错!',
                message: errors.status.reason,
              })
            })
        })
      },

      // 打开预览窗口
      openPreView(item) {
        this.preShow = true
        this.preViewId = item.id
      },

    },

    created() {
      this.getListData()
    },
  }
</script>

<style lang="postcss">
  .material-image-text{
    height: 485px;
    position: relative;
    .el-pagination {
      margin-top: 10px;
    }
    .el-dialog {
      position: inherit;
    }
  }
  .edui-default .edui-dialog-modalmask {
    background-color: #000 !important;
  }
</style>
