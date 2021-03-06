<template>
  <el-dialog
    title="场景分组"
    :visible.sync="active.group"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @open="openScene"
    custom-class="group-dialog"
  >
    <header class="group-dialog__header clearfix">
      <div class="group-dialog__header__tip clearfix">
      <h5>温馨提示:</h5>
        <ol>
          <li>最多支持添加10个分组</li>
          <li>拖动整个分组名称可以排序</li>
          <li>拖动单个场景可以排序</li>
          <li>未分组的场景显示在第一个默认分组（场景）内</li>
        </ol>
      </div>
      <el-button type="primary" size="small" @click="createNewGroup">添加场景分组</el-button>
    </header>

    <app-empty-body
      width="560px"
      v-if="!groupsList.length && groupsListLoad"
    >
      您还没有设置场景分组，<br/>多个场景建议您设置分组哦！
    </app-empty-body>

    <draggable v-model="groupsList" :options="{group:'list'}" class="group-list-warp" v-else @sort="groupsSort">
      <transition-group tag="ul" class="group-list list">
        <li v-for="list in groupsList" :key="list.id">
          <div class="scene-group">
            <div class="scene-group__title clearfix">
              <h4>{{ list.title }}</h4>
              <div class="scene-group__title__edit">
                <i role="button" class="iconfont" @click="createNewGroup(list)">&#xe608;</i>
                <i role="button" class="iconfont" @click="removeGroup(list)">&#xe615;</i>
              </div>
            </div>
            <draggable :list="list.scenes" class="scene-group__list" @sort="sceneSort(list.id)">
              <transition-group tag="ul" class="list">
                <li v-for="scene in list.scenes" :key="scene.id" class="scene-group__item clearfix">
                  <img :src="$url.static(scene.thumb)" :alt="scene.name">
                  <div class="scene-group__item__content">
                    <span class="scene-group__item__name">{{ scene.name }}</span>
                      <span class="scene-group__item__edit">
                      <i role="button" class="iconfont" @click="removeScene(list.id, scene)">&#xe615;</i>
                    </span>
                  </div>
                </li>
              </transition-group>
            </draggable>
            <el-button size="small" class="scene-group__add" @click="showScenesBox(list)">+</el-button>
          </div>
        </li>
      </transition-group>
    </draggable>

    <el-dialog
      title="选择场景"
      :visible.sync="showScenes"
      :close-on-click-modal="false"
      size="large"
      @open="getNotGroups"
      @close="closeSelectScenes"
      v-append-to-body
    >
      <ul class="work-scenes list clearfix" v-if="notGroupsList.length">
        <li v-for="list in notGroupsList" :key="list.id" :class="{'active': checkedScene(list)}" @click="selectScenes(list)">
          <img :src="$url.static(list.thumb)" :alt="list.name">
          <span class="title ellipsis">{{ list.name }}</span>
        </li>
      </ul>
      <div v-else>
        暂无未分组的场景
      </div>
      <div class="work-scenes__confirm">
        <el-button type="primary" :loading="addScenesLoading" :disabled="!selectSceneIds.length" @click="addScenes">确定</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
/**
 * 高级编辑 - 场景
 * @author luminghuai | chenliangshan
 * @version 2017-09-03
 */

import { mapState } from 'vuex'
import Draggable from 'vuedraggable'
import { errorHandler } from '@/utils'
import modal from '../../mixins/modal'

