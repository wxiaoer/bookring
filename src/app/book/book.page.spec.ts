import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BookPage } from './book.page';

describe('BookPage', () => {
  let component: BookPage;
  let fixture: ComponentFixture<BookPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
