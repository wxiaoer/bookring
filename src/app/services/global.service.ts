import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(private device: Device,platform: Platform) {
    if(platform.is('hybrid')){
      this.MACHINE_MAC = this.device.uuid;
    }else{
      this.MACHINE_MAC = "web"
    }
    console.log("Init machine mac :"+this.MACHINE_MAC)
   }
  async ngOnInit() {
    
  }
  public SERVER_HOST="http://localhost:8080";
  public MACHINE_MAC="";
}

export class Result{
  status:boolean;
  reason:string;
  returnObj:any;
  constructor(status:boolean,reason:string,returnObj:any){
    this.status = status
    this.reason = reason
    this.returnObj = returnObj
  }
}
export class Success implements Result{
  status:boolean=true;
  reason:string="";
  returnObj:any=null;
  constructor(returnObj:any){
    this.returnObj = returnObj;
  }
}
export class Failed implements Result{
  status:boolean=false;
  reason:string="";
  returnObj:any=null;
  constructor(reason:string){
    this.reason = reason;
  }
}
