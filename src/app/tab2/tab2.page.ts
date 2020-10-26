import { Component, ElementRef, ViewChild } from '@angular/core';

import { Router } from '@angular/router';
import { BookringService } from '../services/bookring.service';
import { Failed, GlobalService, Result, Success } from '../services/global.service';
import { User, UserService } from '../services/user.service';
import { Platform } from '@ionic/angular';

import {
  HttpClient, HttpClientModule, HttpRequest, HttpResponse, HttpEvent, HttpHeaders
} from "@angular/common/http"
import { Subscription } from 'rxjs'
import Axios from 'axios';

import { Gesture, GestureController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  private platform: Platform;
  myFormData: FormData//populated by ngfFormData directive
  files: File[] = []
  multiSelect: boolean
  choicedBooks = []
  searchWord=''

  constructor(platform: Platform, public userService: UserService, public router: Router, public bookringService: BookringService, public global: GlobalService, public HttpClient: HttpClient, private gestureCtrl: GestureController) {
    this.platform = platform;
    // const gesture: Gesture = this.gestureCtrl.create({
    //   el: document.getElementsByClassName("book"),
    //   threshold: 0,
    //   gestureName: 'my-gesture',
    //   onEnd: ev => this.bookPress(ev)
    // }, true);
  }

  async ngOnInit() {
    // alert(this.userService.user)
    const res = await this.bookringService.loadBookringDetail()
    if (!res.status) {
      alert(res.reason)
    }
  }

  async bookClick(book) {
    console.log(book)
    if (this.multiSelect) {
      this.bookChoiced(book)
    } else {
      this.bookringService.openBook(book)
    }
  }

  async bookringAdd() {
    if (this.platform.is("hybrid")) {

    } else {
      document.getElementById("file").click()
    }
  }

  async booksUpload() {
    if (this.files.length == 0) {
      return
    }
    const res = await this.bookringService.booksUpload(this.files, this.myFormData)
    this.files.length = 0
    if (!res["status"]) {
      if (res["returnObj"]) {
        alert(res["reason"] + " : " + res["returnObj"].toString())
      } else {
        alert(res["reason"])
      }
    }
  }

  bookPress(book) {
    console.log("book press : " + book.name)
    this.multiSelect = true
    this.bookChoiced(book)
  }

  bookChoiced(book) {
    if (this.choicedBooks.indexOf(book) != -1) {
      this.choicedBooks.splice(this.choicedBooks.indexOf(book), 1)
    } else {
      this.choicedBooks.push(book)
    }
    console.log(this.choicedBooks)
    if (this.choicedBooks.length == 0) {
      this.multiSelect = false
    }
  }

  bookCardClass(book) {
    return this.choicedBooks.indexOf(book) != -1 ? "border" : ""
  }

  startMultiSelect() {
    this.multiSelect = true
  }

  cancelMultiSelect() {
    this.multiSelect = false
    this.choicedBooks = []
  }

  async booksDownload() {
    if (this.platform.is('hybrid')) {
    } else {
      console.log("Your are in browser platform now, download books will be deleted after refresh browser!")
    }
    const res = await this.bookringService.booksDownload(this.choicedBooks)
    if (res.status) {
      console.log("Download success")
      console.log(this.choicedBooks)
    } else {
      console.error(res.reason)
      console.error(res.returnObj)
    }
    // this.multiSelect = false
    // this.choicedBooks = []


  }

  async booksShare() {
    const res = await this.bookringService.booksShare(this.choicedBooks)
    if (res.status) {
      console.log("Shared success")
    } else {
      console.error(res.reason)
    }
    // this.multiSelect = false
    // this.choicedBooks = []
  }

  async booksDelete() {
    const res = await this.bookringService.booksDelete(this.choicedBooks)
    if (res.status) {
      console.log("Delete success")
      this.multiSelect = false
      this.choicedBooks = []
    } else {
      console.error("Books delete failed: " + res.returnObj.toString())
      for(let book of this.choicedBooks){
        if(res.returnObj.indexOf(book.id)==-1){
          this.choicedBooks.splice(this.choicedBooks.indexOf(book),1)
        }
      }
    }
  }

  bookringSearch(name){
    console.log(this.searchWord)
    let res = name.indexOf(this.searchWord)!=-1
    console.log(res)
    return !res
  }

}
