<!--
// Copyright 2014 in medias res Gesellschaft fuer Informationstechnologie mbH
// The ddb project licenses this file to you under the Apache License,
// version 2.0 (the "License"); you may not use this file except in compliance
// with the License. You may obtain a copy of the License at:
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.
-->

function initialize_map() {
    DDB.geographic = new OpenLayers.Projection("EPSG:4326");
    DDB.mercator = new OpenLayers.Projection("EPSG:900913");
    DDB.bounds = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);
    DDB.initial_bounds = new OpenLayers.Bounds(6153486.5242131,	314309.06026487, 1984916.7502331, 6954546.5805303)
    DDB.center = new OpenLayers.LonLat( 1007440.0326582, 6473299.05)
    DDB.nominatimController = new NominatimController({
        object_name : "nominatimController",
        div:"nominatim_controller",
        result_div: "nominatim_result_list"
    })
    window.nominatimController = DDB.nominatimController
    DDB.osm = new OpenLayers.Layer.OSM(
        "OpenStreetMap", null,
        {
            numZoomLevels: 18,
            maxZoomLevel: 17,
            visibility: false,
            animationEnabled: false,
            maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34)
        }
    );
    DDB.map = new OpenLayers.Map({
        div: "map",
        controls: [
            new OpenLayers.Control.Navigation({
                dragPanOptions: {
                    enableKinetic: false
                }
            }),
            new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.ScaleLine(),
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.Permalink(),
            new OpenLayers.Control.MousePosition(),
            new OpenLayers.Control.OverviewMap({
                div: document.getElementById('overview-map'),
                size: new OpenLayers.Size(240, 200),
                mapOptions: {
                    projection: DDB.mercator,
                    units: "m",
                    maxExtent: DDB.bounds,
                    restrictedExtent: DDB.bounds
                }
            }),
            DDB.nominatimController,
            new DDB.Search({div:document.getElementById("ddbsearch")})
        ],
        transitionEffect: null,
        zoomMethod: null,
        zoomDuration: 10,
        numZoomLevels: 22,
        projection: DDB.mercator,
        displayProjection: DDB.geographic,
        units: 'm'
    });
    DDB.map.addLayer(DDB.osm);
    if (!DDB.map.getCenter()) {
        DDB.map.zoomToExtent(DDB.initial_bounds);
    }
    DDB.poivectorlayer = new OpenLayers.Layer.Vector({
        isBaseLayer: false,
        visibility: true
    })
    DDB.map.addLayer(DDB.poivectorlayer);
    DDB.map.setCenter(DDB.center, 8);

    DDB.hillshade = new OpenLayers.Layer.WMS(
        "Hillshade",
        "http://129.206.228.72/cached/hillshade",
        {
            "layers": "europe_wms:hs_srtm_europa",
            "transparent":"true",
            "format":"image/png",
            "isBaseLayer":"false"
        }
    )
    DDB.hillshade.setOpacity(0.23);
    DDB.hillshade.setVisibility(false);
    DDB.map.addLayer(DDB.hillshade);

    DDB.osmworld = new OpenLayers.Layer.WMS(
            "OSM - Worldwide",
            "http://129.206.228.72/cached/osm",
            {
                layers: "osm_auto:all",
                "isBaseLayer":"false"
            }
            )
    DDB.osmworld.setVisibility(false);
    DDB.map.addLayer(DDB.osmworld);

}
