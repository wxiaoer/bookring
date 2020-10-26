import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ToastController } from '@ionic/angular';

import { GlobalService } from '../services/global.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private router: Router, public userService: UserService, public toastController: ToastController, public globalService: GlobalService) { }

  async ngOnInit() {
    await this.userService.logStatusInit()
    if (this.userService.logStatus) {
      this.router.navigate(['/tabs/tab2'])
    }
  }

  private email: string = "";
  private password: string = "";
  private userName: string = "";
  private tab = "Login"

  private async login() {
    let formData = new FormData()
    formData.append("email", this.email)
    formData.append("password", this.password)
    formData.append("machineMac", this.globalService.MACHINE_MAC)
    const res = await this.userService.login(formData)
    if (!res.status) {
      // alert(res.reason)
      this.presentToast(res.reason, false)
    } else {
      this.router.navigate(['/tabs/tab2'])
    }
  }

  private async signup() {
    let formData = new FormData()
    formData.append("email", this.email)
    formData.append("password", this.password)
    formData.append("name", this.userName)
    formData.append("machineMac", this.globalService.MACHINE_MAC)
    const res = await this.userService.signUp(formData)
    if (!res.status) {
      // alert(res.reason)
      this.presentToast(res.reason, false)
    } else {
      this.router.navigate(['/tabs/tab2'])
    }
  }

  async presentToast(msg, type) {
    let color = "success"
    if (!type) {
      color = "warning"
    }
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: color,
      position: "top"
    });
    toast.present();
  }


}
