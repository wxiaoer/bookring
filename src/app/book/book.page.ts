import { Component, OnInit, Input, NgModule } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BookringService } from '../services/bookring.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})

export class BookPage implements OnInit {

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {
    this.pdfSrc = {url:this.book.url,withCredentials: true}
  }

  @Input() book: any;
  // pdfSrc = "https://gitee.com/zhangdong2022/test_pdf_file_download/raw/master/test_pdf_download.pdf"
  pdfSrc = {url:"",withCredentials:false}

  async dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  
}
