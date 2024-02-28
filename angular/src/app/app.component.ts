import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  receivedValue: { param: number }={param:0};

  title = 'hts';


  playAudio() {
    const audio = new Audio('../assets/loginAudio.mp3');
    audio.autoplay = true;
    audio.muted = false;
    audio.loop = true;

    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  }


  handleValueChanged(event: { param: number }) {
    // Funkcija koja se poziva kada child komponenta emituje vrednost
    this.receivedValue = event;
    console.log('Received value in parent component:', event);
  }
}
