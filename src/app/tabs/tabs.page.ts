import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { BookringService } from '../services/bookring.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  constructor(public userService:UserService,private router:Router,private changeDetectorRef:ChangeDetectorRef) {

  }
  async ngOnInit() {
    // load user info from file
    // console.log(this.user)
    // const res = await this.userServer.logStatusInit()
    // console.log(this.userServer.logStatus)
    const res = await this.userService.logStatusInit()
    console.log("Tabs init result: ")
    console.log(res)
    if(!this.userService.logStatus){
      this.router.navigate(['/tabs/login'])
    }
  }

}
