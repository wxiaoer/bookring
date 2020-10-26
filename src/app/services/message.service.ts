import { Injectable } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Failed, GlobalService, Success } from './global.service';
import { UserService } from './user.service';
import axios from 'axios'

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  platform: Platform
  msgs

  constructor(public global: GlobalService, platform: Platform, public modalController: ModalController, public userService: UserService) {
    this.platform = platform
  }

  async msgsLoad() {
    let logStatus = await this.userService.logStatusInit()
    if (!logStatus.status) {
      alert("Not login")
    }
    let res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/msg/all",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        let msgs = res.data.returnObj
        let sortedMsgs = {}
        for (let i in msgs) {
          let msg = msgs[i]
          if (msg.fromId == this.userService.user.id) {
            if (msg.toId in sortedMsgs) {
              sortedMsgs[msg.toId]["msgs"].push(msg)
            } else {
              sortedMsgs[msg.toId] = { communicateName: msg.toName, msgs: [msg], showStatus: false }
            }
          } {
            if (msg.fromId in sortedMsgs) {
              sortedMsgs[msg.fromId]["msgs"].push(msg)
            } else {
              sortedMsgs[msg.fromId] = { communicateName: msg.fromName, msgs: [msg], showStatus: false }
            }
          }

        }
        this.msgs = sortedMsgs
        return new Success(null)
      } else {
        return new Failed("Load msgs failed")
      }
    }).catch((err) => {
      return new Failed(err.toString())
    })
    return res
  }

  async msgSend(toId, content) {
    if(content==""||content==undefined){
      return new Failed("Comment is empty!")
    }
    let formData = new FormData()
    formData.append("fromId", this.userService.user.id.toString())
    formData.append("fromName", this.userService.user.name)
    formData.append("content", content)
    formData.append("toId", toId)
    formData.append("toType", "user")
    let res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/msg/add",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        let msg = res.data.returnObj
        if (msg.toId in this.msgs) {
          this.msgs[msg.toId].msgs.push(msg)
        }
      }
      return res.data
    }).catch((err) => {
      return new Failed(err.toString())
    })
    return res
  }

  async msgDelete(ids,msgss) {
    let formData = new FormData()
    formData.append("ids", ids.toString())
    let res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/msg/delete",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        for (let i in msgss) {
          if (ids.indexOf(msgss[i].id) != -1) {
            msgss.splice(i, 1)
          }
        }
        return new Success(null)
      } else {
        return res.data
      }
    }).catch((err)=>{
      return new Failed(err.toString())
    })
    return res
  }

  async msgHide(hideIds: any[], fromId: any) {
    let formData = new FormData()
    formData.append("ids", hideIds.toString())
    let res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/msg/hide",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        delete this.msgs[fromId]
        return new Success(null)
      } else {
        return res.data
      }
    }).catch((err)=>{
      return new Failed(err.toString())
    })
    return res
  }

}
