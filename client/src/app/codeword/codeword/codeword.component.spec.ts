import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodewordComponent } from './codeword.component';

describe('CodewordComponent', () => {
  let component: CodewordComponent;
  let fixture: ComponentFixture<CodewordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodewordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodewordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