export default {
  name: 'edit-functions-group',

  components: {
    Draggable,
  },

  mixins: [modal],

  data() {
    return {
      showScenes: false,
      groupsList: [],
      notGroupsList: [],
      currentGroupsId: null,
      selectSceneIds: [],
      addScenesLoading: false,
      groupsListLoad: false,
      saveStatus: false,
    }
  },

  computed: {
    ...mapState({
      panoInfo: state => state.edit.panoInfo,
    }),
  },

  methods: {
    // 打开场景
    openScene() {
      this.getGroupsList()
    },

    // 获取未分组的场景列表
    getNotGroups() {
      this.$http.get(`/user/scenegroupdata/scenes?pano_id=${this.panoInfo.hash_pano_id}`)
        .then((res) => {
          this.notGroupsList = [...res.result]
        })
        .catch((errors) => {
          this.errorHandler(errors)
        })
    },

    // 获取场景分组列表
    getGroupsList() {
      this.$http.get(`/user/scenegroup?pano_id=${this.panoInfo.hash_pano_id}`)
        .then((res) => {
          this.groupsList = [...res.result]
          this.groupsListLoad = true
        })
        .catch((errors) => {
          this.errorHandler(errors)
        })
    },

    // 打开选择场景
    showScenesBox({ id }) {
      this.showScenes = true
      this.currentGroupsId = id
    },

    // 选择场景添加
    selectScenes(item) {
      const isExist = this.selectSceneIds.filter(val => val.id === item.id).length
      if (isExist) {
        // 存在则删除选中数据
        this.selectSceneIds = this.selectSceneIds.filter(val => val.id !== item.id)
      } else {
        // 不存在则添加选中数据
        this.selectSceneIds.push(item)
      }
    },

    // 判断是否选中
    checkedScene({ id }) {
      return this.selectSceneIds.filter(item => item.id === id).length
    },

    // 提交添加场景到分组
    addScenes() {
      if (this.selectSceneIds.length) {
        this.addScenesLoading = true
        this.$http.post('/user/scenegroupdata/store', {
          pano_id: `${this.panoInfo.hash_pano_id}`,
          scene_group_id: this.currentGroupsId,
          scene_ids: this.selectSceneIds.map(({ id }) => id),
        })
          .then(() => {
            this.$message.success('添加场景成功!')
            this.saveStatus = true
            this.showScenes = false
            this.addScenesLoading = false
            // 添加成功移除未分组列表
            this.notGroupsList = this.notGroupsList.filter(({ id }) =>
              this.selectSceneIds.find(item => item.id !== id))
          })
      } else {
        this.errorHandler('请选择场景')
      }
    },

    // 关闭场景窗口清空选择场景数据
    closeSelectScenes() {
      if (!this.saveStatus) {
        this.selectSceneIds = []
      } else {
        this.groupsList = this.groupsList.map((item) => {
          const scenes = [...item.scenes.concat(this.selectSceneIds)]
          if (item.id === this.currentGroupsId) {
            this.currentGroupsId = null
            this.saveStatus = false
            this.selectSceneIds = []
            return {
              ...item,
              scenes,
            }
          }
          return item
        })
      }
    },

    // 修改分组名称
    editGroupsTitle(title, id) {
      if (title) {
        this.$http.put(`/user/scenegroup/${id}?pano_id=${this.panoInfo.hash_pano_id}`, { title })
          .then(() => {
            // 修改列表名称
            this.groupsList.find(item => item.id === id).title = title
            this.$message.success('分组名称修改成功!')
          })
          .catch((errors) => {
            this.errorHandler(errors)
          })
      }
    },

    // 添加 | 编辑 分组
    createNewGroup({ title = null, id = '' }) {
      const inputValidator = val => !!val
      let dialogTitle = '添加场景分组'

      if (id) {
        dialogTitle = '编辑场景分组'
      }

      // 限制最多10个分组
      if (title || this.groupsList.length < 10) {
        this.$prompt('请输入分组名', dialogTitle, {
          closeOnPressEscape: false,
          closeOnClickModal: false,
          inputValue: title,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator,
          inputErrorMessage: '分组名不能为空',
        }).then(({ value }) => {
          if (id) {
            this.editGroupsTitle(value, id)
          } else {
            this.$http.post(`/user/scenegroup?pano_id=${this.panoInfo.hash_pano_id}`, { title: value })
              .then(({ result }) => {
                // 添加成功新增列表数组
                this.groupsList.push({
                  id: result.id,
                  title: result.title,
                  list_order: 255,
                  scenes: [],
                })
                this.$message.success(`${dialogTitle}成功!`)
              })
              .catch((errors) => {
                this.errorHandler(errors)
              })
          }
        })
      } else {
        this.errorHandler('场景分组最多不能超出10个')
      }
    },

    // 删除分组
    removeGroup({ id }) {
      this.$confirm('确定要删除该分组吗?', '删除确认', {
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.$http.delete(`/user/scenegroup/${id}?pano_id=${this.panoInfo.hash_pano_id}`)
          .then(() => {
            // 过滤出删除之外的数据
            this.groupsList = this.groupsList.filter(item => item.id !== id)
            this.$message.success('删除成功!')
          })
          .catch((errors) => {
            this.errorHandler(errors)
          })
      })
    },

    // 分组排序
    groupsSort() {
      const sort = this.groupsList.map(({ id }) => {
        const data = { id }
        return data
      })
      this.$http.post(`/user/scenegroup/sort?pano_id=${this.panoInfo.hash_pano_id}`, { sort })
        .then(() => {
          this.$message.success('排序成功!')
        })
        .catch((errors) => {
          this.errorHandler(errors)
        })
    },

    // 删除场景
    removeScene(pid, { id }) {
      this.$http.post('/user/scenegroupdata/delete', {
        pano_id: `${this.panoInfo.hash_pano_id}`,
        scene_group_id: `${pid}`,
        scene_id: `${id}`,
      })
        .then(() => {
          // 过滤出删除之外的数据
          this.groupsList = this.groupsList.map((item) => {
            if (item.id === pid) {
              const scenes = item.scenes.filter(scene => scene.id !== id)
              return {
                ...item,
                scenes,
              }
            }
            return item
          })
          this.$message.success('删除成功!')
        })
        .catch((errors) => {
          this.errorHandler(errors)
        })
    },

    // 场景排序
    sceneSort(pid) {
      const currentGroup = this.groupsList.find(({ id }) => id === pid)
      const sort = currentGroup.scenes.map(({ id }) => {
        const data = { id }
        return data
      })
      this.$http.post('/user/scenegroupdata/sort', {
        pano_id: `${this.panoInfo.hash_pano_id}`,
        scene_group_id: `${pid}`,
        sort,
      })
        .then(() => {
          this.$message.success('排序成功!')
        })
        .catch((errors) => {
          this.errorHandler(errors)
        })
    },

    // 报错处理
    errorHandler(errors) {
      const error = errorHandler(errors)
      const h = this.$createElement
      this.$notify.error({
        duration: error.length * 2000,
        message: h('div',
          {
            class: 'group-errors',
          },
          error.map(val => h('p', val)),
        ),
      })
    },
  },

}
</script>

