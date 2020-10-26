import { Component } from '@angular/core';
import { MessageService } from '../services/message.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(public messageService:MessageService,public userService:UserService) {}

  async ngOnInit(){
    let res = await this.messageService.msgsLoad()
    console.log(res)
    console.log(this.messageService.msgs)
  }

  async msgSend(toId,content){
    let res = await this.messageService.msgSend(toId,content)
    if(!res.status){
      alert(res.reason)
    }
  }

  async msgDelete(id,msgss){
    let res = await this.messageService.msgDelete([id],msgss)
    if(!res.status){
      alert(res.reason)
    }
  }

  async msgGroupDelete(fromId,msgss){
    let deleteIds = []
    let hideIds = []
    for(let msg of msgss){
      if(msg.fromId == this.userService.user.id){
        deleteIds.push(msg.id)
      }else if(msg.toId==this.userService.user.id){
        hideIds.push(msg.id)
      }
    }
    let res = await this.messageService.msgDelete(deleteIds,msgss)
    if(!res.status){
      alert(res.reason)
      return
    }
    let res2 = await this.messageService.msgHide(hideIds,fromId)
    if(!res2.status){
      alert(res.reason)
      return
    }
  }
}
