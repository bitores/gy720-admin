import Http from '@/utils/http'
import { EDIT } from '../mutationTypes'
import material from './material'
import logo from './logo'
import author from './author'
import menu from './menu'
import tour from './tour'
import hotspots from './hotspots'
import scene from './scene'

export default {
  state: {
    active: {
      control: true,
      logo: false,
      author: false,
      setting: false,
      material: false,
      group: false,
      menu: false,
      tour: false,
      hotspots: false,
      share: false,
      scene: false,
      snapshot: false,
      initialview: false,
      restrictView: false,
      object3d: false,
      object3dView: false,
      imageTextEdit: false,
      summary: false,
      vipInfo: false,
    },

    panoInfo: {},
  },

  modules: {
    logo,
    author,
    material,
    menu,
    tour,
    hotspots,
    scene,
  },

  actions: {
    [EDIT.PANO.INIT]({ commit }, pano_id) {
      return Http.get(`/user/pubset/get?pano_id=${pano_id}`)
        .then(({ result }) => commit(EDIT.PANO.INIT, result))
    },
  },

  mutations: {
    [EDIT.MODAL.OPEN](state, name) {
      state.active[name] = true
    },

    [EDIT.MODAL.CLOSE](state, name) {
      state.active[name] = false
    },

    [EDIT.PANO.INIT](state, panoInfo) {
      state.panoInfo = panoInfo
    },

    [EDIT.PANO.UPDATE](state, update) {
      state.panoInfo = {
        ...state.panoInfo,
        ...update,
      }
    },
  },

  getters: {
    isVip(state, getters, { userInfo }) {
      return userInfo.is_vip || state.panoInfo.is_vip
    },
  },
}
