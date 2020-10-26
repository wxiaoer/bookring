import { Component } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { BookringService } from '../services/bookring.service';
import { MessageService } from '../services/message.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  private platform: Platform;
  multiSelect: boolean
  choicedBooks = []
  searchWord = ''

  constructor(platform: Platform, public bookringService: BookringService, public userService: UserService, public alertController: AlertController,public messageService:MessageService) {
    this.platform = platform
  }

  async ngOnInit() {
    // alert(this.userService.user)
    const res = await this.bookringService.loadLibrary(0)
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

  async booksShop() {
    let res = await this.bookringService.booksShop(this.choicedBooks)
    if (!res.status) {
      alert(res.reason)
    }
  }

  async librarySearch() {
    var reg = /\\|\//g;
    this.searchWord = this.searchWord.replace(reg, "")
    console.log(this.searchWord)
    let res = await this.bookringService.librarySearch(this.searchWord)
    if (!res.status) {
      alert(res.reason)
    }
  }

  async msgSend() {
    if (this.choicedBooks.length != 1) {
      alert("Only support single book uploader communicate!")
    } else {
      let choicedBook = this.choicedBooks[0]
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Comment',
        inputs: [
          {
            name: 'content',
            type: 'text',
            placeholder: 'Hello '+choicedBook.name+"'s uploader",
          }], buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                // console.log('Confirm Cancel');
              }
            }, {
              text: 'Ok',
              handler: async (alertData) => {
                // console.log('Confirm Ok');
                // console.log(alertData.content)
                let res = await this.messageService.msgSend(choicedBook.userId,alertData.content)
                // if(!res.status){
                //   console.error(res.reason)
                // }
              }
            }
          ]
      });
      await alert.present()
    }
  }
}
