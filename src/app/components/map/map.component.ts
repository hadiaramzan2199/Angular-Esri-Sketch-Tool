import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import { debounce } from 'lodash';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  private drawnPoints: any[] = [];
  private drawnShapes: any[] = [];
  private debouncedProcessDrawnShapes: any;
  public graphicsLayer = new GraphicsLayer();
  public radiusInput: number = 1000;
  private drawnPointGeometry: any; // To store drawn point geometry
  public isPointDrawn: boolean = false;

  constructor() {
    this.debouncedProcessDrawnShapes = debounce(this.processDrawnShapes, 500);
  }

  ngOnInit() {
    const map = new Map({
      basemap: 'topo-vector',
      layers: [this.graphicsLayer]
    });

    const mapView = new MapView({
      container: this.mapViewEl.nativeElement,
      map,
      center: [69, 30.5],
      zoom: 6
    });

    const basemapToggle = new BasemapToggle({
      view: mapView,
      nextBasemap: 'satellite'
    });

    mapView.ui.add(basemapToggle, 'bottom-right');

    mapView.when(() => {
      const sketch = new Sketch({
        layer: this.graphicsLayer,
        view: mapView,
        creationMode: 'update',
        visibleElements: {
          createTools: {
            rectangle: false,
            polyline: false,
            circle: false
          },
          selectionTools: {
            "lasso-selection": false,
            "rectangle-selection": false,
          },
          undoRedoMenu: false,
          settingsMenu: false
        }
      });

      mapView.ui.add(sketch, 'top-right');

      sketch.on('create', (event) => {
        if (event.state === 'complete') {
          this.debouncedProcessDrawnShapes(event.graphic.geometry, "red");
          this.drawnPointGeometry = event.graphic.geometry;
          this.isPointDrawn = true;
        }
      });
    });
  }

  onRadiusInputChange() {
    this.graphicsLayer.removeAll(); // Clear previous graphics

    const pointSymbol = new SimpleMarkerSymbol({
      style: "circle",
      color: "red",
      size: 10,
      outline: {
        color: [255, 255, 255],
        width: 1
      }
    });
    const pointGraphic = new Graphic({
      geometry: this.drawnPointGeometry,
      symbol: pointSymbol
    });
    this.graphicsLayer.add(pointGraphic);

    const bufferGeometry = this.createBuffer(this.drawnPointGeometry, this.radiusInput);
    const bufferSymbol = new SimpleFillSymbol({
      color: [0, 0, 255, 0.5],
      outline: {
        color: [0, 0, 0, 1],
        width: 1
      }
    });
    const bufferGraphic = new Graphic({
      geometry: bufferGeometry,
      symbol: bufferSymbol
    });
    this.graphicsLayer.add(bufferGraphic);
  }

  private processDrawnShapes(geometry: any, color: string) {
    const shapeType = geometry.type;

    if (shapeType === 'point') {
      const { x, y } = geometry.toJSON();
      const pointCoordinates = { latitude: y, longitude: x };
      const pointSymbol = new SimpleMarkerSymbol({
        style: "circle",
        color: color,
        size: 10,
        outline: {
          color: [255, 255, 255],
          width: 1
        }
      });
      const pointGraphic = new Graphic({
        geometry: geometry,
        symbol: pointSymbol
      });

      this.graphicsLayer.add(pointGraphic);

      const bufferGeometry = this.createBuffer(geometry, this.radiusInput);
      const bufferSymbol = new SimpleFillSymbol({
        color: [0, 0, 255, 0.5],
        outline: {
          color: [0, 0, 0, 1],
          width: 1
        }
      });
      const bufferGraphic = new Graphic({
        geometry: bufferGeometry,
        symbol: bufferSymbol
      });

      this.graphicsLayer.add(bufferGraphic);

      if (!this.checkDuplicatePoint(pointCoordinates)) {
        this.drawnPoints.push(pointCoordinates);
        console.log(JSON.stringify(this.drawnPoints));
      }
    } else if (shapeType === 'polygon') {
      const rings = geometry.rings;
      const mainRingVertices = rings[0].map((vertex: any[]) => ({ latitude: vertex[1], longitude: vertex[0] }));
      const outlineSymbol = new SimpleLineSymbol({
        color: [0, 0, 255],
        width: 2
      });

      const polygonGraphic = new Graphic({
        geometry: geometry,
        symbol: outlineSymbol
      });

      this.graphicsLayer.add(polygonGraphic);

      if (
        mainRingVertices.length > 2 &&
        mainRingVertices[0].latitude === mainRingVertices[mainRingVertices.length - 1].latitude &&
        mainRingVertices[0].longitude === mainRingVertices[mainRingVertices.length - 1].longitude
      ) {
        mainRingVertices.pop();
      }

      if (!this.checkDuplicatePolygon(mainRingVertices)) {
        this.drawnShapes.push({ type: shapeType, vertices: mainRingVertices });
        console.log(JSON.stringify(this.drawnShapes));
      }
    }
  }

  private createBuffer(pointGeometry: any, radius: number): any {
    const bufferGeometry = geometryEngine.buffer(pointGeometry, radius, 'meters');
    return bufferGeometry;
  }

  private checkDuplicatePoint(newPoint: any): boolean {
    return this.drawnPoints.some(point => JSON.stringify(point) === JSON.stringify(newPoint));
  }

  private checkDuplicatePolygon(newPolygon: any[]): boolean {
    return this.drawnShapes.some(shape =>shape.type === 'polygon' && JSON.stringify(shape.vertices) === JSON.stringify(newPolygon)
    );
  }
}
