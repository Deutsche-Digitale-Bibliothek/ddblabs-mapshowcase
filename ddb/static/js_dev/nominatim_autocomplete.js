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

$(function() {
    $("#nominatimresultlist").slideUp();
    $("#nominatimresultlist").on( 'click', ".nominatim-listitem", function() {
        var lat = $(this)[0].attributes.getNamedItem('lat').nodeValue;
        var lon = $(this)[0].attributes.getNamedItem('lon').nodeValue;
        DDB.map.setCenter(
           new OpenLayers.LonLat( lon, lat).transform(
              new OpenLayers.Projection("EPSG:4326"),
              DDB.map.getProjectionObject()
           ), 13);
        $("#nominatimresultlist").slideUp();
    });
    $("#nominatimbutton").click(function () {
        var geoCodeURL = DDB.globals['nominatim_url']
        var query = $('#nominatiminput').prop('value');
        $('#ajax-loader').fadeIn(50);
        $.ajax({
            url: geoCodeURL,
            data: {
                limit: 10,
                format: "json",
                email: "info@webgis.de",
                viewbox: "7.7447, 51.6721, 10.252, 49.3856",
                bounded: 1,
                q: query
            },
            success: function (data) {
                console.log(data);
                $('#ajax-loader').fadeOut(50);
                $('#nominatimresultlist').empty()
                $.map(data, function (item) {
                    $('#nominatimresultlist').append('<li class="nominatim-listitem" lat=\'' + item.lat + '\' lon=\'' + item.lon + ' \'>' + item.display_name + '</li>');
                });
                $('#nominatimresultlist').slideDown();
            }
        })
    });
});
