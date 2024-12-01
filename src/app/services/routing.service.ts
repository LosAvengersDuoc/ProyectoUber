import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  private baseUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';

  constructor(private http: HttpClient) {}

  getRoute(start: [number, number], end: [number, number]) {
    const url = `${this.baseUrl}?api_key=${environment.orsApiKey}&start=${start.join(',')}&end=${end.join(',')}`;
    return this.http.get(url);
  }
}
