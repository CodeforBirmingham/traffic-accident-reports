(function () {
    "use strict";

    TrafficAccidents.getTrafficAccidents(function (err, trafficAccidentFacts) {

        var trafficAccidents, locationDimension, trafficAccidentsByLocation, baseLayer, heatmapLayer, map, heatmapData;

        trafficAccidents = crossfilter(trafficAccidentFacts);

     // Create dimension on location.
        locationDimension = trafficAccidents.dimension(function (trafficAccident) {
            return trafficAccident.location;
        });

     // MapReduce: group by location, reduce to count while keeping lat and lng.
        trafficAccidentsByLocation = locationDimension.group().reduce(function (p, v) {
            p.lat = v.coordinates.latitude;
            p.lng = v.coordinates.longitude;
            p.count = p.count + 1;
            return p;
        }, function (p, v) {
            p.count = p.count - 1;
            return p;
        }, function () {
            return {
                count: 0
            }
        });

        baseLayer = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "...",
            maxZoom: 18
        });

        heatmapLayer = new HeatmapOverlay({});

        map = L.map("heatmap", {
            center: L.latLng(33.5250, -86.8130),
            zoom: 12,
            minZoom: 12,
            layers: [baseLayer, heatmapLayer]
        });

        heatmapData = {
            data: trafficAccidentsByLocation.all().map(function (location) {
                return {
                    lat: location.value.lat,
                    lng: location.value.lng,
                    value: location.key,
                    radius: location.value.count
                };
            })
        };

        heatmapLayer.setData(heatmapData);

    });

}());
