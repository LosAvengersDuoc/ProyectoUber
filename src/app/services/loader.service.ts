import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(private loadingController: LoadingController) {}

  async show(message: string) {
    if (!this.loading) {
      this.loading = await this.loadingController.create({
        message: message,
        spinner: 'circles', // Puedes cambiar el spinner
        duration: 5000, // Tiempo máximo opcional, en caso de que se olvide ocultar manualmente
      });
      await this.loading.present();
    }
  }

  async hide() {
    if (this.loading) {
      // Garantizar que el loader esté visible por al menos 1 segundo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.loading.dismiss();
      this.loading = null;
    }
  }
}
