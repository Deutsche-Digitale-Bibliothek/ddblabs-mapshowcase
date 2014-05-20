/*
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
*/

// Start with the map page
window.location.replace(window.location.href.split("#")[0] + "#mappage");

var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");
var selectedFeature = null;
jQuery(document).on("mobileinit", function() {
    jQuery.mobile.autoInitializePage = false;
});
loaded = false;
// fix height of content
function fixContentHeight() {
    var footer = $("div[data-role='footer']:visible"),
        content = $("div[data-role='content']:visible:visible"),
        viewHeight = $(window).height(),
        contentHeight = viewHeight - footer.outerHeight();

    if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
        contentHeight -= (content.outerHeight() - content.height() + 1);
        content.height(contentHeight);
    }

    if (window.map && window.map instanceof OpenLayers.Map) {
        map.updateSize();
    } else {
        // initialize map
        if (!loaded) {
            initialize_map();
            initLayerList();
            loaded = true
        }
        /*init(function(feature) {
            selectedFeature = feature;
            $.mobile.changePage("#popup", "pop");
        });*/
    }
}
$(function(){
    // one-time initialisation of button handlers

    $("#plus").on('click', function(){
        //DDB.map.zoomIn.call(DDB.map);
        DDB.map.setCenter(null, DDB.map.getZoom()+1);
        var zoom = DDB.map.getZoom() + 1//(DDB.map.getNumZoomLevels() - 1) - levels;
        zoom = Math.min(Math.max(zoom, 0), DDB.map.getNumZoomLevels() - 1);
        DDB.map.zoomTo(zoom);
    });

    $("#minus").on('click', function(){
        DDB.map.zoomOut.call(DDB.map);
    });

    $("#locate").on('click',function(){
        var control = DDB.map.getControlsBy("id", "locate-control")[0];
        if (control.active) {
            control.getCurrentLocation();
        } else {
            control.activate();
        }
    });

    //fix the content height AFTER jQuery Mobile has rendered the map page
    $('#mappage').on('pageshow',function (){
        fixContentHeight();
    });

    $(window).bind("orientationchange resize pageshow", fixContentHeight);



    /*$('#popup').on('pageshow',function(event, ui){
        var li = "";
        for(var attr in selectedFeature.attributes){
            li += "<li><div style='width:25%;float:left'>" + attr + "</div><div style='width:75%;float:right'>"
            + selectedFeature.attributes[attr] + "</div></li>";
        }
        $("ul#details-list").empty().append(li).listview("refresh");
    });*/

    $('#search_places').on('click',function(event, ui){
        $('#search_results').empty();
        if ($('#query')[0].value === '') {
            return;
        }
        //$.mobile.showPageLoadingMsg();
        // Prevent form send
        event.preventDefault();
        var searchUrl = 'http://nominatim.openstreetmap.org/search?limit=10&format=json&email=info%40webgis.de&bounded=1&viewbox=7.7447%2C+51.6721%2C+10.252%2C+49.3856';
        searchUrl += '&q=' + $('#query')[0].value;
        $.getJSON(searchUrl, function(data) {
            $.each(data, function() {
                var place = this;
                $('<li>')
                    .hide()
                    .append($('<h2 />', {
                        text: place.display_name
                    }))
                    //.append($('<p />', {
                     //   html: '<b>' + place.countryName + '</b> ' + place.fcodeName
                    //}))
                    .appendTo('#search_results')
                    .click(function() {
                        $.mobile.changePage('#mappage');
                        var lonlat = new OpenLayers.LonLat(place.lng, place.lat);
                        var bb = place.boundingbox;
                        DDB.map.zoomToExtent(new OpenLayers.Bounds(bb[2],bb[0],bb[3],bb[1]).transform(DDB.geographic, DDB.map.getProjectionObject()))
                        DDB.map.setCenter(lonlat.transform(gg, sm), 10);
                    })
                    .show();
            });
            $('#search_results').listview('refresh');
            //$.mobile.hidePageLoadingMsg();
        });
    });
});

function initLayerList() {
    $('#layerspage').page();
    $('<li>', {
            "data-role": "list-divider",
            text: "Base Layers"
        })
        .appendTo('#layerslist');
    for (layer_idx in DDB.map.layers) {
        var layer = DDB.map.layers[layer_idx]
        if (layer.isBaseLayer && layer.displayInLayerSwitcher) {
            addLayerToList(layer);
        }
    }

    $('<li>', {
            "data-role": "list-divider",
            text: "Overlay Layers"
        })
        .appendTo('#layerslist');
   for (layer_idx in DDB.map.layers) {
        var layer = DDB.map.layers[layer_idx]
        if (!layer.isBaseLayer && layer.displayInLayerSwitcher) {
            addLayerToList(layer);
        }
    }
    $('#layerslist').listview('refresh');

    DDB.map.events.register("addlayer", this, function(e) {
        addLayerToList(e.layer);
    });
}

function addLayerToList(layer) {
    var item = $('<li>', {
            "data-icon": "check",
            "class": layer.visibility ? "checked" : ""
        })
        .append($('<a />', {
            text: layer.name
        })
            .click(function() {
                $.mobile.changePage('#mappage');
                if (layer.isBaseLayer) {
                    layer.map.setBaseLayer(layer);
                } else {
                    layer.setVisibility(!layer.getVisibility());
                }
            })
        )
        .appendTo('#layerslist');
    layer.events.on({
        'visibilitychanged': function() {
            $(item).toggleClass('checked');
        }
    });
}
