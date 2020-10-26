import { Injectable } from '@angular/core';
import axios from 'axios'
import {
  Plugins, Capacitor, FilesystemDirectory
} from '@capacitor/core';
import { Platform } from '@ionic/angular';

const { Filesystem, Storage } = Plugins;

import { GlobalService,Success,Failed,Result } from './global.service'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private platform: Platform;
  private USER_STORAGE: string = "user";
  public user: User;
  public logStatus: boolean = false;

  constructor(platform: Platform, public global: GlobalService) {
    this.platform = platform;
  }

  async ngOnInit() {
    await this.logStatusInit()
    // load user info from file
    // console.log(this.user)
  }

  public async logStatusInit() {
    if(this.user!=undefined){
      return new Success(this.user)
    }
    let res:Result = await this.logStatusCheck()
    if (res.status) {
      // Loged
      return this.logedInit(res.returnObj)
    } else {
      // Unloged
      const userStr = await Storage.get({ key: this.USER_STORAGE })
      this.user = JSON.parse(userStr.value) || undefined
      if (this.user) {
        var formData = new FormData();
        formData.append("email", this.user.email)
        formData.append("password", this.user.password)
        formData.append("machineMac", this.global.MACHINE_MAC)
        return await this.login(formData)
      }
      return new Failed("");
    }
  }

  public async logStatusCheck() {
    let res = await axios({
      method: "get",
      url: this.global.SERVER_HOST + "/user/status",
      withCredentials: true
    }).then((res) => {
      return res.data
    })
      .catch((err) => {
        return new Failed(err as string);
      })
    // console.log(res)
    return res
  }

  public async login(formData: any) {
    const res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/user/login",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        return this.logedInit(res.data.returnObj)
      }else{
        return res.data;
      }
    }).catch((err)=>{
      return new Failed(err as string);
    });
    return res
  }

  logedInit(user: User) {
    this.user = user
    this.logStatus = true
    Storage.set({
      key: this.USER_STORAGE,
      value: JSON.stringify(user)
    });
    return new Success(this.user)
    // this.tabPage = "bookring"
    // ipcRenderer.sendSync("userInit", userInfo)
    // this.loadBookRing()
    // this.loadMsgs()
  }

  public async signUp(formData) {
    const res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/user/register",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        return this.logedInit(res.data.returnObj)
      }else{
        return res.data;
      }
    }).catch((err)=>{
      return { status: false, reason: err as string ,returnObj:null }
    });
    return res
  }

  public async logOut() {
    const res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/user/logout",
      // data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then(async (res) => {
      if (res.data.status) {
        try{
          // await Filesystem.deleteFile({
          //   path: this.USER_STORAGE,
          //   directory: FilesystemDirectory.Data
          // });
          Storage.remove({ key: this.USER_STORAGE })
          this.user = undefined
          this.logStatus = false
          return res.data
        }catch(err){
          return {status:false,reason:"User info file delete failed!",returnObj:null}
        }
      } else {
        return res.data
      }
    }).catch((err)=>{
      return { status: false, reason: err as string ,returnObj:null }
    })
    return res;
  }

}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}



