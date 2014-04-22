var NominatimController = OpenLayers.Class(OpenLayers.Control, {
    initialize : function(options) {

        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        var div_id_string = "nominatim_controller";
        this.object_name = options.object_name;
        if (!("div" in options)){
            div_id_string = options.div;
        }
        this.$div = $("#"+div_id_string);
        var self = this;
        this.response= function(){
            self.requestResponse.apply(self, arguments)
        }
        this.$div.append(
            "<iframe id='responseNominatim' name='responseNominatim' style='display:none'></iframe>"+
            "<form target='responseNominatim' action='" + DDB.globals['nominatim_url'] + "'>"+
            "<input name='q' value='' type='text'/>"+
            "<input type='hidden' name='json_callback' value='"+this.object_name+".response' />" +
            "<input type='hidden' name='format' value='json' />" +
            "<input type='hidden' name='countrycodes' value='de,ch,cz,at,sk,rs,hu,ro,hr,bg'/>" +
            "<input type='hidden' name='limit' value='10' />" +
            "<input type='hidden' name='polygon' value='0' />" +
            "<input type='hidden' name='addressdetails' value='1' />" +
        "<input type='submit' id='submit_search' value='Find place...' class='nominatim_submit_search'/>");

        this.$result_list = $("#"+options.result_div);
        this.$result_list.append("<ul>")
        this.$queryInput = this.$div.find("form").find("[name=q]")

        this.$div.find("form").submit(function(){
            var url = $(this).attr("action")+$(this).serialize()
            $("head").append("<script type='text/javascript' src='"+url+"'></script>")
            return false;
        });
    },

    requestResponse : function(d) {

    function shrinkMarker(feature) {
      var decRadius = 1;
      var decOpacity = 0.01;
      if (feature.style.pointRadius > 10) {
        feature.style.pointRadius -= decRadius;
        feature.style.fillOpacity -= decOpacity;
        feature.layer.drawFeature(feature);
      }
      else {
        clearInterval(feature.TimerID);
      }
    }

        var self = this;
        var $ul = this.$result_list.find("ul")
        $ul.html("");
        if (d.length < 1) {
            $ul.append("<ul><i>...no results</i></ul>");
        }
        for (var i = 0; i < d.length; i++) {

            var $new_link = $("<li><a href='#'>" + d[i].display_name + "</a></li>")
            $ul.append($new_link)
            var after_click = function($new_link, data){
                $new_link.find("a").click(
                    function(){
                        if (data.osm_type=="node"){
                            var lonLat = new OpenLayers.LonLat(data.lon, data.lat).transform(DDB.geographic, self.map.getProjectionObject());
                            self.map.setCenter(lonLat, 15);
                        }
                        else{
                            var bb = data.boundingbox;
                            self.map.zoomToExtent(new OpenLayers.Bounds(bb[2],bb[0],bb[3],bb[1]).transform(DDB.geographic, self.map.getProjectionObject()))
                        }
                        var markerlayer = self.map.getLayersByName("highlite_targets")[0];
                        var c = self.map.getCenter();
                        markerfeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(c.lon, c.lat));
                        markerfeature.attributes = {'description':'SEARCH_RESULT'};
                        markerfeature.style = {
                          'pointRadius': "50", // markerContext.getSize(feature[0]),
                          'fillOpacity': "0.3", // markerContext.getOpacity(feature[0]),
                          'fillColor': "#ff0000", //markerContext.getColor(feature[0]),
                          'strokeColor': "#ff0000", // markerContext.getColor(feature[0]),
                          'strokeWidth': 1,
                          'strokeOpacity': 0.6
                        };
                        markerlayer.addFeatures([markerfeature]);
                        markerfeature.TimerID = setInterval(function() {shrinkMarker(markerfeature)}, 80);
                        markerlayer.display(true);
                        markerlayer.redraw();
                        return false
                    }
                )
            }
            after_click($new_link, d[i])
        }
    }
});
