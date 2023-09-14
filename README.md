# Angular-Esri-Sketch-Tool

## Angular GIS Mapping Component

![Angular Version](https://img.shields.io/badge/Angular-12.0.0-blue.svg)
![ArcGIS API for JavaScript Version](https://img.shields.io/badge/ArcGIS%20API-4.20.0-green.svg)

This Angular component provides an interactive GIS mapping experience using the ArcGIS API for JavaScript. It allows users to draw points on the map, create buffer zones, and more.

## Features

- **Mapping**: Display a map with a specified basemap (default is 'topo-vector').
- **Drawing**: Users can draw points on the map using the Sketch widget.
- **Buffering**: Calculate buffer zones around drawn points based on user-defined radius.
- **Basemap Toggle**: Switch between different basemaps (e.g., 'topo-vector' and 'satellite').

## Dependencies

- Angular 12
- ArcGIS API for JavaScript 4.20.0
- lodash (for debouncing)

## Installation

1. Clone this repository to your local machine.
2. Run `npm install` to install the project dependencies.
3. Run `ng serve` to start the development server.
4. Open your web browser and navigate to `http://localhost:4200/` to see the GIS mapping component in action.

## Usage

1. Include the `MapComponent` in your Angular application.
2. Use it in your template with `<app-map></app-map>`.

```html
<app-map></app-map>
```

## Configuration

1. The default center of the map is set to `[69, 30.5]` with a zoom level of `6`. You can modify this in the `ngOnInit` method of `map.component.ts`.

```javascript
const mapView = new MapView({
  container: this.mapViewEl.nativeElement,
  map,
  center: [69, 30.5], // Update this
  zoom: 6, // Update this
});
```
2. Basemaps can be switched using the BasemapToggle widget. The initial basemap is set to `topo-vector`, and the toggle allows switching to `satellite`.

```javascript
const basemapToggle = new BasemapToggle({
  view: mapView,
  nextBasemap: 'satellite', // Update this for your desired basemap
});
```

## Customization

You can customize this Angular GIS mapping component further by modifying the code in `map.component.ts`. Customize drawing tools, symbols, and other functionality to suit your specific GIS needs.

