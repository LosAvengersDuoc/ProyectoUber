import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotifPage } from './notif.page';

describe('NotifPage', () => {
  let component: NotifPage;
  let fixture: ComponentFixture<NotifPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
