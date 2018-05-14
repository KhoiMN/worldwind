import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { PubNubAngular } from 'pubnub-angular2';

import * as WorldWind from '@nasaworldwind/worldwind';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	
	
	pubnub: PubNubAngular;
	channel = 'Channel-piayc3ies';
	//channel = 'gps_channel';
	
	latitude = 28.5383,
    longitude = -81.3792;
	placemark; 
	placemarkLayer;
	
	height = 600; 
	
  @ViewChild('scene') scene: ElementRef;

 constructor(pubnub: PubNubAngular) {
	  
	 // this.channel = 'Channel-piayc3ies';
	 // this.channel = 'gps_channel';
        this.pubnub = pubnub;
        this.pubnub.init({
            publishKey: 'pub-c-a664e4c4-c044-47ee-8a63-b1a352660e59',
            subscribeKey: 'sub-c-92284efc-4d4a-11e8-8601-a29164142108'
        });
        this.pubnub.subscribe({
            channels: [this.channel],
            triggerEvents: ['message']
        });
  }
  
  
  ngOnInit() {
    // const wwd = WorldWind.WorldWindow(this.scene.nativeElement);
    // This will work with the next release of WebWorldWind, which supports an
    // actual element instead of the ID as a string.
    // In the meantime, the ID must be used and makes the component not easily
    // reusable.
	
    const wwd = new WorldWind.WorldWindow('scene');
	
	wwd.navigator.lookAtLocation.latitude = 28.5383;
	wwd.navigator.lookAtLocation.longitude = -81.3792;
	wwd.navigator.range = this.height; // 2 million meters above the ellipsoid
	
    var layers = [
            {layer: new WorldWind.BMNGLayer(), enabled: true},
            {layer: new WorldWind.BMNGLandsatLayer(), enabled: true},
            {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }
	
	
	  var images = [
            "plain-black.png",
            "plain-blue.png",
            "plain-brown.png",
            "plain-gray.png",
            "plain-green.png",
            "plain-orange.png",
            "plain-purple.png",
            "plain-red.png",
            "plain-teal.png",
            "plain-white.png",
            "plain-yellow.png",
            "castshadow-black.png",
            "castshadow-blue.png",
            "castshadow-brown.png",
            "castshadow-gray.png",
            "castshadow-green.png",
            "castshadow-orange.png",
            "castshadow-purple.png",
            "castshadow-red.png",
            "castshadow-teal.png",
            "castshadow-white.png"
        ];

        var pinLibrary = WorldWind.WWUtil.currentUrlSansFilePart() + "/../images/pushpins/", // location of the image files
		//var pinLibrary = "images/images/pushpins/",
         
            placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
            highlightAttributes,
            this.placemarkLayer = new WorldWind.RenderableLayer("Placemarks");
			
		//console.log (WorldWind.configuration.baseUrl); 

        // Set up the common placemark attributes.
        placemarkAttributes.imageScale = 1;
        placemarkAttributes.imageOffset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.3,
            WorldWind.OFFSET_FRACTION, 0.0);
        placemarkAttributes.imageColor = WorldWind.Color.WHITE;
        placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 1.0);
        placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
        placemarkAttributes.drawLeaderLine = true;
        placemarkAttributes.leaderLineAttributes.outlineColor = WorldWind.Color.RED;
		
		
		//for (var i = 0, len = images.length; i < len; i++) {
            // Create the placemark and its label.
            this.placemark = new WorldWind.Placemark(new WorldWind.Position(this.latitude, this.longitude, 1e2), true, null);
            this.placemark.label = "Placemark \n"
                + "Lat " + this.placemark.position.latitude.toPrecision(4).toString() + "\n"
                + "Lon " + this.placemark.position.longitude.toPrecision(5).toString();
            this.placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

            // Create the placemark attributes for this placemark. Note that the attributes differ only by their
            // image URL.
            placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            placemarkAttributes.imageSource = pinLibrary + images[7];
            this.placemark.attributes = placemarkAttributes;

            // Create the highlight attributes for this placemark. Note that the normal attributes are specified as
            // the default highlight attributes so that all properties are identical except the image scale. You could
            // instead vary the color, image, or other property to control the highlight representation.
            highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            highlightAttributes.imageScale = 1.2;
            this.placemark.highlightAttributes = highlightAttributes;

            // Add the placemark to the layer.
            this.placemarkLayer.addRenderable(this.placemark);
        //}

        // Add the placemarks layer to the WorldWindow's layer list.
        wwd.addLayer(this.placemarkLayer);

    wwd.redraw();
	
	
	//--------------------PUBNUB get data-----------------------------
	
	this.pubnub.getMessage(this.channel, (msg) => {
			
			let  d = new Date();
			let  message =  msg.message;
			//console.log(msg); 
			console.log(message.LAT + ",  " + message.LONG + ", " + message.ALTITUDE);
			console.log(message.x + "," + message.y + "," + message.z);
			console.log(d.getTime());
			
			//var p  = new google.maps.LatLng(message.lat, message.lng);
			
			//var p = new google.maps.LatLng(message.lat, message.lng); 
			let p  = {lat : message.LAT, lng : message.LONG};
			
			this.latitude = parseFloat(message.LAT);
			this.longitude = parseFloat(message.LONG);
			
			this.placemark.position.latitude = this.latitude; 
			this.placemark.position.longitude = this.longitude; 
			
			this.placemarkLayer.addRenderable(this.placemark);
			//wwd.addLayer(this.placemarkLayer);
			
			wwd.navigator.lookAtLocation.latitude = this.latitude;
			wwd.navigator.lookAtLocation.longitude = this.longitude;
			wwd.navigator.range = this.height; // 2 million meters above the ellipsoid
			
			wwd.redraw();
			  
			//this.current.lat = parseFloat(p.lat); 
			//this.current.lng = parseFloat(p.lng); 
			
			//this.coordinates.push(p); 
			
			//this.marker.setPosition({lat:  parseFloat(p.lat), lng:  parseFloat(p.lng)});
			//this.map.setCenter({lat:  parseFloat(p.lat), lng:  parseFloat(p.lng)});
			
			//console.log (p.lat + ' , ' + p.lng); 
			
		});
	
	
  }
}