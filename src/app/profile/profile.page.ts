//@ts-nocheck
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FirebaseService, Summary } from '../firebase.service';
import { AlertController, GestureController, IonCard } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, AfterViewInit {
  userSummaries: Summary[] = [];
  @ViewChild('dropZone') drop: ElementRef;
  @ViewChildren('card', {read: ElementRef}) cards: QueryList<ElementRef>;

  contentscrollActive = true;
  gesturearray: Gesture[] = [];

  constructor(public fb: FirebaseService, public gestureCtrl: GestureController, public changeDetectorRef: ChangeDetectorRef, public alertCtrl: AlertController) { }

  ngOnInit() {
    this.fb.summaries$.subscribe((summaries) => {
      this.userSummaries = [];
      summaries.forEach((summary) => {
        if(summary.writer === this.fb.email){
          this.userSummaries.push(summary);
        }
      });
      
    });
  }
  ngAfterViewInit(): void { 
    this.updateGestures();
  }

  updateGestures(){
    this.gesturearray.map(gesture => gesture.destroy());
    this.gesturearray = [];
    const arr = this.cards.toArray();
    for (let i=0; i<arr.length; i++){
      const oneCard = arr[i];
      const drag = this.gestureCtrl.create({
        el: oneCard.nativeElement,
        threshold: 1,
        gestureName: 'drag',
        onStart: ev =>{
          oneCard.nativeElement.style.transition = '';
          oneCard.nativeElement.style.opacity = '0.5';
          oneCard.nativeElement.style.fontWeight = 'bold';
          this.changeDetectorRef.detectChanges();
        },
        onMove: ev => {
          oneCard.nativeElement.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
          oneCard.nativeElement.style.zIndex = 11; 
          this.checkDropZoneHover(ev.currentX,ev.currentY);
        },
        onEnd: ev => {
          this.handleDrop(oneCard,ev.currentX,ev.currentY,i);
        }
      });
      drag.enable();
      this.gesturearray.push(drag);
    }
    this.cards.changes.subscribe(res =>{
      this.updateGestures();
    });
  }
  checkDropZoneHover(x,y){
    const drop = this.drop.nativeElement.getBoundingClientRect();
    if (this.isInZone(x,y,drop)) {
      this.drop.nativeElement.style.color= '#c5000f';
    } 
    else{
      this.drop.nativeElement.style.color= '#2f2f2f';
    }
  }

  isInZone(x,y,dropzone){
    if(x < dropzone.left || x >= dropzone.right){
      return false;
    }
    if(y < dropzone.top || y >= dropzone.bottom){
      return false;
    }
    return true;
  }

  // Decide what to do with dropped card
  async handleDrop(card, endX, endY, index){
    const drop = this.drop.nativeElement.getBoundingClientRect();
    if (this.isInZone(endX,endY,drop)) {
      let choice = await this.alertCtrl.create({
        header: "Are you sure you want to delete the post?",
        buttons: [
          {text:"Yes", handler:() => {
            const removedcard = this.userSummaries[index] as Summary;
            card.nativeElement.remove();
            this.userSummaries.splice(index, 1);
            this.fb.deleteSummary(removedcard);
          }},
          {text:"No", handler:() => {
            card.nativeElement.style.transition = '.2s ease-out';
            card.nativeElement.style.zIndex = 'inherit';
            card.nativeElement.style.transform = `translate(0,0)`;
            card.nativeElement.style.opacity = '1';
            card.nativeElement.style.fontWeight = 'normal';
          }}
        ]
      });
      await choice.present();
    }
    // don't drop it in a zone, bring it back to the initial position
    else {
      card.nativeElement.style.transition = '.2s ease-out';
      card.nativeElement.style.zIndex = 'inherit';
      card.nativeElement.style.transform = `translate(0,0)`;
      card.nativeElement.style.opacity = '1';
      card.nativeElement.style.fontWeight = 'normal';
    }
    this.drop.nativeElement.style.color = '#2f2f2f';
    this.updateGestures();
  }
   
  

}
