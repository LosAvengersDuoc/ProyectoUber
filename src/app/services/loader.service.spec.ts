import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(private loadingController: LoadingController) {}

  async show(message: string = 'Cargando...') {
    if (!this.loading) {
      this.loading = await this.loadingController.create({
        message,
        spinner: 'crescent', // Usa 'crescent' para una ruedita giratoria.
        translucent: true,
        backdropDismiss: false
      });
      await this.loading.present();
    }
  }

  async hide() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }
}
