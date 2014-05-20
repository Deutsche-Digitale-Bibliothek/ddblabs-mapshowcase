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
//
*/
DDB.Search = OpenLayers.Class(OpenLayers.Control, {
    initialize : function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        $(this.div).html()
        $("#search-things").click(function(){
            $("#search_form").submit();
        })
        $("#slider-range").slider({
            range: true,
            min: DDB.globals['minyear'],
            max: DDB.globals['maxyear'],
            values: [DDB.globals['minyear'], DDB.globals['maxyear']],
            slide: function (event, ui) {
                $("#amount").val(ui.values[0] + " - " + ui.values[1]);
            },
            stop: function( event, ui ) {
                $("#search_form").submit();
            }
        });
        $("#apisearchfiltercheck").change(function(){
            $("#search_form").submit();
        });
        $("#amount").val($("#slider-range").slider("values", 0) +
            " - " + $("#slider-range").slider("values", 1));
        var self = this;
        $("#search_form").submit(function(){
            self.api_search.call(self);
            return false;
        })
        var style = new OpenLayers.Style({
                    strokeColor   : "rgb(165,0,59)",
                    strokeWidth   : 2,
                    strokeOpacity : 1.0,
                    fillColor     : "rgb(240,99,115)",
                    fillOpacity   : 0.4,
                    pointRadius   : "${getRadius}",
                },{
                    context : {
                        getRadius : function(feature){
                            var radius = 17;
                            if (feature.data.count == 1) {
                                radius = 7;
                            }
                            else if (feature.data.count <= 5) {
                                radius = 9;
                            }
                            else if (feature.data.count <= 50) {
                                radius = 11;
                            }
                            else if (feature.data.count <= 100) {
                                radius = 13;
                            }
                            else if (feature.data.count <= 200) {
                                radius = 15;
                            }
                            if (DDB.globals.mobile) {
                                radius = radius*2;
                            }
                            return radius
                        }
                    }
                })
        this.vector = new OpenLayers.Layer.Vector("vectorlayer", {
            visibility:true,
            displayInLayerSwitcher:false,
            isBaseLayer:false,

            styleMap : new OpenLayers.StyleMap({
                //Docs: http://dev.openlayers.org/apidocs/files/OpenLayers/Symbolizer/Point-js.html
                //Andere styles sind möglich.
                'default' : style,
                'temporary' : style,
                'select' : style
            }),

            eventListeners : {
                featureselected: function(evt){
                    var f = arguments[0].feature
                    var l = f.data.ids
                    if (self.selectedFeature && self.selectedFeature.layer) {
                        self.selectControl.unselect(self.selectedFeature);
                    }
                    var lonlat = new OpenLayers.LonLat(
                                evt.feature.geometry.x,
                                evt.feature.geometry.y
                    );
                    if (!DDB.globals.mobile) {

                        var html = '';

                        if (l.length == 1) {
                            html = $.ajax({
                                url: DDB.globals['get_url'] +'/'+ l[0][0],
                                data:{
                                    'format':'html',
                                },
                            dataType: 'html',
                            success: function(data){
                                var popup = new OpenLayers.Popup.FramedDDB(
                                    'ddbpopup',
                                    lonlat,
                                    new OpenLayers.Size(450, 450),
                                    data,
                                    null, //{size: {w: 14, h: 14}, offset: {x: -7, y: -7}},
                                    true,
                                    function(){
                                        if (evt.feature.popup) {
                                            self.selectControl.unselect(evt.feature);
                                        }
                                    },
                                    "./static/img/"
                                );

                                evt.feature.popup = popup;
                                DDB.map.addPopup(popup, true);
                            }
                        })
                        } else {
                            html += '<div class="ddbPopupTitle">';
                            html += l.length
                            html += ' Ergebnisse</div><div id="tablewrapper"><table>';
                            for (i=0;i<l.length;i++){
                                if (i > 15) {
                                     html += '<tr><td colspan="2">' + (l.length - 15) + ' weitere Ergebnisse.</td></tr>';
                                    break;
                                }
                                html += '<tr>';
                                html += '<td class="olPopupDDBArrow">&nbsp;</td>';
                                html += '<td><a href="'+ DDB.globals['apiitem_url'] + l[i][0] + '" target="_blank" class="label">' + l[i][1] + '</a></td>';
                                html += '</tr>';
                            }
                            html += '</table></div>';
                            var popup = new OpenLayers.Popup.FramedDDB(
                                'ddbpopup',
                                lonlat,
                                new OpenLayers.Size(450, 450),
                                html,
                                null, //{size: {w: 14, h: 14}, offset: {x: -7, y: -7}},
                                true,
                                function(){
                                    if (evt.feature.popup) {
                                        self.selectControl.unselect(evt.feature);
                                    }
                                },
                                "./static/img/"
                            );

                            evt.feature.popup = popup;
                            DDB.map.addPopup(popup, true);
                        }
                    }
                    else  {

                        var html = '';

                        if (l.length == 1) {
                            html = $.ajax({
                                url: DDB.globals['get_url'] +'/'+ l[0][0],
                                data:{
                                    'format':'html',
                                },
                                dataType: 'html',
                                success: function(data){
                                    $("#multi-details").empty().html(data);
                                  $.mobile.navigate( "#popup" );

                                }
                            })
                        } else {
                            $("#multi-popup").find("h1").html(Math.min(15, l.length)+' von '+l.length+ ' Ergebnissen');
                            var html = "";

                            for (i=0;i<Math.min(15, l.length);i++){
                                html += '<li><a href="'+ DDB.globals['apiitem_url'] + l[i][0] + '" target="_blank" class="label">' + l[i][1] + '</a></li>';

                            }
                            $("ul#multi-details-list").html("")
                            $("ul#multi-details-list").append(html);
                            try{
                                $("ul#multi-details-list").listview("refresh");
                            }
                            catch(err){
                                    
                            }
                            $.mobile.navigate( "#multi-popup" );
                        }
                    }
                    self.selectedFeature = f;
                },
                featureunselected: function(evt){
                    if(evt.feature.popup) {
                        DDB.map.removePopup(evt.feature.popup);
                    }
                }
            }
        })
        this.searchBoxVector =  new OpenLayers.Layer.Vector("searchBox",{
            visibility:true,
            displayInLayerSwitcher:false,
            isBaseLayer:false,
            styleMap : new OpenLayers.StyleMap({
                'default' : new OpenLayers.Style({
                    strokeColor : "#000000",
                    strokeWidth : 2,
                    strokeOpacity : 0.2,
                    fillColor : "#000044",
                    fillOpacity : 0.05,

                },{
                    context : {
                        getRadius : function(feature){
                            return 7-5.3/feature.data.count
                        }
                    }
                }),
            })
        })
        this.format = new OpenLayers.Format.GeoJSON({
        });
    },
    setMap : function(){
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.on({
            "zoomend" : this.api_search,
            scope:this
        })
        this.hoverControl = new OpenLayers.Control.SelectFeature([this.vector], {
            hover : true,
            highlightOnly : true,
            renderIntent : "temporary",
            eventListeners : {
                beforefeaturehighlighted : function(event) {
                    if ( typeof event.feature.layer.eventListeners != "undefined" && event.feature.layer.eventListeners != null && "featurehighlighted" in event.feature.layer.eventListeners) {
                        event.feature.layer.eventListeners.featurehighlighted(event)
                    }
                },
                featureunhighlighted : function(event) {
                    if ( typeof event.feature.layer.eventListeners != "undefined" && event.feature.layer.eventListeners != null && "featureunhighlighted" in event.feature.layer.eventListeners) {
                        event.feature.layer.eventListeners.featureunhighlighted(event)
                    }
                }
            }
        });

        this.map.addLayers([this.vector])
        this.map.addLayers([this.searchBoxVector])
        this.map.addControl(this.hoverControl);
        this.hoverControl.activate();
        this.selectControl = new OpenLayers.Control.SelectFeature([this.vector], {
            clickout : true,
            toggle : false,
            multiple : true,
            hover : false,
            toggleKey : "ctrlKey", // ctrl key removes from selection
            multipleKey : "shiftKey" // shift key adds to selection
        });
        this.map.addControl(this.selectControl);
        this.selectControl.activate()

    },
    rc:0,
    api_search : function(e){
        var isEvent = false
        if (typeof e != "undefined") {
            isEvent=true;
        }
        var rc = this.rc+1;
        this.rc = rc;
        var self = this;
        window.setTimeout(
            function(){
                if (rc == self.rc){
                    self._api_search.call(self, rc, isEvent)
                }
            }, 50
        )
    },
    last_params : null,
    _api_search: function(rc, isEvent){
        var params = {}
        if (!isEvent) {
            params.query = $("#apisearchinput").val();
            params.filtercheckbox = $("#apisearchfiltercheck").prop('checked');
            params.filterdatum = $("#amount").val();
            if (DDB.globals.mobile) {
            params.filtercheckbox = false
            params.filterdatum = "1 - 2011"
            params.query = $("#ddbquery").val()
            }
            var e = this.map.getExtent();
            params.bbox = e.left+","+e.bottom+","+e.right+","+e.top;
            params.format = "json"

            params.radius = 60
            if (DDB.globals.mobile) {
                params.radius = 130
            }
            var searchBox = new OpenLayers.Feature.Vector(
                                OpenLayers.Geometry.fromWKT(
                                "POLYGON(("+e.left+" "+e.bottom+","+e.left+" "+e.top+","+e.right+" "+e.top+","+e.right+" "+e.bottom+","+e.left+" "+e.bottom+"))"
                            ));
            this.searchBoxVector.removeAllFeatures()
            this.searchBoxVector.addFeatures([searchBox]);
            this.last_params = params

        }
        else if (this.last_params == null){
            return;
        }
        else{
            params = this.last_params;
        }
        params.resolution = this.map.getResolution();
        var self = this;
        $('#ajax-loader').fadeIn(50);
        $.get(DDB.globals.search_url, params, function(data){
            self.api_search_callback.call(self, data, rc)
        })
    },
    api_search_callback: function(d, rc){
        if (rc == this.rc) {
            this.selectControl.unselectAll();
            this.vector.removeAllFeatures();
            this.vector.addFeatures(this.format.read(d));
            $('#ajax-loader').fadeOut(50);
            if (DDB.globals.mobile) {
                $.mobile.navigate( "#mappage" );
            }
        }
    },

})
