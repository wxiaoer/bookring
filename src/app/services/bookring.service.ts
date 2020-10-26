import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { async } from '@angular/core/testing';
import axios from 'axios'
import { GlobalService, Success, Failed, Result } from './global.service'
import { BookPage } from '../book/book.page'
import {
  Plugins, CameraResultType, Capacitor, FilesystemDirectory,
  CameraPhoto, CameraSource
} from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { UserService } from './user.service';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class BookringService {

  constructor(public global: GlobalService, platform: Platform, public modalController: ModalController, public userService: UserService) {
    this.platform = platform
  }

  private platform: Platform;
  public bookRing: any = [];
  public library: any[]

  public async loadBookring() {
    const bookRingRes = await axios({
      method: "get",
      url: this.global.SERVER_HOST + "/book/list",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      return res.data;
    }).catch((err) => {
      return new Failed(err)
    })
    return bookRingRes
  }

  public async loadStorages() {
    const storageRes = await axios({
      method: "get",
      url: this.global.SERVER_HOST + "/book/storage/list",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        return res.data
      } else {
        return new Failed("list book storages failed")
      }
    }).catch((err) => {
      return new Failed(err)
    })
    return storageRes
  }

  public async loadBookringDetail() {
    const bookRingRes = await this.loadBookring()
    let bookRing
    if (bookRingRes.status) {
      bookRing = bookRingRes.returnObj
    } else {
      return bookRingRes
    }
    let bookStorages
    const storageRes = await this.loadStorages()
    if (storageRes.status) {
      bookStorages = storageRes.returnObj
    } else {
      return storageRes
    }
    this.mergeBookAndStorage(bookRing, bookStorages)
    this.bookRing = bookRing
    return new Success(null)
  }

  private mergeBookAndStorage(bookRing, bookStorages) {
    for (let bookIndex in bookRing) {
      var book = bookRing[bookIndex]
      book.storage = {}
      for (let bookStorageIndex in bookStorages) {
        var bookStorage = bookStorages[bookStorageIndex]
        if (bookStorage.bookId == book.id) {
          if (bookStorage.storageType == "local") {
            if (bookStorage.machineMac == this.global.MACHINE_MAC) {
              book.storage[bookStorage.storageType] = bookStorage.location
            }
          } else {
            book.storage[bookStorage.storageType] = bookStorage.location
          }
        }
      }
      this.thumbnailLoad(book)
    }
  }

  async loadBook(book) {
    // Filesystem.stat(book.)
    // console.log(book.storage)
    // 判断storage local是否存在 存在读取文件，不存在下载文件后读取文件
    if (this.platform.is('hybrid')) {

    } else {
      this.openBook(book)
    }
  }

  public async openBook(book) {
    if (this.platform.is('hybrid')) {
      if (book.storage.local) {
        book.url = book.storage.local
      } else {
        await this.booksDownload([book])
      }
    } else {
      if (!book.url) {
        await this.booksDownload([book])
      }
    }
    // console.log(book)
    // book.url = book.url ? book.url : this.global.SERVER_HOST + "/book/download/" + book.id
    const returnBook = await this.presentModal(book)
    // console.log(returnBook.page)
    const res: Result = await this.updatePage(returnBook)
    if (!res.status) {
      alert(res.reason)
    }
  }

  async updatePage(book) {
    if (book.userId != this.userService.user.id) {
      return new Success(null)
    }
    // update page to server
    var bookInfo = new FormData()
    for (let key in book) {
      bookInfo.append(key, book[key])
    }
    // bookInfo.lastModifyTime = new Date().getTime()
    bookInfo.set("lastReadTime", this.dateFormat("YYYY-mm-dd HH:MM:SS", new Date()))
    // bookInfo.set("createTime",dateFormat("YYYY-mm-dd HH:MM:SS", new Date(book.createTime)))
    bookInfo.delete("createTime")
    const res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/book/update",
      data: bookInfo,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        // app.pushPrompt("warning","book update to server success")
        return new Success(null)
      } else {
        return res.data.reason
      }
    }).catch((err) => {
      return new Failed(err)
    })
    return res
  }

  async presentModal(book) {
    const modal = await this.modalController.create({
      component: BookPage,
      cssClass: 'my-custom-class',
      componentProps: {
        book: book
      }
    });
    modal.present();
    await modal.onWillDismiss();
    return book
  }

  private async thumbnailLoad(book) {
    if (this.platform.is('hybrid')) {
      // TODO download thumbnail to local and load from local
      const info = await Filesystem.stat({ path: book.thumbnail, directory: FilesystemDirectory.Data })
      console.log('Stat Info: ', info);
    } else {
      book.thumbnail = this.global.SERVER_HOST + '/thumbnails/' + book.id
    }
  }

  private async readAsBase64(binFile: any) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: binFile.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(binFile.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  // 日期格式化
  dateFormat(fmt, date) {
    let ret;
    const opt = {
      "Y+": date.getFullYear().toString(),        // 年
      "m+": (date.getMonth() + 1).toString(),     // 月
      "d+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "M+": date.getMinutes().toString(),         // 分
      "S+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
        fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      };
    };
    return fmt;
  }

  async booksUpload(files: File[], myFormData: FormData) {
    if (myFormData.get("location") == null) {
      myFormData.append("location", "web")
    }
    const res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/book/entityAdd",
      data: myFormData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        // let addedBooks = res.data.returnObj.book
        // let addedStoraged = res.data.returnObj.storage
        // this.mergeBookAndStorage(addedBooks, addedStoraged)
        // for (let book of addedBooks) {
        //   this.bookRing.unshift(book)
        // }
        for (let bookAndStorage of res.data.returnObj) {
          let book = bookAndStorage.book
          let storage = bookAndStorage.storage
          book.storage = {}
          book.storage[storage.storageType] = storage.location
          this.thumbnailLoad(book)
          this.bookRing.unshift(book)
        }
        return res.data
      } else {
        if (res.data.returnObj) {
          let successBooks = res.data.returnObj.success
          if (successBooks.length > 0) {
            // let addedBooks = res.data.returnObj.success.book
            // let addedStoraged = res.data.returnObj.success.storage
            // this.mergeBookAndStorage(addedBooks, addedStoraged)
            // for (let book of addedBooks) {
            //   this.bookRing.unshift(book)
            // }
            for (let bookAndStorage of successBooks) {
              let book = bookAndStorage.book
              let storage = bookAndStorage.storage
              book.storage = {}
              book.storage[storage.storageType] = storage.location
              this.thumbnailLoad(book)
              this.bookRing.unshift(book)
            }
          }
          return new Result(false, "Book already exists", res.data.returnObj.faileds)
        } else {
          return res.data
        }
      }
    }).catch((err) => {
      return new Failed(err as string);
    });
    return res
  }

  async booksShare(choicedBooks: any[]) {
    let formData = new FormData()
    let selectedBookIds = []
    for (let selectedBook of choicedBooks) {
      selectedBookIds.push(selectedBook.id)
    }
    formData.append("bookIds", selectedBookIds.toString())
    let res = axios({
      method: "post",
      url: this.global.SERVER_HOST + "/book/share",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      for (let book of choicedBooks) {
        book['sharing'] = 1
      }
      return res.data
    }).catch((err) => {
      return new Failed(err.toString())
    })
    return res
  }

  async booksDownload(choicedBooks: any[]) {
    // let formData = new FormData()
    // let selectedBookIds = []
    let errs = []
    for (let book of choicedBooks) {
      if (book.storage.local) {
        continue
      }
      let res = await axios({
        method: "get",
        url: this.global.SERVER_HOST + "/book/download/" + book.id,
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true,
        responseType: 'blob',
      }).then((res) => {
        if (!res.data.status && res.data.status != undefined) {
          errs.push(new Failed(res.toString()))
        }
        if (res.status = 200) {
          if (this.platform.is("hybrid")) {
            // TODO 保存文件到本机并更新storage到本机和服务器
          } else {
            let link = window.URL.createObjectURL(new Blob([res.data]));
            book.url = link
          }
        } else {
          errs.push(new Failed("Book " + book.name + " Download failed"))
        }
      }).catch((err) => {
        errs.push(new Failed("Book " + book.name + " Download failed"))
      })
    }
    if (errs.length > 0) {
      return new Result(false, "download failed", errs)
    } else {
      return new Success(null);
    }

  }

  async booksDelete(choicedBooks: any[]) {
    let formData = new FormData();
    let selectedBookIds = []
    for (let book of choicedBooks) {
      selectedBookIds.push(book.id)
    }
    formData.append("bookIds", selectedBookIds.toString())
    let res = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/book/delete",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      return res.data
    }).catch((err) => {
      return new Failed(err.toString())
    })
    if (res.status) {
      this.localBooksDelete(choicedBooks, [])
    } else {
      res.returnObj = JSON.parse(res.returnObj)
      this.localBooksDelete(choicedBooks, JSON.parse(res.returnObj))
    }
    return res
  }

  localBooksDelete(books, failedBookIds) {
    for (let book of books) {
      if (failedBookIds.indexOf(book.id) == -1) {
        // delete local file and thumbnail
        if (this.platform.is("hybrid")) {
          // delete local file and thumbnail
        }
        this.bookRing.splice(this.bookRing.indexOf(book), 1)
      }
    }
  }

  async loadLibrary(startIndex: number) {
    // TODO push to end load more books
    const res = await axios({
      method: "get",
      url: this.global.SERVER_HOST + "/book/library/" + startIndex.toString(),
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      return res.data
    }).catch((err) => {
      return new Failed("Load library failed")
    })
    if (res.status) {
      for (let book of res.returnObj) {
        book.storage = {}
        this.thumbnailLoad(book)
        if (!this.userService.user) {
          const res = await this.userService.logStatusInit()
          console.log(res)
        }
        if (book.userId != this.userService.user.id) {
          book.page = 0
        }
      }
      this.library = res.returnObj
    }
    return res
  }

  async booksShop(choicedBooks: any[]) {
    let formData = new FormData();
    let librarySelectedBookIds = []
    for (let i in choicedBooks) {
      librarySelectedBookIds.push(choicedBooks[i].id)
    }
    formData.append("bookIds", librarySelectedBookIds.toString())
    let shopResult = await axios({
      method: "post",
      url: this.global.SERVER_HOST + "/book/shop",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    }).then((res) => {
      if (res.data.status) {
        return res.data
      } else {
        return new Failed("Shop failed")
      }
    }).catch((err) => {
      return new Failed("Shop failed")
    })
    if (!shopResult.status) {
      return shopResult
    }
    let storageGetErrors = []
    for (let book of shopResult.returnObj) {
      let storageRes = await axios({
        method: "get",
        url: this.global.SERVER_HOST + "/book/storage/get/" + book.id,
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      }).then((res) => {
        return res.data
      }).catch((err) => {
        return new Failed(err.toString())
      })
      book.storage = {}
      if (storageRes.status) {
        book.storage.cloud = storageRes["returnObj"].location
        this.bookRing.push(book)
      } else {
        storageGetErrors.push(book.id)
      }
    }
    if (storageGetErrors.length > 0) {
      return new Failed("Book storage get failed : " + storageGetErrors.toString())
    } else {
      return new Success(null)
    }
  }

  async librarySearch(librarySearchWord) {
    if(librarySearchWord == ""){
      this.loadLibrary(0)
      return new Success(null)
    }
    let res = await axios.get(this.global.SERVER_HOST + "/book/library/search/" + librarySearchWord).then((res) => {
      if (res.data.status) {
        var libraryBooks = res.data.returnObj
        for (let i in libraryBooks) {
          var book = libraryBooks[i]
          book.storage = {}
          this.thumbnailLoad(book)
        }
        this.library = libraryBooks
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