<style lang="postcss">
@import "vars.css";

:root {
  --dialog-width: 1100px;
}
.group-errors {
  p {
    margin: 4px 0;
    padding: 0;
  }
}
.group-dialog {
  width: var(--dialog-width);
  transform: none;
  margin-left: calc(var(--dialog-width) / -2);

  &__header {
    margin-bottom: 20px;
    font-size: 12px;
    color: var(--gray);

    &__tip {
      float: left;

      h5,
      ol {
        float: left;
        margin: 0;
        padding: 0;
        line-height: 20px;
      }

      h5 {
        margin-right: 0.5em;
        font-size: 12px;
        font-weight: normal;
      }

      li {
        float: left;
        margin-left: 2em;
      }
    }

    .el-button {
      float: right;
      margin-top: -4px;
    }
  }
}

.group-list-warp {
  min-height: 450px;
  max-height: 500px;
  overflow: hidden;

  &:hover {
    overflow-y: auto;
  }
}

.group-list {
  & > li {
    float: left;
    transition: 0.3s;
    width: 20%;
    padding: 0 10px;
    margin-bottom: 20px;
  }
}

.scene-group {
  padding: 5px;
  border-radius: 3px;
  background-color: var(--gray-extra-light);
  transition: 0.5s;

  &__title {
    padding: 4px;
    border-radius: 2px;
    background-color: #fff;

    & > h4 {
      float: left;
      margin: 0;
      font-weight: normal;
    }
    &__edit{
      float: right;
      .iconfont {
        cursor: pointer;

        &:hover {
          color: var(--color-warning);
        }
        + .iconfont {
          margin-left: 6px;
        }
      }
    }

    & > .el-input {
      width: 182px;
    }
  }

  &__list {
    height: 204px;
    overflow: hidden;

    &:hover {
      overflow-y: auto;
    }
  }

  &__item {
    border: 1px solid var(--border-color);
    margin: 6px 0 0;
    transition: 0.3s;
    cursor: pointer;
    position: relative;
    padding-left: 60px;

    & > img {
      width: 60px;
      height: 60px;
      position: absolute;
      left: 0;
    }

    &__content {
      float: left;
      width: 100%;
      height: 60px;
      line-height: 20px;
      text-align: center;
      word-break: break-all;
      position: relative;
    }

    &__name {
      width: 90%;
      padding: 0 20px 0 0;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
    }
    &__edit {
      display: none;
      line-height: 30px;
      position: absolute;
      z-index: 10;
      top: 0;
      right: 3px;

      .iconfont {
        cursor: pointer;

        &:hover {
          color: var(--color-warning);
        }
      }
    }
    &:hover {
      .scene-group__item__edit {
        display: inline-block;
      }
    }
  }

  &__add {
    width: 100%;
    margin-top: 8px;
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-light);
  }
}

.work-scenes {
  & > li {
    width: 86px;
    float: left;
    padding: 2px;
    border: 1px solid var(--border-color);
    margin: 5px;
    font-size: 12px;
    text-align: center;
    cursor: pointer;

    &.active {
      border-color: var(--color-info);
    }

    & > img {
      display: block;
      width: 80px;
      height: 80px;
      margin-bottom: 2px;
    }
    & > .title {
      line-height: 18px;
    }
  }

  &__confirm {
    margin-top: 25px;
    text-align: center;

    .el-button {
      width: 10em;
    }
  }
}

/* 兼容小分辨率屏幕 */
@media screen and (max-height: 760px) {
  .group-dialog {
    top: 5% !important;

    .group-list-warp {
      min-height: 400px;
      max-height: 420px;
    }
  }
}
</style>
