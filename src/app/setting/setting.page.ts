import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  constructor(public userService:UserService,private router:Router) { }

  async ngOnInit() {
    let res = await this.userService.logStatusInit()
    console.log(res)
    // console.log(this.userService.user)
  }
  async logout(){
    let res = await this.userService.logOut();
    if(!res.status){
      alert(res.reason)
    }else{
      this.router.navigate(['/tabs/login'])
    }
  }

}
